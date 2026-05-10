import logging
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.agent_service import run_ai_agent
from app.services.ai_service import clear_session
from app.dependencies.auth import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class MessageInput(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class SessionInput(BaseModel):
    session_id: str


@router.post("/start")
async def start_agent(
    data: MessageInput,
    user_id: str = Depends(get_current_user)  # Now requires authentication
):
    """Process a message through the AI agent and return text + audio response."""
    try:
        logger.info(f"Agent request from user {user_id}: {data.message[:50]}...")
        return await run_ai_agent(data.message, session_id=data.session_id)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Agent error: {tb}")
        return {"error": str(e), "traceback": tb}


@router.post("/reset")
async def reset_session(
    data: SessionInput,
    user_id: str = Depends(get_current_user)  # Now requires authentication
):
    """Clear conversation history for a session."""
    clear_session(data.session_id)
    logger.info(f"Session {data.session_id} reset by user {user_id}")
    return {"status": "ok", "message": f"Session {data.session_id} cleared"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Internal Routes for AI Agent Worker
# Protected with a shared INTERNAL_API_KEY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from app.services.campaign_service import get_campaign
from app.dependencies.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID


def verify_internal_key(x_internal_key: str = Header(...)):
    """Verify the shared secret sent by the AI agent worker."""
    if x_internal_key != settings.INTERNAL_API_KEY:
        logger.warning("Rejected internal API call — invalid key")
        raise HTTPException(status_code=403, detail="Invalid internal API key")
    return True


@router.get("/internal/campaign/{campaign_id}")
async def get_campaign_for_agent(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    _auth: bool = Depends(verify_internal_key)
):
    """Internal route for AI Agent to fetch campaign details. Requires X-Internal-Key header."""
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


class InternalCallLogCreate(BaseModel):
    contact_id: Optional[str] = None
    campaign_id: Optional[str] = None
    status: str
    transcript: str
    duration: int

@router.post("/internal/call_log")
async def create_call_log_for_agent(
    data: InternalCallLogCreate,
    db: AsyncSession = Depends(get_db),
    _auth: bool = Depends(verify_internal_key)
):
    """Internal route for AI Agent to save call logs. Requires X-Internal-Key header."""
    from app.models.call_log import CallLog
    from app.models.contact import Contact
    import uuid
    from datetime import datetime, timezone

    # Resolve business_id from the contact if available
    business_id = None
    if data.contact_id:
        from sqlalchemy import select
        contact_stmt = select(Contact).filter(Contact.id == UUID(data.contact_id))
        result = await db.execute(contact_stmt)
        contact = result.scalar_one_or_none()
        if contact:
            business_id = contact.business_id

    new_log = CallLog(
        id=uuid.uuid4(),
        contact_id=UUID(data.contact_id) if data.contact_id else None,
        campaign_id=UUID(data.campaign_id) if data.campaign_id else None,
        business_id=business_id,
        status=data.status,
        transcript=data.transcript,
        duration=data.duration,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_log)
    await db.commit()
    return {"status": "ok"}