from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from sqlalchemy.orm import selectinload
from app.models.campaign import Campaign, CampaignStatus
from app.models.campaign_contact import CampaignContact
from app.schemas.campaign_schema import CampaignCreate, CampaignUpdate
from uuid import UUID

async def create_campaign(db: AsyncSession, data: CampaignCreate):
    campaign = Campaign(
        business_id=data.business_id,
        name=data.name,
        description=data.description,
        objective=data.objective,
        language=data.language,
        ai_prompt=data.ai_prompt,
        ai_voice=data.ai_voice,
        max_retries=data.max_retries,
        scheduled_at=data.scheduled_at,
        status=CampaignStatus.DRAFT
    )
    db.add(campaign)
    await db.flush()

    if data.contact_ids:
        for contact_id in data.contact_ids:
            cc = CampaignContact(campaign_id=campaign.id, contact_id=contact_id)
            db.add(cc)

    await db.commit()
    await db.refresh(campaign)
    return campaign

async def get_campaigns_by_business(db: AsyncSession, business_id: UUID):
    # Get campaigns with contact count
    stmt = select(
        Campaign,
        func.count(CampaignContact.id).label('contact_count')
    ).outerjoin(
        CampaignContact, Campaign.id == CampaignContact.campaign_id
    ).filter(
        Campaign.business_id == business_id
    ).group_by(Campaign.id).order_by(Campaign.created_at.desc())

    result = await db.execute(stmt)
    rows = result.all()

    campaigns = []
    for campaign, contact_count in rows:
        campaign_dict = campaign.__dict__.copy()
        campaign_dict['contact_count'] = contact_count
        campaigns.append(campaign_dict)
    
    return campaigns

async def get_campaign(db: AsyncSession, campaign_id: UUID):
    stmt = select(
        Campaign,
        func.count(CampaignContact.id).label('contact_count')
    ).outerjoin(
        CampaignContact, Campaign.id == CampaignContact.campaign_id
    ).filter(
        Campaign.id == campaign_id
    ).group_by(Campaign.id)

    result = await db.execute(stmt)
    row = result.first()
    if row:
        campaign, contact_count = row
        campaign_dict = campaign.__dict__.copy()
        campaign_dict['contact_count'] = contact_count
        return campaign_dict
    return None

async def update_campaign(db: AsyncSession, campaign_id: UUID, data: CampaignUpdate):
    stmt = select(Campaign).filter(Campaign.id == campaign_id)
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()

    if not campaign:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)

    await db.commit()
    await db.refresh(campaign)
    return await get_campaign(db, campaign_id)

async def delete_campaign(db: AsyncSession, campaign_id: UUID):
    stmt = delete(Campaign).where(Campaign.id == campaign_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0

async def add_contacts_to_campaign(db: AsyncSession, campaign_id: UUID, contact_ids: list[UUID]):
    for contact_id in contact_ids:
        # Check if already exists
        check_stmt = select(CampaignContact).filter_by(campaign_id=campaign_id, contact_id=contact_id)
        result = await db.execute(check_stmt)
        if not result.scalar_one_or_none():
            cc = CampaignContact(campaign_id=campaign_id, contact_id=contact_id)
            db.add(cc)
    
    await db.commit()
    return True