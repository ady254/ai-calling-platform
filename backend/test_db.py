import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

async def test_conn():
    url = os.getenv("DATABASE_URL")
    print(f"Connecting to {url}...")
    try:
        engine = create_async_engine(url)
        async with engine.begin() as conn:
            print("Connected successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
