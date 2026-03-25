from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.campaign_schema import CampaignCreate
from app.services.campaign_service import create_campaign
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.post("/")
async def create_campaign_route(
    data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    return await create_campaign(db, data)