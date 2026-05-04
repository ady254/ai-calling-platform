from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from app.models.contact import Contact, ContactStatus
from app.schemas.contact_schema import ContactCreate, ContactUpdate
from uuid import UUID

async def create_contact(db: AsyncSession, data: ContactCreate):
    contact = Contact(
        business_id=data.business_id,
        name=data.name,
        phone_number=data.phone_number,
        email=data.email,
        company=data.company,
        tags=data.tags,
        notes=data.notes,
        status=ContactStatus.NEW
    )

    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    return contact

async def get_contacts_by_business(db: AsyncSession, business_id: UUID):
    stmt = select(Contact).filter(Contact.business_id == business_id).order_by(Contact.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_contact(db: AsyncSession, contact_id: UUID):
    stmt = select(Contact).filter(Contact.id == contact_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def update_contact(db: AsyncSession, contact_id: UUID, data: ContactUpdate):
    stmt = select(Contact).filter(Contact.id == contact_id)
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()

    if not contact:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contact, key, value)

    await db.commit()
    await db.refresh(contact)
    return contact

async def delete_contact(db: AsyncSession, contact_id: UUID):
    stmt = delete(Contact).where(Contact.id == contact_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0