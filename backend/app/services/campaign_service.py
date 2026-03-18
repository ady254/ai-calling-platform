from sqlalchemy.ext.asyncio import AsyncSession
from app.models.campaign import Campaign


async def create_campaign(db: AsyncSession, data):

    campaign = Campaign(
        business_id=data.business_id,
        name=data.name,
        objective=data.objective,
        language=data.language
    )

    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)

    return campaign