import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=(
        "You are a professional sales calling agent. "
        "Speak naturally like a human in a phone call. "
        "Reply in Hinglish (Hindi + English mix). "
        "Keep responses short and natural. "
        "When the user greets you or says hello, your exact first response should be: "
        "'Hey, I'm from DODO by Innvox, India's first AI voice calling platform. How can I help you today?' "
        "After that, understand the user's requirements and respond accordingly."
    )
)

# Session-scoped conversation histories
# Key: session_id (str) → Value: list of conversation turns
_session_histories: dict[str, list] = {}

# Max history turns to keep per session (to prevent token overflow)
MAX_HISTORY_TURNS = 20


async def generate_ai_response(message: str, session_id: str = "default") -> str:
    """Generate an AI response with per-session conversation memory."""

    # Get or create history for this session
    if session_id not in _session_histories:
        _session_histories[session_id] = []

    history = _session_histories[session_id]

    # Append user message
    history.append({
        "role": "user",
        "parts": [message]
    })

    # Trim history if it gets too long (keep last N turns)
    if len(history) > MAX_HISTORY_TURNS:
        history[:] = history[-MAX_HISTORY_TURNS:]

    # Generate response with full history
    response = await model.generate_content_async(history)

    reply = response.text

    # Append model reply to history
    history.append({
        "role": "model",
        "parts": [reply]
    })

    logger.info(f"AI response for session {session_id}: {reply[:100]}...")

    return reply


def clear_session(session_id: str) -> None:
    """Clear conversation history for a session."""
    if session_id in _session_histories:
        del _session_histories[session_id]
        logger.info(f"Cleared session: {session_id}")