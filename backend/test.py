import asyncio
from app.services.ai_service import generate_ai_response
from app.services.voice_service import text_to_speech
async def main():
    rep = await generate_ai_response('hello')
    print('AI:', rep)
    path = text_to_speech(rep)
    print('Path:', path)
asyncio.run(main())
