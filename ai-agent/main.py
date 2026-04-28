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
                "You are a Holy Family Hospital receptionist. Speak naturally like a human in a phone call. "
                "The conversation must be in hindi. "
                "Your task is to confirm the patient's appointment. "
                "When the user greets you or says hello, and ask for confirmation about their appointment at 6pm with the physician. "
                "If the user confirms they are coming (e.g. 'I am coming'or 'haan'), your exact response must be: 'great I just called to confirm your appointment'. "
                "Be polite and keep responses short."
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
            model="eleven_multilingual_v2",
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
        "main Holy Family Hospital se bol raha hoon. Main aapka doctor ke saath 6 baje ka appointment confirm karne ke liye call kar raha hoon. Kya aap aa payenge? Please confirm kijiye. "
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))