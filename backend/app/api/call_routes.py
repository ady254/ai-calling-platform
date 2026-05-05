from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.services.call_service import start_call
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.call_log import CallLog
from app.schemas.call_schema import CallLogCreate, CallLogOut, AnalyticsOut

router = APIRouter()


@router.post("/start/{contact_id}")
async def start_call_route(
    contact_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    return await start_call(db, contact_id)

@router.post("/log", response_model=CallLogOut)
async def create_call_log(
    log_data: CallLogCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    new_log = CallLog(
        contact_id=log_data.contact_id,
        status=log_data.status,
        transcript=log_data.transcript,
        duration=log_data.duration,
    )
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

@router.get("/logs", response_model=List[CallLogOut])
async def get_call_logs(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Retrieve all call logs ordered by newest first
    stmt = select(CallLog).order_by(CallLog.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/analytics", response_model=AnalyticsOut)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Total calls
    total_calls_stmt = select(func.count(CallLog.id))
    total_calls_result = await db.execute(total_calls_stmt)
    total_calls = total_calls_result.scalar() or 0

    # Completed calls
    completed_calls_stmt = select(func.count(CallLog.id)).where(CallLog.status == "completed")
    completed_calls_result = await db.execute(completed_calls_stmt)
    completed_calls = completed_calls_result.scalar() or 0

    # Failed calls
    failed_calls_stmt = select(func.count(CallLog.id)).where(CallLog.status == "failed")
    failed_calls_result = await db.execute(failed_calls_stmt)
    failed_calls = failed_calls_result.scalar() or 0

    # Average duration
    avg_duration_stmt = select(func.avg(CallLog.duration))
    avg_duration_result = await db.execute(avg_duration_stmt)
    avg_duration = avg_duration_result.scalar() or 0.0

    return AnalyticsOut(
        total_calls=total_calls,
        completed_calls=completed_calls,
        failed_calls=failed_calls,
        average_duration_seconds=float(avg_duration)
    )