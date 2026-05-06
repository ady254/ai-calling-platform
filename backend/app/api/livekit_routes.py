import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.livekit_service import create_room_token
from app.dependencies.auth import get_current_user
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


import json
from typing import Optional

class RoomRequest(BaseModel):
    room_name: str = "test-room"


@router.get("/token")
async def get_token(
    room_name: str,
    campaign_id: Optional[str] = None,
    contact_id: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """Generate a LiveKit room token for the authenticated user."""

    metadata = {}
    if campaign_id:
        metadata["campaign_id"] = campaign_id
    if contact_id:
        metadata["contact_id"] = contact_id

    token = create_room_token(
        identity=user_id,
        room_name=room_name,
        metadata=json.dumps(metadata) if metadata else ""
    )

    logger.info(f"Generated LiveKit token for user {user_id}, room {room_name}")

    return {
        "token": token,
        "room": room_name,
        "livekit_url": settings.LIVEKIT_URL,
    }