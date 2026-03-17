from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.utils.security import hash_password, verify_password
from app.core.security import create_access_token


# ✅ Signup
async def create_user(db: AsyncSession, name, email, password):

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


# ✅ Login
async def login_user(db: AsyncSession, email, password):

    result = await db.execute(
        select(User).where(User.email == email)
    )

    user = result.scalar_one_or_none()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_access_token({"sub": str(user.id)})

    return token