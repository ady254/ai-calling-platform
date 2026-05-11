import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def cleanup():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found")
        return
        
    engine = create_async_engine(database_url)
    async with engine.begin() as conn:
        print("Cleaning up data with NULL business_ids...")
        
        # 1. Delete campaign_contacts for campaigns/contacts with NULL business_id
        await conn.execute(text("""
            DELETE FROM campaign_contacts 
            WHERE campaign_id IN (SELECT id FROM campaigns WHERE business_id IS NULL)
            OR contact_id IN (SELECT id FROM contacts WHERE business_id IS NULL)
        """))
        
        # 2. Delete call_logs for contacts with NULL business_id
        await conn.execute(text("""
            DELETE FROM call_logs 
            WHERE contact_id IN (SELECT id FROM contacts WHERE business_id IS NULL)
            OR campaign_id IN (SELECT id FROM campaigns WHERE business_id IS NULL)
        """))
        
        # 3. Finally delete the contacts and campaigns
        await conn.execute(text("DELETE FROM contacts WHERE business_id IS NULL;"))
        await conn.execute(text("DELETE FROM campaigns WHERE business_id IS NULL;"))
        
        print("Done.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(cleanup())
