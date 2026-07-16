"""
Auth primitives: password hashing and JWT issuance.

These are the controls standing between an attacker and every tenant's data,
so they get tested even though they're thin wrappers.
"""

import pytest
from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import create_access_token
from app.utils.security import hash_password, verify_password


# ── Passwords ────────────────────────────────────────────────────────
def test_password_is_hashed_not_stored_plaintext():
    hashed = hash_password("correct horse battery staple")
    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)


def test_wrong_password_is_rejected():
    assert not verify_password("wrong", hash_password("right"))


def test_hashes_are_salted():
    """Same password must not produce the same hash, or hashes become a lookup table."""
    assert hash_password("same") != hash_password("same")


def test_long_password_does_not_explode():
    """bcrypt hard-errors past 72 bytes; requirements pins bcrypt<4.1.0 for this.

    If someone bumps that pin, signup/login start raising ValueError — this test
    is the tripwire.
    """
    long_password = "a" * 200
    assert verify_password(long_password, hash_password(long_password))


# ── JWT ──────────────────────────────────────────────────────────────
def test_token_roundtrips_with_subject_and_expiry():
    token = create_access_token({"sub": "user-123"})
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "user-123"
    assert "exp" in payload


def test_token_signed_with_another_secret_is_rejected():
    token = create_access_token({"sub": "user-123"})
    with pytest.raises(JWTError):
        jwt.decode(token, "a-different-secret", algorithms=[settings.ALGORITHM])


def test_tampered_token_is_rejected():
    token = create_access_token({"sub": "user-123"})
    with pytest.raises(JWTError):
        jwt.decode(token + "tampered", settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def test_expired_token_is_rejected(monkeypatch):
    monkeypatch.setattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", -1)
    token = create_access_token({"sub": "user-123"})
    with pytest.raises(JWTError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
