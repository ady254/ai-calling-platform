from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.user import User
from app.utils.security import hash_password, verify_password
from app.core.security import create_access_token


async def create_user(db: AsyncSession, name: str, email: str, password: str) -> User:
    """
    Register a new user. Raises HTTP 409 if the email is already taken.
    """
    # Fix #10: Check for duplicate email before inserting.
    # Without this the DB unique constraint fires a raw IntegrityError → 500.
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login_user(db: AsyncSession, email: str, password: str) -> str | None:
    """
    Verify credentials and return a JWT access token, or None on failure.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_access_token({"sub": str(user.id)})
    return token