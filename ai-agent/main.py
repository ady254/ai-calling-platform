import asyncio
import logging
from dotenv import load_dotenv
from livekit.agents import AgentSession, Agent, JobContext, WorkerOptions, cli, RoomInputOptions
from livekit.plugins import google, deepgram, silero, elevenlabs
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

class MyAgent(Agent):
    async def on_response(self, response):
        print("AI Response:", response)
        return response
    def __init__(self):
        super().__init__(
            instructions=(
                "You are a friendly AI voice assistant. Speak naturally like a human in a phone call. "
                "Reply in Hinglish (Hindi + English mix). Keep responses short and natural. "
                "When the user greets you or says hello, your exact first response should be: "
                "'Hey, I'm from DODO by Innvox, India's first AI voice calling platform. How can I help you today?' "
                "After that, understand the user's requirements and respond accordingly."
            )
        )

async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=google.LLM(model="gemini-2.5-flash"),
        #Elevenlabs integration 
        tts=elevenlabs.TTS(
            voice_id="qtqlHrXyBpEXHx2JBPgx",
            api_key=os.getenv("ELEVEN_API_KEY")
        ),
        allow_interruptions=False
    )

    await session.start(
        room=ctx.room,
        agent=MyAgent(),
        room_input_options=RoomInputOptions(),
    )

    logger.info("Agent joined and is now listening.")
    # 🔥 Startup greeting
    await session.say(
        "Hey, I'm from DODO by Innvox, India's first AI voice calling platform. How can I help you today?"
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))