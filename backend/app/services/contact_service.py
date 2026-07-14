from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from app.models.contact import Contact, ContactStatus
from app.schemas.contact_schema import ContactCreate, ContactUpdate
from uuid import UUID


async def create_contact(
    db: AsyncSession,
    data: ContactCreate,
    auto_commit: bool = True,
) -> Contact:
    """
    Create a new contact.

    `auto_commit=False` is used for bulk CSV imports where the caller wants
    to flush multiple rows and commit once at the end (fixes #19 N-commits).
    """
    contact = Contact(
        business_id=data.business_id,
        name=data.name,
        phone_number=data.phone_number,
        email=data.email,
        company=data.company,
        # Fix #31 (TODO): tags is stored as a comma-separated string.
        # This prevents indexed filtering. Future improvement: migrate to a
        # PostgreSQL ARRAY or JSONB column, or a separate tags junction table.
        tags=data.tags,
        notes=data.notes,
        industry=getattr(data, "industry", None),
        lead_score=getattr(data, "lead_score", None),
        pipeline_stage=(getattr(data, "pipeline_stage", None) or "new"),
        custom_fields=data.custom_fields or {},
        status=ContactStatus.NEW,
    )

    db.add(contact)

    if auto_commit:
        await db.commit()
        await db.refresh(contact)

    return contact


async def get_contacts_by_business(
    db: AsyncSession,
    business_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[Contact]:
    stmt = (
        select(Contact)
        .filter(Contact.business_id == business_id)
        .order_by(Contact.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_contact(db: AsyncSession, contact_id: UUID) -> Contact | None:
    stmt = select(Contact).filter(Contact.id == contact_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_contact(
    db: AsyncSession, contact_id: UUID, data: ContactUpdate
) -> Contact | None:
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


async def delete_contact(db: AsyncSession, contact_id: UUID) -> bool:
    stmt = delete(Contact).where(Contact.id == contact_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0