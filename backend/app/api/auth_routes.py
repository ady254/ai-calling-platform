from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_schema import UserCreate
from app.dependencies.database import get_db
from app.services.auth_service import create_user, login_user
from app.dependencie.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()
@router.post("/signup")
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):

    return await create_user(
        db,
        user.name,
        user.email,
        user.password
    )

from app.schemas.user_schema import UserCreate, UserLogin
from app.services.auth_service import create_user, login_user


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):

    token = await login_user(
        db,
        form_data.username,   # ⚠ username = email
        form_data.password
    )

    if not token:
        return {"error": "Invalid credentials"}

    return {
        "access_token": token,
        "token_type": "bearer"
    }
@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}


