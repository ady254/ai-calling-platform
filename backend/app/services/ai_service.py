import json
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


# ── Post-call outcome extraction ──────────────────────────────────────
# Separate model instance: the module-level `model` above carries a sales
# persona system prompt that must not leak into analysis output.
_extraction_model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config={"response_mime_type": "application/json"},
)

# Allowed outcome values — anything else from the LLM is coerced to "other"
# so the DB column stays a clean, filterable enum-like set.
CALL_OUTCOMES = {
    "confirmed",
    "rescheduled",
    "callback_requested",
    "not_interested",
    "do_not_call",
    "wrong_person",
    "incomplete",
    "other",
}

_EXTRACTION_PROMPT = """You are analyzing the transcript of an outbound AI phone call made on behalf of a business. Lines are prefixed "Agent:" (the AI caller) and "User:" (the person who was called).

Return a JSON object with exactly these keys:
- "outcome": one of "confirmed" | "rescheduled" | "callback_requested" | "not_interested" | "do_not_call" | "wrong_person" | "incomplete" | "other"
    confirmed: the person agreed to or confirmed the purpose of the call (e.g. confirmed an appointment)
    rescheduled: they asked to move it to a different date or time
    callback_requested: they asked to be called back later
    not_interested: they declined the offer or purpose of the call
    do_not_call: they asked not to be contacted again
    wrong_person: wrong number, or the intended person was not available
    incomplete: the call ended before the purpose was addressed
    other: none of the above fits
- "summary": 1-2 plain sentences describing what happened on the call
- "follow_up": the specific next action the business must take, including any date/time the person mentioned, or null if no action is needed

Transcript:
{transcript}"""


async def extract_call_outcome(transcript: str) -> dict | None:
    """
    Analyze a finished call transcript and return
    {"outcome": ..., "summary": ..., "follow_up": ...} or None on failure.
    """
    if not transcript or len(transcript.strip()) < 20:
        return None

    try:
        response = await _extraction_model.generate_content_async(
            _EXTRACTION_PROMPT.format(transcript=transcript)
        )
        data = json.loads(response.text)

        outcome = data.get("outcome")
        if outcome not in CALL_OUTCOMES:
            outcome = "other"

        summary = (data.get("summary") or "").strip()[:1000] or None
        follow_up = (data.get("follow_up") or "").strip()[:1000] or None
        # json.loads can yield the string "null" text if the model misbehaves
        if follow_up and follow_up.lower() == "null":
            follow_up = None

        return {"outcome": outcome, "summary": summary, "follow_up": follow_up}

    except Exception as e:
        logger.error(f"Call outcome extraction failed: {e}")
        return None