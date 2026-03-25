import asyncio
from livekit import rtc

from app.services.agent_service import run_ai_agent


async def start_livekit_agent(token: str, url: str):

    room = rtc.Room()

    await room.connect(url, token)

    print("AI Agent connected to room")

    # simulate AI speaking
    result = await run_ai_agent()

    print("AI says:", result["text"])

    # NOTE: real audio streaming comes later
    await asyncio.sleep(5)

    await room.disconnect()