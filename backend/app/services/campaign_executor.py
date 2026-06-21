"""
Campaign execution engine.

Processes campaign contacts sequentially using asyncio background tasks.
Each contact gets: Twilio outbound call → LiveKit room → AI agent conversation.

TECH DEBT (#5 / #27): This engine uses a process-local in-memory dict
(`_running_campaigns`) to track running asyncio.Tasks. This means:
  - Restarting the process loses all running state. Contacts stuck in
    CALLING status must be recovered manually (see `recover_orphaned_contacts`).
  - Multiple worker replicas cannot share state — pause/stop hits only one.
  - The included ARQ worker (app/worker.py) is the intended replacement for
    this approach. Migration path:
      1. Create an ARQ task `process_campaign_task(campaign_id, business_id)`
      2. Enqueue it via `arq.create_pool(RedisSettings(...))` on start
      3. Pause/stop: set a Redis flag keyed by campaign_id; the worker polls it
      4. Remove _running_campaigns and this module's asyncio.create_task usage
"""
import asyncio
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_contact import CampaignContact, CampaignContactStatus
from app.models.contact import Contact
from app.models.call_log import CallLog
from app.services.twilio_service import make_outbound_call

logger = logging.getLogger(__name__)

# Track running campaign tasks so we can cancel them.
# NOTE: This is process-local. See TECH DEBT note above.
_running_campaigns: dict[str, asyncio.Task] = {}


async def recover_orphaned_contacts() -> None:
    """
    Reset any CampaignContacts stuck in CALLING status back to PENDING.
    Should be called at application startup to recover from a crash/restart.
    This prevents contacts from being permanently orphaned after a process restart.
    """
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            update(CampaignContact)
            .where(CampaignContact.call_status == CampaignContactStatus.CALLING)
            .values(call_status=CampaignContactStatus.PENDING)
            .returning(CampaignContact.id)
        )
        recovered = len(result.fetchall())
        if recovered:
            logger.warning(
                f"Startup recovery: reset {recovered} orphaned CALLING contacts → PENDING"
            )
        await db.commit()


async def start_campaign_execution(campaign_id: UUID, business_id: UUID) -> dict:
    """
    Launch a background task that processes all pending contacts in a campaign.
    Calls are made sequentially with a configurable delay between each.
    """
    campaign_key = str(campaign_id)

    if campaign_key in _running_campaigns and not _running_campaigns[campaign_key].done():
        logger.warning(f"Campaign {campaign_key} is already running")
        return {"status": "already_running"}

    task = asyncio.create_task(_process_campaign(campaign_id, business_id))
    _running_campaigns[campaign_key] = task

    logger.info(f"Campaign {campaign_key} execution started")
    return {"status": "started"}


async def pause_campaign_execution(campaign_id: UUID) -> dict:
    """Cancel the running background task and set status to PAUSED."""
    campaign_key = str(campaign_id)

    if campaign_key in _running_campaigns and not _running_campaigns[campaign_key].done():
        _running_campaigns[campaign_key].cancel()
        del _running_campaigns[campaign_key]

    async with AsyncSessionLocal() as db:
        await db.execute(
            update(Campaign)
            .where(Campaign.id == campaign_id)
            .values(status=CampaignStatus.PAUSED)
        )
        await db.commit()

    logger.info(f"Campaign {campaign_key} paused")
    return {"status": "paused"}


async def stop_campaign_execution(campaign_id: UUID) -> dict:
    """Cancel the running background task and set status to CANCELLED."""
    campaign_key = str(campaign_id)

    if campaign_key in _running_campaigns and not _running_campaigns[campaign_key].done():
        _running_campaigns[campaign_key].cancel()
        del _running_campaigns[campaign_key]

    async with AsyncSessionLocal() as db:
        await db.execute(
            update(Campaign)
            .where(Campaign.id == campaign_id)
            .values(status=CampaignStatus.CANCELLED)
        )
        await db.commit()

    logger.info(f"Campaign {campaign_key} stopped/cancelled")
    return {"status": "cancelled"}


async def get_campaign_progress(db: AsyncSession, campaign_id: UUID) -> dict | None:
    """Get real-time progress of a campaign."""

    # Get campaign
    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id)
    )).scalar_one_or_none()

    if not campaign:
        return None

    # Fix #6: Replace N+1 per-enum queries with a single GROUP BY query.
    # Previously this ran one SELECT per enum value (5 queries); now it's 1.
    rows = (await db.execute(
        select(CampaignContact.call_status, func.count(CampaignContact.id))
        .where(CampaignContact.campaign_id == campaign_id)
        .group_by(CampaignContact.call_status)
    )).all()

    status_counts: dict[str, int] = {row[0].value: row[1] for row in rows}

    total = sum(status_counts.values())
    completed = status_counts.get("completed", 0)
    failed = status_counts.get("failed", 0)
    calling = status_counts.get("calling", 0)
    pending = status_counts.get("pending", 0)

    is_running = (
        str(campaign_id) in _running_campaigns
        and not _running_campaigns[str(campaign_id)].done()
    )

    return {
        "campaign_id": str(campaign_id),
        "campaign_status": campaign.status.value if hasattr(campaign.status, "value") else campaign.status,
        "is_running": is_running,
        "total_contacts": total,
        "pending": pending,
        "calling": calling,
        "completed": completed,
        "failed": failed,
        "skipped": status_counts.get("skipped", 0),
        "progress_percent": round((completed + failed) / total * 100, 1) if total > 0 else 0,
    }


