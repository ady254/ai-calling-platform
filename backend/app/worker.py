import logging
from arq.connections import RedisSettings
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")

def parse_redis_url(url: str) -> RedisSettings:
    # Basic parser for redis:// URL to RedisSettings
    import urllib.parse
    parsed = urllib.parse.urlparse(url)
    return RedisSettings(
        host=parsed.hostname or 'localhost',
        port=parsed.port or 6379,
        password=parsed.password,
        database=int(parsed.path.lstrip('/')) if parsed.path.lstrip('/') else 0
    )

async def startup(ctx):
    logger.info("Worker starting up...")
    ctx['redis'] = parse_redis_url(settings.REDIS_URL)

async def shutdown(ctx):
    logger.info("Worker shutting down...")

async def sample_task(ctx, message: str):
    logger.info(f"Executing sample task with message: {message}")
    return True

class WorkerSettings:
    functions = [sample_task]
    redis_settings = parse_redis_url(settings.REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown
