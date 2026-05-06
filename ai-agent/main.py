import asyncio
import logging
import json
import aiohttp
from dotenv import load_dotenv
from livekit.agents import AgentSession, Agent, JobContext, WorkerOptions, cli, RoomInputOptions
from livekit.plugins import google, deepgram, silero, elevenlabs
import os
from livekit.rtc import RoomEvent

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

class MyAgent(Agent):
    def __init__(self, instructions: str):
        super().__init__(instructions=instructions)
        self.transcript = []

    async def on_response(self, response):
        print("AI Response:", response)
        self.transcript.append(f"AI: {response}")
        return response

async def fetch_campaign(campaign_id: str):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/agent/internal/campaign/{campaign_id}") as resp:
                if resp.status == 200:
                    return await resp.json()
    except Exception as e:
        logger.error(f"Failed to fetch campaign: {e}")
    return None

async def save_call_log(contact_id: str, transcript: str, duration: int):
    try:
        async with aiohttp.ClientSession() as session:
            await session.post(f"{BACKEND_URL}/agent/internal/call_log", json={
                "contact_id": contact_id,
                "status": "completed",
                "transcript": transcript,
                "duration": duration
            })
    except Exception as e:
        logger.error(f"Failed to save call log: {e}")

async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    metadata_str = ""
    for p in ctx.room.remote_participants.values():
        if p.metadata:
            metadata_str = p.metadata
            break
            
    campaign_id = None
    contact_id = None
    if metadata_str:
        try:
            metadata = json.loads(metadata_str)
            campaign_id = metadata.get("campaign_id")
            contact_id = metadata.get("contact_id")
        except:
            pass

    instructions = (
        "You are a helpful AI assistant. Keep your answers brief."
    )
    voice_id = "qtqlHrXyBpEXHx2JBPgx" 
    greeting = "Hello, how can I help you today?"

    if campaign_id:
        logger.info(f"Fetching campaign config for: {campaign_id}")
        campaign = await fetch_campaign(campaign_id)
        if campaign:
            instructions = campaign.get("ai_prompt", instructions)
            if campaign.get("ai_voice"):
                voice_id = campaign.get("ai_voice")
            greeting = f"Hi, I am calling about {campaign.get('name')}."
            
    my_agent = MyAgent(instructions=instructions)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=elevenlabs.TTS(
            model="eleven_multilingual_v2",
            voice_id=voice_id,
            api_key=os.getenv("ELEVEN_API_KEY")
        ),
        allow_interruptions=False
    )

    start_time = asyncio.get_event_loop().time()

    await session.start(
        room=ctx.room,
        agent=my_agent,
        room_input_options=RoomInputOptions(),
    )

    logger.info("Agent joined and is now listening.")
    await session.say(greeting)

    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        logger.info(f"Participant disconnected: {participant.identity}")
        end_time = asyncio.get_event_loop().time()
        duration = int(end_time - start_time)
        full_transcript = "\n".join(my_agent.transcript)
        logger.info("Saving call log...")
        asyncio.create_task(save_call_log(contact_id, full_transcript, duration))

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))