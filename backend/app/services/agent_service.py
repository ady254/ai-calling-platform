from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List

from app.models.agent import Agent
from app.schemas.agent_schema import AgentCreate, AgentUpdate


async def create_agent(db: AsyncSession, data: AgentCreate) -> Agent:
    agent = Agent(**data.model_dump())
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


async def get_agents_by_business(db: AsyncSession, business_id: UUID) -> List[Agent]:
    stmt = select(Agent).filter(Agent.business_id == business_id).order_by(Agent.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_agent(db: AsyncSession, agent_id: UUID) -> Agent:
    stmt = select(Agent).filter(Agent.id == agent_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_agent(db: AsyncSession, agent_id: UUID, data: AgentUpdate) -> Agent:
    agent = await get_agent(db, agent_id)
    if not agent:
        return None
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)
        
    await db.commit()
    await db.refresh(agent)
    return agent


async def delete_agent(db: AsyncSession, agent_id: UUID) -> bool:
    agent = await get_agent(db, agent_id)
    if not agent:
        return False
        
    await db.delete(agent)
    await db.commit()
    return True
