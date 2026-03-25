from fastapi import FastAPI
from app.api.auth_routes import router as auth_router
from app.api.business_routes import router as business_router
from app.api.campaign_routes import router as campaign_router
from app.api.contact_routes import router as contact_router
from app.api.call_routes import router as call_router
from app.api.livekit_routes import router as livekit_router
from app.api.agent_routes import router as agent_router
from app.api.livekit_agent_routes import router as livekit_agent_router

from app.db.base import Base
from app.db.session import engine
from app.db import models

app = FastAPI()

app.include_router(auth_router, prefix="/auth")
app.include_router(business_router, prefix="/business")
app.include_router(campaign_router, prefix="/campaign")
app.include_router(contact_router, prefix="/contact")
app.include_router(call_router, prefix="/call")
app.include_router(livekit_router, prefix="/livekit")
app.include_router(agent_router, prefix="/agent")
app.include_router(livekit_agent_router, prefix="/livekit-agent")

#  Create tables on startup
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
