from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.business import Business


async def create_business(db: AsyncSession, user_id, data):
    # One business per user. Check first so a duplicate request returns a
    # clean 409 instead of an unhandled IntegrityError from the DB's unique
    # constraint on businesses.user_id.
    existing = await db.execute(select(Business).where(Business.user_id == user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="A business already exists for this user")

    business = Business(
        user_id=user_id,
        name=data.name,
        industry=data.industry,
        default_language=data.default_language
    )

    db.add(business)
    await db.commit()
    await db.refresh(business)

    return business