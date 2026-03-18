from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.call_service import start_call
from app.dependencies.database import get_db
from app.dependencie.auth import get_current_user

router = APIRouter()


@router.post("/start/{contact_id}")
async def start_call_route(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    return await start_call(db, contact_id)