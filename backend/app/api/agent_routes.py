from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
import io
try:
    from elevenlabs.client import ElevenLabs
except ImportError:
    pass

from app.schemas.agent_schema import AgentCreate, AgentUpdate, AgentOut
from app.services.agent_service import (
    create_agent, get_agents_by_business, get_agent,
    update_agent, delete_agent
)
from app.models.business import Business
from app.models.campaign import Campaign
from app.models.agent import Agent
from app.models.call_log import CallLog
from app.schemas.call_schema import CallLogCreate
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.core.config import settings
from fastapi import Header

router = APIRouter()

async def get_user_business(db: AsyncSession, user_id: str):
    stmt = select(Business).filter(Business.user_id == UUID(user_id))
    result = await db.execute(stmt)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found for user")
    return business

@router.post("/", response_model=AgentOut)
async def create_agent_route(
    data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    data.business_id = business.id
    return await create_agent(db, data)

@router.get("/", response_model=List[AgentOut])
async def list_agents_route(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    return await get_agents_by_business(db, business.id)

@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent_route(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    agent = await get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if str(agent.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this agent")
    return agent

@router.put("/{agent_id}", response_model=AgentOut)
async def update_agent_route(
    agent_id: UUID,
    data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    agent = await get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if str(agent.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this agent")
    
    return await update_agent(db, agent_id, data)

@router.delete("/{agent_id}")
async def delete_agent_route(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    agent = await get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if str(agent.business_id) != str(business.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this agent")
    
    success = await delete_agent(db, agent_id)
    return {"success": success}

@router.post("/preview")
async def preview_agent_voice(
    data: dict,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    business = await get_user_business(db, user_id)
    
    voice_id = data.get("voice_id")
    text = data.get("text", "Hi! I am your AI agent. How can I help you today?")
    if not voice_id:
        raise HTTPException(status_code=400, detail="Voice ID is required")
        
    if not settings.ELEVEN_API_KEY:
        raise HTTPException(status_code=500, detail="ElevenLabs API Key is not configured")
        
    try:
        client = ElevenLabs(api_key=settings.ELEVEN_API_KEY)
        audio = client.generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        audio_data = b"".join(audio)
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Internal Routes (for AI Agent Worker) ---

async def verify_internal_key(x_internal_key: str = Header(None)):
    if not x_internal_key or x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal API key")

@router.get("/internal/campaign/{campaign_id}", tags=["Internal"])
async def get_campaign_config_internal(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(verify_internal_key)
):
    """
    Returns the full configuration for an AI call, 
    merging Campaign and Agent Persona settings.
    """
    # Fetch campaign
    stmt = select(Campaign).filter(Campaign.id == campaign_id)
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    config = {
        "campaign_name": campaign.name,
        "ai_prompt": campaign.ai_prompt,
        "ai_voice": campaign.ai_voice,
        "language": campaign.language,
        "max_retries": campaign.max_retries,
    }
    
    # If there's a linked agent, override with agent settings
    if campaign.agent_id:
        agent = await get_agent(db, campaign.agent_id)
        if agent:
            config["ai_prompt"] = agent.system_prompt
            config["ai_voice"] = agent.voice_id
            config["language"] = agent.language
            config["stability"] = agent.stability
            config["similarity_boost"] = agent.similarity_boost
            
    return config

@router.post("/internal/call_log", tags=["Internal"])
async def create_call_log_internal(
    data: dict,  # Using dict because we need both contact and campaign ID
    db: AsyncSession = Depends(get_db),
    _ = Depends(verify_internal_key)
):
    """
    Saves a call log from the AI worker.
    """
    campaign_id = UUID(data.get("campaign_id"))
    contact_id = UUID(data.get("contact_id"))
    
    # Get campaign to find business_id
    stmt = select(Campaign).filter(Campaign.id == campaign_id)
    result = await db.execute(stmt)
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    call_log = CallLog(
        contact_id=contact_id,
        campaign_id=campaign_id,
        business_id=campaign.business_id,
        status=data.get("status", "completed"),
        transcript=data.get("transcript"),
        duration=data.get("duration", 0)
    )
    
    db.add(call_log)
    await db.commit()
    return {"status": "success"}