"""
Post-call outcome extraction.

`extract_call_outcome` feeds the `outcome` column that the Campaign Details
funnel, KPIs and recent-calls table all read, so its normalisation contract
matters: a bad value there quietly corrupts reporting.

These tests patch `_generate_json` — the single SDK boundary — so they run with
no network and no API key, and they stay valid across SDK changes (they survived
the google-generativeai -> google-genai migration unchanged).
"""

import pytest

import app.services.ai_service as ai

# Must clear the 20-char minimum in extract_call_outcome.
TRANSCRIPT = "Agent: Hi, confirming your appointment.\nUser: Yes, Friday works."


def _fake_model(monkeypatch, raw: str):
    """Make the model return `raw` instead of calling Gemini."""

    async def _fake(prompt: str) -> str:
        return raw

    monkeypatch.setattr(ai, "_generate_json", _fake)


def _model_raises(monkeypatch, exc: Exception):
    async def _fake(prompt: str) -> str:
        raise exc

    monkeypatch.setattr(ai, "_generate_json", _fake)


# ── Guard clause: don't waste an API call on nothing ─────────────────
@pytest.mark.parametrize("transcript", ["", "   ", None, "too short"])
async def test_returns_none_without_calling_model_for_empty_transcript(monkeypatch, transcript):
    def _explode(prompt: str):
        raise AssertionError("model must not be called for an empty/short transcript")

    monkeypatch.setattr(ai, "_generate_json", _explode)
    assert await ai.extract_call_outcome(transcript) is None


# ── Happy path ───────────────────────────────────────────────────────
async def test_parses_a_well_formed_response(monkeypatch):
    _fake_model(
        monkeypatch,
        '{"outcome": "confirmed", "summary": "Patient confirmed Friday.", '
        '"follow_up": "Send reminder Thursday"}',
    )
    assert await ai.extract_call_outcome(TRANSCRIPT) == {
        "outcome": "confirmed",
        "summary": "Patient confirmed Friday.",
        "follow_up": "Send reminder Thursday",
    }


@pytest.mark.parametrize("outcome", sorted(ai.CALL_OUTCOMES))
async def test_every_allowed_outcome_survives_untouched(monkeypatch, outcome):
    _fake_model(monkeypatch, f'{{"outcome": "{outcome}", "summary": "s", "follow_up": null}}')
    assert (await ai.extract_call_outcome(TRANSCRIPT))["outcome"] == outcome


# ── Normalisation: the DB column must stay a clean enum ──────────────
async def test_unknown_outcome_is_coerced_to_other(monkeypatch):
    """The LLM inventing a value must not leak into the outcome column."""
    _fake_model(monkeypatch, '{"outcome": "customer_was_delighted", "summary": "s", "follow_up": null}')
    assert (await ai.extract_call_outcome(TRANSCRIPT))["outcome"] == "other"


async def test_missing_outcome_is_coerced_to_other(monkeypatch):
    _fake_model(monkeypatch, '{"summary": "s", "follow_up": null}')
    assert (await ai.extract_call_outcome(TRANSCRIPT))["outcome"] == "other"


async def test_json_null_follow_up_becomes_none(monkeypatch):
    _fake_model(monkeypatch, '{"outcome": "confirmed", "summary": "s", "follow_up": null}')
    assert (await ai.extract_call_outcome(TRANSCRIPT))["follow_up"] is None


async def test_literal_null_string_becomes_none(monkeypatch):
    """The model sometimes emits the *text* "null" rather than JSON null."""
    _fake_model(monkeypatch, '{"outcome": "confirmed", "summary": "s", "follow_up": "null"}')
    assert (await ai.extract_call_outcome(TRANSCRIPT))["follow_up"] is None


async def test_empty_strings_become_none(monkeypatch):
    _fake_model(monkeypatch, '{"outcome": "confirmed", "summary": "   ", "follow_up": ""}')
    result = await ai.extract_call_outcome(TRANSCRIPT)
    assert result["summary"] is None
    assert result["follow_up"] is None


async def test_overlong_fields_are_truncated_to_column_width(monkeypatch):
    _fake_model(
        monkeypatch,
        json_dumps := '{"outcome": "confirmed", "summary": "%s", "follow_up": "%s"}' % ("a" * 2000, "b" * 2000),
    )
    result = await ai.extract_call_outcome(TRANSCRIPT)
    assert len(result["summary"]) == 1000
    assert len(result["follow_up"]) == 1000


# ── Failure handling: never break the call pipeline ──────────────────
async def test_malformed_json_returns_none(monkeypatch):
    _fake_model(monkeypatch, "I'm afraid I can't do that")
    assert await ai.extract_call_outcome(TRANSCRIPT) is None


async def test_api_failure_returns_none_rather_than_raising(monkeypatch):
    """Extraction is best-effort — a Gemini outage must not fail the call flow."""
    _model_raises(monkeypatch, RuntimeError("503 Service Unavailable"))
    assert await ai.extract_call_outcome(TRANSCRIPT) is None
