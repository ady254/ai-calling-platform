"""
Observability: structured logging, request correlation, and error tracking.

Design notes
------------
* Sentry is **opt-in**. With SENTRY_DSN unset every call here is a no-op, so
  local dev, tests and CI never ship events anywhere.
* This platform stores call transcripts, phone numbers, emails and AI prompts.
  None of that may leave the system in an error report, so PII scrubbing is
  built into `before_send` rather than bolted on later. `send_default_pii` is
  left False so Sentry won't attach IPs/cookies/headers on its own either.
* Logging is JSON in deployed environments (queryable in Cloud Logging /
  Datadog) and plain text locally. Implemented with the stdlib to avoid adding
  another dependency.
"""

from __future__ import annotations

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Correlation id for the in-flight request, attached to every log line emitted
# while handling it. Set by the request-id middleware in main.py.
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)

REDACTED = "[redacted]"

# Substring match — "customer_phone", "ai_prompt", "access_token" all match.
#
# Note on names: a bare "name" is deliberately NOT redacted, because campaign,
# agent and business names are the context that makes an error report useful.
# Person-identifying name keys are listed explicitly instead, so a patient or
# customer name never reaches a third-party error tracker.
_SENSITIVE_KEY_PARTS = (
    "transcript",
    "summary",
    "follow_up",
    "phone",
    "email",
    "password",
    "token",
    "authorization",
    "secret",
    "api_key",
    "apikey",
    "dsn",
    "prompt",
    "notes",
    "ai_insights",
    "address",
    # Person-identifying names (see note above)
    "customer_name",
    "contact_name",
    "full_name",
    "first_name",
    "last_name",
    "patient",
)

# Standard LogRecord attributes — anything else on the record is a caller
# supplied `extra=` field worth emitting.
_RESERVED_LOG_ATTRS = frozenset(
    {
        "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
        "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
        "created", "msecs", "relativeCreated", "thread", "threadName",
        "processName", "process", "taskName", "message", "asctime",
    }
)


def _is_sensitive(key: str) -> bool:
    k = str(key).lower()
    return any(part in k for part in _SENSITIVE_KEY_PARTS)


def _scrub(obj: Any, depth: int = 0) -> Any:
    """Recursively redact values whose key looks sensitive."""
    if depth > 6:
        return obj
    if isinstance(obj, dict):
        return {
            k: (REDACTED if _is_sensitive(k) else _scrub(v, depth + 1))
            for k, v in obj.items()
        }
    if isinstance(obj, (list, tuple)):
        return [_scrub(v, depth + 1) for v in obj]
    return obj


class JsonFormatter(logging.Formatter):
    """Minimal structured formatter. One JSON object per line."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }

        rid = request_id_var.get()
        if rid:
            payload["request_id"] = rid

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key not in _RESERVED_LOG_ATTRS and not key.startswith("_"):
                payload[key] = value

        # default=str keeps non-serializable extras (UUIDs, datetimes) from
        # blowing up the log call itself.
        return json.dumps(payload, default=str)


class RequestIdFilter(logging.Filter):
    """Make request_id available to the plain-text formatter too."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get() or "-"
        return True


def setup_logging() -> None:
    """Configure root logging. Call once, before anything logs."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_FORMAT.lower() == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s")
        )
        handler.addFilter(RequestIdFilter())

    root = logging.getLogger()
    root.handlers.clear()  # replace basicConfig/uvicorn defaults
    root.addHandler(handler)
    root.setLevel(level)

    # Let uvicorn's loggers flow through our handler instead of their own.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers.clear()
        lg.propagate = True

    # asyncpg/sqlalchemy are chatty at DEBUG; keep them at WARNING unless asked.
    if level > logging.DEBUG:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def _scrub_event(event: dict, hint: dict) -> dict | None:
    """Strip PII before anything leaves the process."""
    request = event.get("request")
    if isinstance(request, dict):
        # Bodies routinely carry transcripts, phone numbers and prompts.
        request.pop("data", None)
        request.pop("cookies", None)
        headers = request.get("headers")
        if isinstance(headers, dict):
            for header in list(headers):
                if header.lower() in {"authorization", "cookie", "x-internal-key"}:
                    headers[header] = REDACTED

    for section in ("extra", "contexts"):
        if isinstance(event.get(section), dict):
            event[section] = _scrub(event[section])

    return event


def _traces_sampler(sampling_context: dict) -> float:
    """Don't burn quota tracing health checks and static audio."""
    scope = sampling_context.get("asgi_scope") or {}
    path = scope.get("path", "")
    if path == "/health" or path.startswith("/audio"):
        return 0.0
    return settings.SENTRY_TRACES_SAMPLE_RATE


def init_sentry() -> None:
    """Initialise error tracking. No-op when SENTRY_DSN is unset."""
    if not settings.SENTRY_DSN:
        logger.info("SENTRY_DSN not set — error tracking disabled")
        return

    try:
        import sentry_sdk
    except ImportError:
        logger.warning("sentry-sdk not installed — error tracking disabled")
        return

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        # Never let Sentry attach IPs/cookies/headers on its own; we hand it
        # only what survives _scrub_event.
        send_default_pii=False,
        before_send=_scrub_event,
        traces_sampler=_traces_sampler,
    )
    logger.info("Sentry initialised (environment=%s)", settings.ENVIRONMENT)
