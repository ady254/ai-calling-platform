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

    # CORS
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
