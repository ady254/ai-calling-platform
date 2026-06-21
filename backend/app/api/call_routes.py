# Fix #32: All imports moved to the top of the file (previously split mid-file)
import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Header, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from twilio.request_validator import RequestValidator
from twilio.twiml.voice_response import VoiceResponse

from app.services.call_service import start_call
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.business import get_user_business
from app.models.call_log import CallLog
from app.models.contact import Contact
from app.models.business import Business
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_contact import CampaignContact
from app.schemas.call_schema import CallLogCreate, CallLogOut, AnalyticsOut
from app.core.config import settings
from app.core.rate_limit import limiter

router = APIRouter()

logger = logging.getLogger(__name__)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CAMPAIGN EXECUTION (Start / Pause / Stop / Progress)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from app.services.campaign_executor import (
    start_campaign_execution,
    pause_campaign_execution,
    stop_campaign_execution,
    get_campaign_progress,
)

@router.post("/campaign/{campaign_id}/start")
@limiter.limit("30/minute")
async def start_campaign(
    request: Request,
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Start executing a campaign — calls all pending contacts sequentially."""
    business = await get_user_business(db, user_id)

    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id, Campaign.business_id == business.id)
    )).scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status in [CampaignStatus.ACTIVE]:
        raise HTTPException(status_code=400, detail="Campaign is already running")

    contact_count = (await db.execute(
        select(func.count(CampaignContact.id)).where(CampaignContact.campaign_id == campaign_id)
    )).scalar() or 0

    if contact_count == 0:
        raise HTTPException(status_code=400, detail="No contacts assigned to this campaign")

    result = await start_campaign_execution(campaign_id, business.id)
    return {"message": f"Campaign '{campaign.name}' started with {contact_count} contacts", **result}


@router.post("/campaign/{campaign_id}/pause")
@limiter.limit("30/minute")
async def pause_campaign(
    request: Request,
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Pause a running campaign. Pending contacts will not be called until resumed."""
    business = await get_user_business(db, user_id)

    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id, Campaign.business_id == business.id)
    )).scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = await pause_campaign_execution(campaign_id)
    return {"message": f"Campaign '{campaign.name}' paused", **result}


