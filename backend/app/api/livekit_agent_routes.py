from fastapi import APIRouter
import asyncio

from app.services.livekit_agent import start_livekit_agent
from app.services.livekit_service import create_room_token
import os

router = APIRouter()


@router.get("/start-agent")
async def start_agent():

    room_name = "test-room"

    token = create_room_token("ai-agent", room_name)

    asyncio.create_task(
        start_livekit_agent(token, os.getenv("LIVEKIT_URL"))
    )

    return {"status": "AI agent started"}