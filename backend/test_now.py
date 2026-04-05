import asyncio
from app.services.ai_service import generate_ai_response
from app.services.voice_service import text_to_speech
async def main():
    rep = "Hello, how are you?"
    print('Testing voice service with fallback...')
    path = text_to_speech(rep)
    print('Path:', path)
asyncio.run(main())
