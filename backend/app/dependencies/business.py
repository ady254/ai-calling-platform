from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.business import Business


async def get_user_business(db: AsyncSession, user_id: str) -> Business:
    """Resolve the current user's business. Shared across all route modules."""
    stmt = select(Business).filter(Business.user_id == UUID(user_id))
    result = await db.execute(stmt)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found for user")
    return business
