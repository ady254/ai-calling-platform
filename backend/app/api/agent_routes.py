from fastapi import APIRouter
from pydantic import BaseModel
from app.services.agent_service import run_ai_agent

router = APIRouter()

class MessageInput(BaseModel):
    message: str


@router.post("/start")
async def start_agent(data: MessageInput):
    return await run_ai_agent(data.message)