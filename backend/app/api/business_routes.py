from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.business_schema import BusinessCreate
from app.services.business_service import create_business
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.post("/")
async def create_business_route(
    data: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    return await create_business(db, user_id, data)