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


def _build_greeting(language: str, contact_name: str | None, campaign_name: str | None) -> str:
    """Localized opening line — spoken directly via TTS before the LLM is involved,
    so it can't rely on the LLM's language instruction to translate it."""
    templates = {
        "en": ("Hi {name}, I am calling about {campaign}.", "Hi, I am calling about {campaign}."),
        "es": ("Hola {name}, le llamo por {campaign}.", "Hola, le llamo por {campaign}."),
        "fr": ("Bonjour {name}, je vous appelle au sujet de {campaign}.", "Bonjour, je vous appelle au sujet de {campaign}."),
        "hi": ("Namaste {name}, main {campaign} ke baare mein baat karne ke liye call kar raha hoon.", "Namaste, main {campaign} ke baare mein baat karne ke liye call kar raha hoon."),
        "ar": ("مرحباً {name}، أتصل بك بخصوص {campaign}.", "مرحباً، أتصل بك بخصوص {campaign}."),
    }
    with_name, without_name = templates.get(language, templates["en"])
    template = with_name if contact_name else without_name
    return template.format(name=contact_name, campaign=campaign_name)


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

    # Appended to every campaign's ai_prompt: this is a live phone call whose
    # text is spoken by TTS verbatim, so markdown (**bold**) and stage
    # directions (*pause*) get read aloud as literal punctuation or bloat
    # reply length, both making speech sound unnatural and slower to start.
    PHONE_CALL_STYLE = (
        "\n\nThis is a live phone call. Reply in plain spoken sentences only: "
        "no markdown, no asterisks, no bullet points, no parenthetical stage "
        "directions. Keep each reply short (1-3 sentences) and conversational.\n\n"
        "Talk like a real person on the phone, not a script: use contractions "
        "(I'm, that's, we'll), start replies with a brief natural acknowledgment "
        "when it fits (Sure, Got it, Okay), and vary your phrasing instead of "
        "reusing the same stock lines. Avoid stiff customer-service phrases like "
        "'That's a good question' or 'I understand your concern.'"
    )

    instructions = "You are a helpful AI assistant. Keep your answers brief." + PHONE_CALL_STYLE
    voice_id = "qtqlHrXyBpEXHx2JBPgx"
    greeting = "Hello, how can I help you today?"
    # Lower stability = more natural pitch/pacing variation (closer to how a
    # real person talks); pushed too low it gets inconsistent, so 0.35-0.45
    # is the usual sweet spot. use_speaker_boost fills out the voice so it
    # doesn't sound thin/synthetic.
    stability = 0.4
    similarity_boost = 0.75
    language = "en"

    if campaign_id:
        logger.info(f"Fetching campaign config for: {campaign_id}")
        campaign = await fetch_campaign(campaign_id, contact_id)
        if campaign:
            # ai_prompt already has {{variables}} rendered server-side
            # (see /agent/internal/campaign in the backend) using this
            # contact's custom_fields (e.g. doctor_name, appointment_date).
            instructions = campaign.get("ai_prompt", instructions) + PHONE_CALL_STYLE
            if campaign.get("ai_voice"):
                voice_id = campaign.get("ai_voice")

            stability = campaign.get("stability", stability)
            similarity_boost = campaign.get("similarity_boost", similarity_boost)
            language = campaign.get("language") or "en"

            contact_name = (campaign.get("variables") or {}).get("name")
            campaign_name = campaign.get("campaign_name")
            greeting = _build_greeting(language, contact_name, campaign_name)

    # Deepgram's real-time nova-3 model (low-latency, needed for a live call)
    # only supports a subset of languages directly — "en" and "hi" are on
    # that list, but "ar" is not, so Arabic falls back to Deepgram's hosted
    # Whisper model instead. Whisper covers Arabic but isn't a streaming-first
    # model, so expect higher STT latency on Arabic calls than en/hi calls.
    LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "ar": "Arabic", "es": "Spanish", "fr": "French"}
    language_name = LANGUAGE_NAMES.get(language, "English")
    instructions += f"\n\nRespond only in {language_name}, regardless of the language used elsewhere in these instructions."

    if language == "ar":
        stt = deepgram.STT(model="whisper-large")
    else:
        stt = deepgram.STT(model="nova-3", language=language)

    my_agent = MyAgent(instructions=instructions)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=stt,
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=elevenlabs.TTS(
            model="eleven_turbo_v2_5",
            voice_id=voice_id,
            api_key=os.getenv("ELEVEN_API_KEY"),
            encoding="pcm_16000",
            language=language,
            voice_settings=VoiceSettings(
                stability=stability,
                similarity_boost=similarity_boost,
                use_speaker_boost=True,
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