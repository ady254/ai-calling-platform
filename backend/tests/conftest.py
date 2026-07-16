"""
Shared test configuration.

`app.core.config` constructs a `Settings()` at *import* time and raises unless a
set of required vars are present (notably INTERNAL_API_KEY, which is rejected if
it's the placeholder or under 32 chars). So those vars have to exist in the
environment before any `app.*` module is imported — pytest imports conftest
before collecting test modules, which makes this the right place.

`load_dotenv()` in config.py does not override already-set env vars, and
pydantic-settings ranks real env vars above the .env file, so these win over a
developer's local .env and the suite stays deterministic on any machine and CI.
"""

import os

_TEST_ENV = {
    "DATABASE_URL": "postgresql+asyncpg://test:test@localhost:5432/test",
    "SECRET_KEY": "unit-test-secret-key-not-used-anywhere-real",
    "ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "60",
    # Must be >= 32 chars and not the placeholder, or Settings() raises.
    "INTERNAL_API_KEY": "t" * 64,
    "LIVEKIT_API_KEY": "test-livekit-key",
    "LIVEKIT_API_SECRET": "test-livekit-secret",
    "LIVEKIT_URL": "wss://test.livekit.cloud",
    "GEMINI_API_KEY": "test-gemini-key",
    # Never send events from tests.
    "SENTRY_DSN": "",
    "ENVIRONMENT": "test",
    "LOG_FORMAT": "text",
    "LOG_LEVEL": "INFO",
}

for _key, _value in _TEST_ENV.items():
    os.environ.setdefault(_key, _value)
