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