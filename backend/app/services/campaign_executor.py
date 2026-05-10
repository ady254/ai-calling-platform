"""
Campaign execution engine.

Processes campaign contacts sequentially using FastAPI BackgroundTasks.
Each contact gets: Twilio outbound call → LiveKit room → AI agent conversation.

No external queue dependency needed — uses asyncio for async processing.
For horizontal scaling later, swap this for ARQ/Celery workers.
"""
import asyncio
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_contact import CampaignContact, CampaignContactStatus
from app.models.contact import Contact
from app.models.call_log import CallLog
from app.services.twilio_service import make_outbound_call

logger = logging.getLogger(__name__)

# Track running campaign tasks so we can cancel them
_running_campaigns: dict[str, asyncio.Task] = {}


async def start_campaign_execution(campaign_id: UUID, business_id: UUID):
    """
    Launch a background task that processes all pending contacts in a campaign.
    Calls are made sequentially with a configurable concurrency limit.
    """
    campaign_key = str(campaign_id)

    if campaign_key in _running_campaigns and not _running_campaigns[campaign_key].done():
        logger.warning(f"Campaign {campaign_key} is already running")
        return {"status": "already_running"}

    task = asyncio.create_task(_process_campaign(campaign_id, business_id))
    _running_campaigns[campaign_key] = task

    logger.info(f"Campaign {campaign_key} execution started")
    return {"status": "started"}


async def pause_campaign_execution(campaign_id: UUID):
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


async def stop_campaign_execution(campaign_id: UUID):
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


async def get_campaign_progress(db: AsyncSession, campaign_id: UUID):
    """Get real-time progress of a campaign."""
    from sqlalchemy import func

    # Get campaign
    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id)
    )).scalar_one_or_none()

    if not campaign:
        return None

    # Count contacts by status
    status_counts = {}
    for s in CampaignContactStatus:
        count = (await db.execute(
            select(func.count(CampaignContact.id)).where(
                CampaignContact.campaign_id == campaign_id,
                CampaignContact.call_status == s
            )
        )).scalar() or 0
        status_counts[s.value] = count

    total = sum(status_counts.values())
    completed = status_counts.get("completed", 0)
    failed = status_counts.get("failed", 0)
    calling = status_counts.get("calling", 0)
    pending = status_counts.get("pending", 0)

    is_running = str(campaign_id) in _running_campaigns and not _running_campaigns[str(campaign_id)].done()

    return {
        "campaign_id": str(campaign_id),
        "campaign_status": campaign.status.value if hasattr(campaign.status, 'value') else campaign.status,
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

async def _process_campaign(campaign_id: UUID, business_id: UUID):
    """
    Core campaign loop. Iterates through pending contacts and calls each one.
    Runs as an asyncio background task.
    """
    logger.info(f"Processing campaign {campaign_id}")

    try:
        async with AsyncSessionLocal() as db:
            # Set campaign to ACTIVE
            await db.execute(
                update(Campaign)
                .where(Campaign.id == campaign_id)
                .values(status=CampaignStatus.ACTIVE)
            )
            await db.commit()

        while True:
            # Check if task was cancelled
            if asyncio.current_task().cancelled():
                logger.info(f"Campaign {campaign_id} was cancelled")
                return

            # Fetch next pending contact
            async with AsyncSessionLocal() as db:
                stmt = (
                    select(CampaignContact)
                    .filter(
                        CampaignContact.campaign_id == campaign_id,
                        CampaignContact.call_status == CampaignContactStatus.PENDING
                    )
                    .order_by(CampaignContact.created_at.asc())
                    .limit(1)
                )
                result = await db.execute(stmt)
                cc = result.scalar_one_or_none()

                if not cc:
                    logger.info(f"Campaign {campaign_id}: no more pending contacts")
                    break

                # Mark as CALLING
                cc.call_status = CampaignContactStatus.CALLING
                cc.called_at = datetime.now(timezone.utc)
                await db.commit()

                contact_id = cc.contact_id

            # Process this contact
            await _call_single_contact(campaign_id, business_id, contact_id)

            # Brief delay between calls (rate limiting for Twilio)
            await asyncio.sleep(2)

        # All done — mark campaign completed
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
        logger.error(f"Campaign {campaign_id} failed: {e}")
        async with AsyncSessionLocal() as db:
            await db.execute(
                update(Campaign)
                .where(Campaign.id == campaign_id)
                .values(status=CampaignStatus.PAUSED)
            )
            await db.commit()
    finally:
        _running_campaigns.pop(str(campaign_id), None)


async def _call_single_contact(campaign_id: UUID, business_id: UUID, contact_id: UUID):
    """Process a single contact: make outbound call via Twilio."""
    async with AsyncSessionLocal() as db:
        # Fetch the contact
        contact = (await db.execute(
            select(Contact).filter(Contact.id == contact_id)
        )).scalar_one_or_none()

        if not contact or not contact.phone_number:
            logger.warning(f"Skipping contact {contact_id}: no phone number")
            await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.SKIPPED)
            return

        try:
            # Make the Twilio call with campaign context
            call_result = make_outbound_call(
                to_number=contact.phone_number,
                campaign_id=str(campaign_id),
                contact_id=str(contact_id),
            )

            if call_result.get("status") == "initiated":
                # Call was placed — log it
                call_log = CallLog(
                    contact_id=contact_id,
                    campaign_id=campaign_id,
                    business_id=business_id,
                    status="started",
                )
                db.add(call_log)
                await db.commit()

                # Mark contact as completed (Twilio webhook will update with real status later)
                await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.COMPLETED)
                logger.info(f"Call placed to {contact.phone_number} — SID: {call_result.get('sid')}")

            elif call_result.get("status") == "simulated":
                # No Twilio creds — mark as completed for testing
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
            logger.error(f"Error calling contact {contact_id}: {e}")
            await _update_contact_status(campaign_id, contact_id, CampaignContactStatus.FAILED)


async def _update_contact_status(campaign_id: UUID, contact_id: UUID, status: CampaignContactStatus):
    """Update a CampaignContact's call_status."""
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(CampaignContact)
            .where(
                CampaignContact.campaign_id == campaign_id,
                CampaignContact.contact_id == contact_id
            )
            .values(call_status=status)
        )
        await db.commit()
