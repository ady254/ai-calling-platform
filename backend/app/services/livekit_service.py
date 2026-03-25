from livekit.api import AccessToken, VideoGrants
from dotenv import load_dotenv
import os

load_dotenv()


def create_room_token(identity: str, room_name: str):

    token = AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET")
    )

    token.with_identity(identity)
    token.with_name(identity)

    grant = VideoGrants(
        room_join=True,
        room=room_name
    )
    token.with_grants(grant)

    return token.to_jwt()