# ── Internal: campaign processing loop ──

async def _process_campaign(campaign_id: UUID, business_id: UUID) -> None:
    """
    Core campaign loop. Iterates through pending contacts and calls each one.
    Runs as an asyncio background task.
    """
    logger.info(f"Processing campaign {campaign_id}")

    try:
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(Campaign)
                .where(Campaign.id == campaign_id)
                .values(status=CampaignStatus.ACTIVE)
            )
            await db.commit()

        while True:
            if asyncio.current_task().cancelled():
                logger.info(f"Campaign {campaign_id} was cancelled")
                return

            async with AsyncSessionLocal() as db:
                stmt = (
                    select(CampaignContact)
                    .filter(
                        CampaignContact.campaign_id == campaign_id,
                        CampaignContact.call_status == CampaignContactStatus.PENDING,
                    )
                    .order_by(CampaignContact.created_at.asc())
                    .limit(1)
                )
                result = await db.execute(stmt)
                cc = result.scalar_one_or_none()

                if not cc:
                    logger.info(f"Campaign {campaign_id}: no more pending contacts")
                    break

                cc.call_status = CampaignContactStatus.CALLING
                cc.called_at = datetime.now(timezone.utc)
                await db.commit()

                contact_id = cc.contact_id

            await _call_single_contact(campaign_id, business_id, contact_id)

            # Brief delay between calls (Twilio rate limiting)
            await asyncio.sleep(2)

        async with AsyncSessionLocal() as db:
            await db.execute(
                update(Campaign)
                .where(Campaign.id == campaign_id)
                .values(status=CampaignStatus.COMPLETED)
            )
            await db.commit()

        logger.info(f"Campaign {campaign_id} completed successfully")

    except asyncio.CancelledError:
        logger.info(f"Campaign {campaign_id} task was cancelled")
        raise
    except Exception as e:
        logger.error(f"Campaign {campaign_id} failed: {e}", exc_info=True)
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(Campaign)
                .where(Campaign.id == campaign_id)
                .values(status=CampaignStatus.PAUSED)
            )
            await db.commit()
    finally:
        _running_campaigns.pop(str(campaign_id), None)


async def _call_single_contact(
    campaign_id: UUID, business_id: UUID, contact_id: UUID
) -> None:
    """Process a single contact: make outbound call via Twilio."""
    async with AsyncSessionLocal() as db:
        contact = (await db.execute(
            select(Contact).filter(Contact.id == contact_id)
        )).scalar_one_or_none()

        if not contact or not contact.phone_number:
            logger.warning(f"Skipping contact {contact_id}: no phone number")
            await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.SKIPPED)
            return

        try:
            # Fix #8: Twilio SDK uses the synchronous `requests` library under
            # the hood. Running it directly blocks the asyncio event loop for
            # the duration of the HTTP call (200–800ms), freezing all concurrent
            # requests. asyncio.to_thread() offloads it to a thread pool.
            call_result = await asyncio.to_thread(
                make_outbound_call,
                to_number=contact.phone_number,
                campaign_id=str(campaign_id),
                contact_id=str(contact_id),
            )

            if call_result.get("status") == "initiated":
                call_log = CallLog(
                    contact_id=contact_id,
                    campaign_id=campaign_id,
                    business_id=business_id,
                    status="started",
                )
                db.add(call_log)
                await db.commit()

                await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.COMPLETED)
                logger.info(f"Call placed to {contact.phone_number} — SID: {call_result.get('sid')}")

            elif call_result.get("status") == "simulated":
                call_log = CallLog(
                    contact_id=contact_id,
                    campaign_id=campaign_id,
                    business_id=business_id,
                    status="simulated",
                )
                db.add(call_log)
                await db.commit()
                await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.COMPLETED)
                logger.info(f"Simulated call to {contact.phone_number}")

            else:
                await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.FAILED)
                logger.warning(f"Call failed to {contact.phone_number}: {call_result}")

        except Exception as e:
            logger.error(f"Error calling contact {contact_id}: {e}", exc_info=True)
            await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.FAILED)


async def _update_contact_status(
    campaign_id: UUID, contact_id: UUID, status: CampaignContactStatus
) -> None:
    """Update a CampaignContact's call_status."""
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(CampaignContact)
            .where(
                CampaignContact.campaign_id == campaign_id,
                CampaignContact.contact_id == contact_id,
            )
            .values(call_status=status)
        )
        await db.commit()
