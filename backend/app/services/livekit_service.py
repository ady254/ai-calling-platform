from livekit.api import AccessToken, VideoGrants
from app.core.config import settings


def create_room_token(identity: str, room_name: str):
    """Create a LiveKit room access token for a participant."""

    token = AccessToken(
        settings.LIVEKIT_API_KEY,
        settings.LIVEKIT_API_SECRET
    )

    token.with_identity(identity)
    token.with_name(identity)

    grant = VideoGrants(
        room_join=True,
        room=room_name
    )
    token.with_grants(grant)

    return token.to_jwt()