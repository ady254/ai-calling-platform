from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.contact_schema import ContactCreate
from app.services.contact_service import create_contact
from app.dependencies.database import get_db
from app.dependencie.auth import get_current_user

router = APIRouter()


@router.post("/")
async def create_contact_route(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    return await create_contact(db, data)