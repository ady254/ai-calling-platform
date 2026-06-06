"""
Rate limiting configuration using SlowAPI.

Applies per-IP rate limits to protect against brute-force and abuse.
Auth endpoints get stricter limits than general API endpoints.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create the limiter instance keyed by client IP
limiter = Limiter(key_func=get_remote_address)
