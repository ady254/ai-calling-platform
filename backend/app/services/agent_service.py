import logging
from app.services.ai_service import generate_ai_response
from app.services.voice_service import text_to_speech

logger = logging.getLogger(__name__)


async def run_ai_agent(user_input: str, session_id: str = "default"):
    """Process user input through AI and generate voice response."""

    ai_reply = await generate_ai_response(user_input, session_id=session_id)

    audio_file = text_to_speech(ai_reply)

    logger.info(f"Agent response: text={ai_reply[:80]}..., audio={audio_file}")

    return {
        "text": ai_reply,
        "audio": audio_file
    }
