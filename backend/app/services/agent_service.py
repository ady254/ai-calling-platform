from app.services.ai_service import generate_ai_response
from app.services.voice_service import text_to_speech


async def run_ai_agent(user_input: str):

    ai_reply = await generate_ai_response(user_input)

    audio_file = text_to_speech(ai_reply)

    return {
        "text": ai_reply,
        "audio": audio_file
    }
