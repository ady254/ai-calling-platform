from fastapi import APIRouter, Depends

from app.services.livekit_service import create_room_token
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/token")
async def get_token(
    room_name: str,
    user_id: str = Depends(get_current_user)
):

    token = create_room_token(
        identity=user_id,
        room_name=room_name
    )

    return {
        "token": token,
        "room": room_name
    }