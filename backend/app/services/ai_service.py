import json
import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)


# ── Post-call outcome extraction ──────────────────────────────────────
# The live phone conversation is handled by the LiveKit agent (see ai-agent/),
# not here. This module's only job is analysing a finished transcript.
#
# Removed (2026-07): an in-memory `_session_histories` dict and the
# `generate_ai_response`/`clear_session` pair that used it. Nothing in the
# codebase called them. They were also a liability: the dict was never evicted
# (unbounded memory growth) and was per-process, so it silently broke with more
# than one replica. Its hardcoded persona also introduced the agent using an
# unrelated product's branding, left over from another project.
#
# Migrated (2026-07) from `google-generativeai` to `google-genai`. Google
# retired the old package — no more updates or security fixes. Same API, same
# key, same model; only the client library changed.
_MODEL = "gemini-2.5-flash"

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def _generate_json(prompt: str) -> str:
    """Send `prompt` to the model and return its raw JSON text.

    The SDK boundary lives here on purpose: everything below deals in plain
    strings, so parsing/normalisation is testable without the network and a
    future SDK change touches only this function.
    """
    response = await _client.aio.models.generate_content(
        model=_MODEL,
        contents=prompt,
        # JSON response mode keeps analysis output machine-parseable.
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    return response.text

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
        raw = await _generate_json(_EXTRACTION_PROMPT.format(transcript=transcript))
        data = json.loads(raw)

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