from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# Fix #16: Made async for consistency with the rest of the codebase.
# Also added a note about token revocation — the current implementation does NOT
# check if the user still exists in the DB. A deleted user with a valid JWT can
# still authenticate until the token expires (ACCESS_TOKEN_EXPIRE_MINUTES).
# TODO: For stricter security, add a DB existence check here, or implement a
# token revocation list backed by Redis.
async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str | None = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")

        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")