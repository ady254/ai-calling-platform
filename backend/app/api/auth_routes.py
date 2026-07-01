from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_schema import UserCreate, UserLogin, UserOut
from app.dependencies.database import get_db
from app.services.auth_service import create_user, login_user
from app.dependencies.auth import get_current_user
from app.core.rate_limit import limiter

router = APIRouter()

# Your existing JSON login (for frontend)
@router.post("/login")
@limiter.limit("5/minute")
async def login(
    request: Request,
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    token = await login_user(db, user_data.email, user_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


# NEW: OAuth2 form-based login (for Swagger UI Authorize button)
@router.post("/token")
@limiter.limit("5/minute")
async def token_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # OAuth2 uses 'username' field — map it to your email
    token = await login_user(db, form_data.username, form_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/signup", response_model=UserOut)
@limiter.limit("3/minute")
async def signup(
    request: Request,
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_user(db, user.name, user.email, user.password)

@router.get("/me")
@limiter.limit("30/minute")
async def get_me(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    return {"user_id": user_id}