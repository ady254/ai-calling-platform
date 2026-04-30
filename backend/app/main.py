import logging
from fastapi import FastAPI
from app.api.auth_routes import router as auth_router
from app.api.business_routes import router as business_router
from app.api.campaign_routes import router as campaign_router
from app.api.contact_routes import router as contact_router
from app.api.call_routes import router as call_router
from app.api.livekit_routes import router as livekit_router
from app.api.agent_routes import router as agent_router

from app.db.base import Base
from app.db.session import engine
from app.db import models

from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title="AI Calling Platform API",
    description="Backend API for V3 AI Voice Calling Platform",
    version="1.0.0",
)

app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# Use restricted CORS origins from config instead of wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(business_router, prefix="/business", tags=["Business"])
app.include_router(campaign_router, prefix="/campaign", tags=["Campaign"])
app.include_router(contact_router, prefix="/contact", tags=["Contact"])
app.include_router(call_router, prefix="/call", tags=["Calls"])
app.include_router(livekit_router, prefix="/livekit", tags=["LiveKit"])
app.include_router(agent_router, prefix="/agent", tags=["Agent"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker/monitoring."""
    return {"status": "healthy", "service": "ai-calling-backend"}


#  Create tables on startup
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
