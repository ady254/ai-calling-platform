from fastapi import APIRouter

from app.services.agent_service import run_ai_agent

router = APIRouter()


@router.get("/start")
async def start_agent():
    return await run_ai_agent()