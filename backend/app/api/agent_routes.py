import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.agent_service import run_ai_agent
from app.services.ai_service import clear_session
from app.dependencies.auth import get_current_user

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


# --- Internal Routes for AI Agent ---

from app.services.campaign_service import get_campaign
from app.dependencies.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from fastapi import HTTPException

@router.get("/internal/campaign/{campaign_id}")
async def get_campaign_for_agent(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Internal route for AI Agent to fetch campaign details."""
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


class CallLogCreate(BaseModel):
    contact_id: Optional[str] = None
    status: str
    transcript: str
    duration: int

@router.post("/internal/call_log")
async def create_call_log_for_agent(
    data: CallLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """Internal route for AI Agent to save call logs."""
    from app.models.call_log import CallLog
    import uuid
    from datetime import datetime, timezone
    
    new_log = CallLog(
        id=uuid.uuid4(),
        contact_id=UUID(data.contact_id) if data.contact_id else None,
        status=data.status,
        transcript=data.transcript,
        duration=data.duration,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_log)
    await db.commit()
    return {"status": "ok"}