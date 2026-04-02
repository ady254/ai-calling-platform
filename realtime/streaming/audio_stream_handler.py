import asyncio

class AudioStreamHandler:
    def __init__(self):
        self.current_task = None

    async def handle_audio(self, audio, user_id):
        
        # 🛑 Stop previous response
        if self.current_task and not self.current_task.done():
            self.current_task.cancel()
            print("Previous response stopped")

        # ▶️ Start new response
        self.current_task = asyncio.create_task(
            self.process_audio(audio, user_id)
        )

    async def process_audio(self, audio, user_id):
        text = await transcribe(audio)

        response = await response_generator.generate(text)

        speak(response)