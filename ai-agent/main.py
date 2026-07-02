import asyncio
import logging
import json
import aiohttp
from dotenv import load_dotenv
from livekit.agents import AgentSession, Agent, JobContext, WorkerOptions, cli, RoomInputOptions
from livekit.plugins import google, deepgram, silero, elevenlabs
from livekit.plugins.elevenlabs.tts import VoiceSettings
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "dev-internal-key-change-me")


class MyAgent(Agent):
    def __init__(self, instructions: str):
        super().__init__(instructions=instructions)
        # Transcript is populated by on_user_input / on_agent_reply hooks below
        self.transcript: list[str] = []


async def fetch_campaign(campaign_id: str, contact_id: str | None = None) -> dict | None:
    try:
        headers = {"X-Internal-Key": INTERNAL_API_KEY}
        params = {"contact_id": contact_id} if contact_id else {}
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_URL}/agent/internal/campaign/{campaign_id}",
                headers=headers,
                params=params,
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.warning(f"Campaign fetch returned {resp.status}")
    except Exception as e:
        logger.error(f"Failed to fetch campaign: {e}")
    return None


async def save_call_log(
    contact_id: str | None,
    campaign_id: str | None,
    transcript: str,
    duration: int,
) -> None:
    # Fix #2: Guard against None IDs — backend would crash on UUID(None)
    if not contact_id or not campaign_id:
        logger.warning(
            "save_call_log: missing contact_id or campaign_id — skipping log save. "
            f"contact_id={contact_id}, campaign_id={campaign_id}"
        )
        return

    try:
        headers = {"X-Internal-Key": INTERNAL_API_KEY}
        async with aiohttp.ClientSession() as session:
            # Fix #2: Properly await the response and check status
            async with session.post(
                f"{BACKEND_URL}/agent/internal/call_log",
                headers=headers,
                json={
                    "contact_id": contact_id,
                    "campaign_id": campaign_id,
                    "status": "completed",
                    "transcript": transcript,
                    "duration": duration,
                },
            ) as resp:
                if resp.status != 200:
                    body = await resp.text()
                    logger.error(
                        f"Call log save returned HTTP {resp.status}: {body}"
                    )
                else:
                    logger.info("Call log saved successfully")
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

    campaign_id: str | None = None
    contact_id: str | None = None

    if metadata_str:
        # Fix #3: Replace bare `except: pass` with specific exception types
        try:
            metadata = json.loads(metadata_str)
            campaign_id = metadata.get("campaign_id")
            contact_id = metadata.get("contact_id")
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.warning(f"Failed to parse participant metadata: {e}. Raw: {metadata_str!r}")

    # Twilio-originated SIP calls carry no participant metadata (Twilio doesn't
    # set it), so the backend encodes campaign/contact context in the room name
    # instead: "call-<campaign_id>-<contact_id>" (see call_routes.py twilio_twiml).
    # UUIDs are a fixed 36 chars, which lets us slice them out even though they
    # contain hyphens themselves.
    if not campaign_id and ctx.room.name.startswith("call-"):
        remainder = ctx.room.name[len("call-"):]
        UUID_LEN = 36
        if len(remainder) >= UUID_LEN:
            campaign_id = remainder[:UUID_LEN]
            rest = remainder[UUID_LEN:]
            if rest.startswith("-") and len(rest) - 1 >= UUID_LEN:
                contact_id = rest[1:1 + UUID_LEN]
            logger.info(f"Parsed from room name: campaign_id={campaign_id}, contact_id={contact_id}")

    instructions = "You are a helpful AI assistant. Keep your answers brief."
    voice_id = "qtqlHrXyBpEXHx2JBPgx"
    greeting = "Hello, how can I help you today?"
    stability = 0.5
    similarity_boost = 0.75

    if campaign_id:
        logger.info(f"Fetching campaign config for: {campaign_id}")
        campaign = await fetch_campaign(campaign_id, contact_id)
        if campaign:
            # ai_prompt already has {{variables}} rendered server-side
            # (see /agent/internal/campaign in the backend) using this
            # contact's custom_fields (e.g. doctor_name, appointment_date).
            instructions = campaign.get("ai_prompt", instructions)
            if campaign.get("ai_voice"):
                voice_id = campaign.get("ai_voice")

            stability = campaign.get("stability", stability)
            similarity_boost = campaign.get("similarity_boost", similarity_boost)

            contact_name = (campaign.get("variables") or {}).get("name")
            if contact_name:
                greeting = f"Hi {contact_name}, I am calling about {campaign.get('campaign_name')}."
            else:
                greeting = f"Hi, I am calling about {campaign.get('campaign_name')}."

    my_agent = MyAgent(instructions=instructions)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=elevenlabs.TTS(
            model="eleven_multilingual_v2",
            voice_id=voice_id,
            api_key=os.getenv("ELEVEN_API_KEY"),
            voice_settings=VoiceSettings(
                stability=stability,
                similarity_boost=similarity_boost,
            ),
        ),
        allow_interruptions=False,
    )

    # Fix #25: Use get_running_loop() — get_event_loop() is deprecated in Python 3.10+
    start_time = asyncio.get_running_loop().time()

    # Fix #26: Wire transcript collection from session events
    @session.on("user_speech_committed")
    def on_user_speech(user_msg):
        text = getattr(user_msg, "content", str(user_msg))
        if text:
            my_agent.transcript.append(f"User: {text}")

    @session.on("agent_speech_committed")
    def on_agent_speech(agent_msg):
        text = getattr(agent_msg, "content", str(agent_msg))
        if text:
            my_agent.transcript.append(f"Agent: {text}")

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
        # Fix #25: get_running_loop() is the correct async-safe API
        end_time = asyncio.get_running_loop().time()
        duration = int(end_time - start_time)
        full_transcript = "\n".join(my_agent.transcript)
        logger.info(f"Saving call log. Duration={duration}s, transcript_lines={len(my_agent.transcript)}")
        asyncio.create_task(
            save_call_log(contact_id, campaign_id, full_transcript, duration)
        )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))