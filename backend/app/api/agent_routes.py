from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.agent_service import run_ai_agent
from app.services.ai_service import clear_session

router = APIRouter()


class MessageInput(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class SessionInput(BaseModel):
    session_id: str


@router.post("/start")
async def start_agent(data: MessageInput):
    try:
        return await run_ai_agent(data.message, session_id=data.session_id)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        return {"error": str(e), "traceback": tb}


@router.post("/reset")
async def reset_session(data: SessionInput):
    clear_session(data.session_id)
    return {"status": "ok", "message": f"Session {data.session_id} cleared"}