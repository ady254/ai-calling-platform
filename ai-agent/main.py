from livekit.agents import Agent, JobContext
from llm import get_response
from stt import transcribe
from tts import speak

class MyAgent(Agent):
    def __init__(self):
        super().__init__()
        self.history = []

    async def on_start(self, ctx: JobContext):
        print("AI Agent started")

    async def on_audio(self, audio):
        text = await transcribe(audio)
        response = await get_response(text, self.history)
        await speak(response)