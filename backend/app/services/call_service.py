from sqlalchemy.ext.asyncio import AsyncSession
from app.models.call_log import CallLog
from app.services.ai_service import generate_ai_response
from app.services.voice_service import text_to_speech


async def start_call(db: AsyncSession, contact_id):

    # simulate user saying something
    user_input = "Hello, I am interested"

    ai_reply = await generate_ai_response(user_input)

    # convert AI response to speech
    audio_file = text_to_speech(ai_reply)

    call = CallLog(
        contact_id=contact_id,
        status="completed",
        transcript=f"User: {user_input}\n{ai_reply}",
        
    )

    db.add(call)
    await db.commit()
    await db.refresh(call)

    return call