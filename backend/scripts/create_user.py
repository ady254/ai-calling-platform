"""
Provision a client account.

Public signup is disabled by default (ALLOW_PUBLIC_SIGNUP=false) because access
to this platform is granted by issuing credentials. This is how you issue them.

`create_user` also auto-creates the account's Business, so the account is
immediately usable — every business-scoped route resolves it.

Usage (run from the backend/ directory):

    # Generate a strong password automatically (recommended)
    python scripts/create_user.py --name "Acme Health" --email ops@acme.com

    # Or set one explicitly
    python scripts/create_user.py --name "Acme Health" --email ops@acme.com --password 'S3cret!'

Requires DATABASE_URL in the environment (or backend/.env).
"""

import argparse
import asyncio
import os
import secrets
import sys

# Mirrors alembic/env.py: make `app.*` importable when run as a plain script.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException  # noqa: E402

from app.db.session import AsyncSessionLocal  # noqa: E402
from app.services.auth_service import create_user  # noqa: E402


async def provision(name: str, email: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        try:
            user = await create_user(db, name, email, password)
        except HTTPException as exc:
            # create_user raises 409 when the email already exists.
            print(f"\n  Could not create account: {exc.detail}\n", file=sys.stderr)
            raise SystemExit(1)

    print("\n  Account created\n")
    print(f"    Name:     {name}")
    print(f"    Email:    {email}")
    print(f"    Password: {password}")
    print(f"    User ID:  {user.id}")
    print("\n  Share these credentials over a secure channel — the password is")
    print("  hashed in the database and cannot be recovered later.\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Provision a client account.")
    parser.add_argument("--name", required=True, help="Account/business owner name")
    parser.add_argument("--email", required=True, help="Login email")
    parser.add_argument(
        "--password",
        help="Password. Omit to generate a strong random one.",
    )
    args = parser.parse_args()

    # token_urlsafe(18) ~= 24 chars of entropy; well under bcrypt's 72-byte limit.
    password = args.password or secrets.token_urlsafe(18)

    asyncio.run(provision(args.name, args.email, password))


if __name__ == "__main__":
    main()
