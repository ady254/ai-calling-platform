from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_schema import UserCreate, UserLogin
from app.dependencies.database import get_db
from app.services.auth_service import create_user, login_user
from app.dependencies.auth import get_current_user

router = APIRouter()

# Your existing JSON login (for frontend)
@router.post("/login")
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    token = await login_user(db, user_data.email, user_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


# NEW: OAuth2 form-based login (for Swagger UI Authorize button)
@router.post("/token")
async def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # OAuth2 uses 'username' field — map it to your email
    token = await login_user(db, form_data.username, form_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/signup")
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user.name, user.email, user.password)

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}