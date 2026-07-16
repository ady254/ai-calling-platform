"""
Config guards.

The INTERNAL_API_KEY validator is a real security control: that key lets the AI
agent worker call internal endpoints, so a placeholder or short value shipping
to production would be an auth bypass. These tests keep that validator honest.
"""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_rejects_placeholder_internal_key(monkeypatch):
    """The known-bad default must never be accepted, in any environment."""
    monkeypatch.setenv("INTERNAL_API_KEY", "dev-internal-key-change-me")
    with pytest.raises(ValidationError):
        Settings()


def test_rejects_short_internal_key(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", "tooshort")
    with pytest.raises(ValidationError):
        Settings()


def test_accepts_strong_internal_key(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", "a" * 32)
    assert len(Settings().INTERNAL_API_KEY) >= 32


def test_cors_origins_are_split_and_trimmed(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://app.example.com,  https://admin.example.com ")
    assert Settings().cors_origins == ["https://app.example.com", "https://admin.example.com"]


def test_sentry_sample_rate_must_be_a_fraction(monkeypatch):
    """Guards against a typo'd 100 meaning "trace everything" and blowing quota."""
    monkeypatch.setenv("SENTRY_TRACES_SAMPLE_RATE", "100")
    with pytest.raises(ValidationError):
        Settings()
