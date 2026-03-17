from fastapi import FastAPI
from app.api.auth_routes import router as auth_router

from app.db.base import Base
from app.db.session import engine

app = FastAPI()


#  Create tables on startup
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth_router, prefix="/auth")