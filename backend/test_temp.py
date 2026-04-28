import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

async def test_conn():
    # Trying the password from the root .env
    url = "postgresql+asyncpg://postgres:Ady4026@localhost:5432/aicalling"
    print(f"Connecting to {url}...")
    try:
        engine = create_async_engine(url)
        async with engine.begin() as conn:
            print("Connected successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
