"""
Logging + error-tracking behaviour.

The scrubbing tests are a compliance control, not a nicety: this platform stores
call transcripts, phone numbers and emails, and Sentry is a third party. If
someone widens what we send, these fail.
"""

import io
import json
import logging

from app.core.observability import (
    REDACTED,
    JsonFormatter,
    _scrub,
    _scrub_event,
    request_id_var,
)


def _json_logger(name: str):
    """A logger that writes one JSON line into a buffer."""
    buf = io.StringIO()
    handler = logging.StreamHandler(buf)
    handler.setFormatter(JsonFormatter())
    log = logging.getLogger(name)
    log.handlers = [handler]
    log.setLevel(logging.INFO)
    log.propagate = False
    return log, buf


# ── Structured logging ───────────────────────────────────────────────
def test_log_line_is_json_with_level_message_and_extras():
    log, buf = _json_logger("test.json")
    log.info("campaign started", extra={"campaign_id": "wf-1"})
    entry = json.loads(buf.getvalue())
    assert entry["level"] == "INFO"
    assert entry["msg"] == "campaign started"
    assert entry["logger"] == "test.json"
    assert entry["campaign_id"] == "wf-1"
    assert "ts" in entry


def test_log_line_carries_request_id_for_correlation():
    log, buf = _json_logger("test.rid")
    token = request_id_var.set("req-abc123")
    try:
        log.info("handling request")
    finally:
        request_id_var.reset(token)
    assert json.loads(buf.getvalue())["request_id"] == "req-abc123"


def test_exception_includes_traceback():
    log, buf = _json_logger("test.exc")
    try:
        raise ValueError("twilio call failed")
    except ValueError:
        log.exception("call failed")
    entry = json.loads(buf.getvalue())
    assert "ValueError: twilio call failed" in entry["exception"]


def test_non_serializable_extras_do_not_break_logging():
    """A UUID/datetime in `extra` must not turn a log call into a crash."""
    import uuid

    log, buf = _json_logger("test.serial")
    log.info("created", extra={"contact_uuid": uuid.uuid4()})
    assert "contact_uuid" in json.loads(buf.getvalue())


# ── PII scrubbing ────────────────────────────────────────────────────
def test_scrub_redacts_transcripts_and_contact_pii():
    clean = _scrub(
        {
            "contact": {"phone_number": "+14155550142", "email": "j@example.com"},
            "call": {"transcript": "Agent: hello...", "summary": "booked", "duration": 138},
            "auth": {"access_token": "eyJhbGciOi..."},
        }
    )
    assert clean["contact"]["phone_number"] == REDACTED
    assert clean["contact"]["email"] == REDACTED
    assert clean["call"]["transcript"] == REDACTED
    assert clean["call"]["summary"] == REDACTED
    assert clean["auth"]["access_token"] == REDACTED


def test_scrub_keeps_non_sensitive_operational_context():
    """Redacting everything would make error reports useless."""
    clean = _scrub({"call": {"duration": 138}, "campaign": {"name": "Hospital Reminder"}})
    assert clean["call"]["duration"] == 138
    assert clean["campaign"]["name"] == "Hospital Reminder"


def test_scrub_redacts_person_names_but_not_campaign_names():
    clean = _scrub(
        {
            "customer_name": "John Smith",
            "full_name": "John Smith",
            "patient_id": "MRN-88",
            "agent": {"name": "Hospital AI Agent"},
        }
    )
    assert clean["customer_name"] == REDACTED
    assert clean["full_name"] == REDACTED
    assert clean["patient_id"] == REDACTED
    assert clean["agent"]["name"] == "Hospital AI Agent"


def test_scrub_reaches_into_lists():
    clean = _scrub({"contacts": [{"phone": "+1415"}, {"phone": "+1416"}]})
    assert [c["phone"] for c in clean["contacts"]] == [REDACTED, REDACTED]


def test_before_send_strips_request_body_and_auth_headers():
    event = _scrub_event(
        {
            "request": {
                "data": {"transcript": "a whole call transcript"},
                "cookies": {"session": "abc"},
                "headers": {
                    "Authorization": "Bearer eyJ...",
                    "X-Internal-Key": "internal-secret",
                    "User-Agent": "curl/8.0",
                },
            },
            "extra": {"phone_number": "+14155550142"},
        },
        {},
    )
    # Bodies routinely carry transcripts/PII — must be dropped wholesale.
    assert "data" not in event["request"]
    assert "cookies" not in event["request"]
    assert event["request"]["headers"]["Authorization"] == REDACTED
    assert event["request"]["headers"]["X-Internal-Key"] == REDACTED
    # Non-sensitive headers stay, for debugging.
    assert event["request"]["headers"]["User-Agent"] == "curl/8.0"
    assert event["extra"]["phone_number"] == REDACTED