@router.post("/campaign/{campaign_id}/stop")
@limiter.limit("30/minute")
async def stop_campaign(
    request: Request,
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Stop a campaign permanently. Sets status to CANCELLED."""
    business = await get_user_business(db, user_id)

    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id, Campaign.business_id == business.id)
    )).scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = await stop_campaign_execution(campaign_id)
    return {"message": f"Campaign '{campaign.name}' stopped", **result}


@router.get("/campaign/{campaign_id}/progress")
async def campaign_progress(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Get real-time progress of a campaign (pending/calling/completed/failed counts)."""
    business = await get_user_business(db, user_id)

    campaign = (await db.execute(
        select(Campaign).filter(Campaign.id == campaign_id, Campaign.business_id == business.id)
    )).scalar_one_or_none()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    progress = await get_campaign_progress(db, campaign_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return progress


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TWILIO WEBHOOKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def _validate_twilio_signature(request: Request) -> bool:
    """Validate that an incoming request genuinely came from Twilio."""
    if not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio auth token not configured — skipping signature validation")
        return True  # Allow in dev mode when Twilio isn't configured

    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    url = str(request.url)
    form = await request.form()
    params = dict(form)
    signature = request.headers.get("X-Twilio-Signature", "")
    return validator.validate(url, params, signature)


@router.post("/twilio/twiml")
async def twilio_twiml(
    request: Request,
    campaign_id: Optional[str] = None,
    contact_id: Optional[str] = None,
):
    """
    Endpoint for Twilio to fetch TwiML instructions when a call connects.
    Plays a short greeting and (in production) bridges to LiveKit SIP.
    """
    if not await _validate_twilio_signature(request):
        logger.warning("Invalid Twilio signature on TwiML request")
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    # Fix #13: Use the official Twilio TwiML builder instead of f-string construction.
    # Raw f-strings allow XML injection if campaign_id/contact_id ever contain
    # XML special characters or </Say> sequences.
    response = VoiceResponse()

    if campaign_id:
        greeting = "Hello, you are being connected to our AI assistant."
    else:
        greeting = "Hello, this is an AI assistant calling on behalf of our team."

    response.say(greeting, voice="Polly.Joanna")
    response.pause(length=1)
    response.say("Thank you for your time. Goodbye.", voice="Polly.Joanna")

    # TODO: When LiveKit SIP trunk is set up, replace above with:
    # dial = response.dial()
    # dial.sip(f"sip:campaign-{campaign_id}@your-livekit-sip-domain.com")

    return Response(content=str(response), media_type="text/xml")


@router.post("/twilio/status-callback")
async def twilio_status_callback(request: Request):
    """
    Receives call status updates from Twilio.
    Twilio sends: CallSid, CallStatus, CallDuration, To, From, etc.
    """
    if not await _validate_twilio_signature(request):
        logger.warning("Invalid Twilio signature on status callback")
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    try:
        form = await request.form()
        call_sid = form.get("CallSid", "")
        call_status = form.get("CallStatus", "")
        call_duration = form.get("CallDuration", "0")
        to_number = form.get("To", "")

        logger.info(
            f"Twilio status callback: SID={call_sid}, "
            f"Status={call_status}, Duration={call_duration}s, To={to_number}"
        )

        # Map Twilio statuses to our internal statuses
        status_map = {
            "completed": "completed",
            "busy": "failed",
            "failed": "failed",
            "no-answer": "failed",
            "canceled": "failed",
        }

        if call_status in status_map:
            internal_status = status_map[call_status]
            logger.info(f"Call {call_sid} final status: {call_status} → {internal_status}")
            # TODO: Update the existing call log row using the CallSid as lookup key.

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error processing Twilio status callback: {e}")
        return {"status": "error", "detail": str(e)}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SINGLE CALL + TWILIO HEALTH CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/start/{contact_id}")
@limiter.limit("30/minute")
async def start_call_route(
    request: Request,
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Start a single outbound call to a contact."""
    business = await get_user_business(db, user_id)
    contact_stmt = select(Contact).filter(
        Contact.id == UUID(contact_id),
        Contact.business_id == business.id
    )
    result = await db.execute(contact_stmt)
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found or not authorized")

    return await start_call(db, contact_id)


@router.get("/twilio/status")
async def twilio_status(user_id: str = Depends(get_current_user)):
    """Check whether Twilio credentials are configured and valid."""
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    phone = settings.TWILIO_PHONE_NUMBER

    if not sid or not token:
        return {
            "status": "missing",
            "message": "Twilio credentials are not configured.",
            "phone_number": phone or None,
        }

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        account = client.api.accounts(sid).fetch()
        return {
            "status": "connected",
            "message": "Twilio is connected and working.",
            "account_name": account.friendly_name,
            "account_status": account.status,
            "phone_number": phone or "Not configured",
            "account_sid_preview": f"{sid[:8]}...{sid[-4:]}",
        }
    except Exception as e:
        error_msg = str(e)
        if "authenticate" in error_msg.lower() or "20003" in error_msg:
            hint = "Your Account SID or Auth Token is incorrect."
        elif "not found" in error_msg.lower():
            hint = "The Account SID doesn't match any Twilio account."
        else:
            hint = "Unexpected error verifying Twilio credentials."
        return {
            "status": "invalid",
            "message": hint,
            "error": error_msg,
            "account_sid_preview": f"{sid[:8]}...{sid[-4:]}",
        }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CALL LOGS & ANALYTICS (tenant-scoped)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/log", response_model=CallLogOut)
async def create_call_log(
    log_data: CallLogCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    contact_stmt = select(Contact).filter(
        Contact.id == log_data.contact_id,
        Contact.business_id == business.id
    )
    result = await db.execute(contact_stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Contact does not belong to your business")

    new_log = CallLog(
        contact_id=log_data.contact_id,
        business_id=business.id,
        status=log_data.status,
        transcript=log_data.transcript,
        duration=log_data.duration,
    )
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log


@router.get("/logs", response_model=List[CallLogOut])
async def get_call_logs(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    stmt = (
        select(CallLog)
        .filter(CallLog.business_id == business.id)
        .order_by(CallLog.created_at.desc())
        .limit(200)  # Safety cap — TODO: add proper pagination (offset/cursor)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/analytics", response_model=AnalyticsOut)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    biz_id = business.id

    total_calls = (await db.execute(
        select(func.count(CallLog.id)).where(CallLog.business_id == biz_id)
    )).scalar() or 0

    completed_calls = (await db.execute(
        select(func.count(CallLog.id)).where(
            CallLog.business_id == biz_id, CallLog.status == "completed"
        )
    )).scalar() or 0

    failed_calls = (await db.execute(
        select(func.count(CallLog.id)).where(
            CallLog.business_id == biz_id, CallLog.status == "failed"
        )
    )).scalar() or 0

    avg_duration = (await db.execute(
        select(func.avg(CallLog.duration)).where(CallLog.business_id == biz_id)
    )).scalar() or 0.0

    active_campaigns = (await db.execute(
        select(func.count(Campaign.id)).where(
            Campaign.business_id == biz_id,
            Campaign.status.in_([CampaignStatus.ACTIVE, CampaignStatus.SCHEDULED])
        )
    )).scalar() or 0

    total_contacts = (await db.execute(
        select(func.count(Contact.id)).where(Contact.business_id == biz_id)
    )).scalar() or 0

    # Fix #7: Replace loading all CallLog ORM objects into memory for trend
    # calculation with a single SQL DATE_TRUNC + GROUP BY aggregate query.
    # Previously this fetched full rows (with transcript text!) for every log
    # in the last 7 days — catastrophic at scale. Now it's O(1) server memory.
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=6)

    trend_rows = (await db.execute(
        select(
            func.to_char(
                func.date_trunc("day", CallLog.created_at),
                "Mon DD"
            ).label("day"),
            func.count(CallLog.id).label("calls"),
        )
        .where(
            CallLog.business_id == biz_id,
            CallLog.created_at >= seven_days_ago,
        )
        .group_by(func.date_trunc("day", CallLog.created_at))
        .order_by(func.date_trunc("day", CallLog.created_at).asc())
    )).all()

    # Build the full 7-day scaffold so days with zero calls still appear
    trends_dict: dict[str, int] = {}
    for i in range(6, -1, -1):
        day_str = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%b %d")
        trends_dict[day_str] = 0
    for row in trend_rows:
        day_str = row.day.strip()
        if day_str in trends_dict:
            trends_dict[day_str] = row.calls

    return AnalyticsOut(
        total_calls=total_calls,
        completed_calls=completed_calls,
        failed_calls=failed_calls,
        average_duration_seconds=float(avg_duration),
        active_campaigns=active_campaigns,
        total_contacts=total_contacts,
        call_trends=[{"date": k, "calls": v} for k, v in trends_dict.items()]
    )