import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.livekit_service import create_room_token
from app.dependencies.auth import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


class RoomRequest(BaseModel):
    room_name: str = "test-room"


@router.get("/token")
async def get_token(
    room_name: str,
    user_id: str = Depends(get_current_user)
):
    """Generate a LiveKit room token for the authenticated user."""

    token = create_room_token(
        identity=user_id,
        room_name=room_name
    )

    logger.info(f"Generated LiveKit token for user {user_id}, room {room_name}")

    return {
        "token": token,
        "room": room_name,
        "livekit_url": settings.LIVEKIT_URL,
    }