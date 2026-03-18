from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import Contact


async def create_contact(db: AsyncSession, data):

    contact = Contact(
        campaign_id=data.campaign_id,
        name=data.name,
        phone_number=data.phone_number
    )

    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    return contact