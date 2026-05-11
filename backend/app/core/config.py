import os
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    """Centralized application configuration loaded from environment."""

    # Database
    DATABASE_URL: str = Field(..., description="PostgreSQL async connection string")
    SECRET_KEY: str = Field(..., description="JWT signing secret")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # LiveKit
    LIVEKIT_API_KEY: str = Field(..., description="LiveKit API key")
    LIVEKIT_API_SECRET: str = Field(..., description="LiveKit API secret")
    LIVEKIT_URL: str = Field(..., description="LiveKit WebSocket URL")

    # LLM
    GEMINI_API_KEY: str = Field(..., description="Google Gemini API key")

    # TTS
    ELEVEN_API_KEY: str = Field(default="", description="ElevenLabs API key")

    # Twilio Voice
    TWILIO_ACCOUNT_SID: str = Field(default="", description="Twilio Account SID")
    TWILIO_AUTH_TOKEN: str = Field(default="", description="Twilio Auth Token")
    TWILIO_PHONE_NUMBER: str = Field(default="", description="Twilio phone number (E.164 format)")

    # Internal API key for agent-to-backend communication
    INTERNAL_API_KEY: str = Field(
        default="dev-internal-key-change-me",
        description="Shared secret for AI agent worker to call internal endpoints"
    )

    # CORS
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Public base URL for Twilio webhooks (e.g., ngrok URL)
    BASE_URL: str = Field(
        default="http://localhost:8000",
        env="BASE_URL",
        description="Publicly accessible URL for your backend"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
