from sqlalchemy.ext.asyncio import AsyncSession
from app.models.call_log import CallLog


async def start_call(db: AsyncSession, contact_id):

    call = CallLog(
        contact_id=contact_id,
        status="started",
        transcript=""
    )

    db.add(call)
    await db.commit()
    await db.refresh(call)

    return call