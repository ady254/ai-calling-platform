"""
Signup gate.

Access is granted by issuing credentials, not self-serve registration. If
/auth/signup is ever reachable in a deployed environment, anyone can register,
get a Business auto-created, and launch campaigns billed to our Twilio/LLM
accounts. These tests keep that door shut.
"""

import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_public_signup_is_closed_by_default(monkeypatch):
    """The dangerous default must be the safe one.

    Someone deploying without setting ALLOW_PUBLIC_SIGNUP must get the closed
    behaviour, not an open door.
    """
    monkeypatch.delenv("ALLOW_PUBLIC_SIGNUP", raising=False)
    assert Settings().ALLOW_PUBLIC_SIGNUP is False


def test_public_signup_can_be_enabled_for_local_dev(monkeypatch):
    monkeypatch.setenv("ALLOW_PUBLIC_SIGNUP", "true")
    assert Settings().ALLOW_PUBLIC_SIGNUP is True


@pytest.mark.parametrize("value", ["false", "False", "0", "no", "off"])
def test_falsey_values_keep_signup_closed(monkeypatch, value):
    monkeypatch.setenv("ALLOW_PUBLIC_SIGNUP", value)
    assert Settings().ALLOW_PUBLIC_SIGNUP is False


def test_garbage_value_fails_loudly_rather_than_defaulting_open(monkeypatch):
    """A typo like ALLOW_PUBLIC_SIGNUP=yes-please must not silently open signup.

    Pydantic rejects it at startup, which is the behaviour we want: crash on
    boot beats quietly exposing registration.
    """
    monkeypatch.setenv("ALLOW_PUBLIC_SIGNUP", "yes-please")
    with pytest.raises(ValidationError):
        Settings()
