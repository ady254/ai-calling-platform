from sqlalchemy.ext.asyncio import AsyncSession
from app.models.business import Business


async def create_business(db: AsyncSession, user_id, data):

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