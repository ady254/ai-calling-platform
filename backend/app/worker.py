"""
ARQ background worker.

TECH DEBT (#27): This worker currently only has a stub `sample_task`.
The campaign execution engine (app/services/campaign_executor.py) runs
campaigns as in-process asyncio tasks instead of using this queue.

Migration path to move campaigns here:
  1. Add a `process_campaign_task(ctx, campaign_id: str, business_id: str)` function
     that calls `_process_campaign(UUID(campaign_id), UUID(business_id))`.
  2. In `start_campaign_execution`, enqueue via:
       pool = await arq.create_pool(RedisSettings(...))
       await pool.enqueue_job("process_campaign_task", str(campaign_id), str(business_id))
  3. For pause/stop: set a Redis flag keyed by campaign_id; the worker polls it
     at the start of each contact loop iteration.
  4. Remove `_running_campaigns` and asyncio.create_task usage from the executor.

This enables:
  - Crash recovery (ARQ persists job state in Redis)
  - Horizontal scaling (multiple worker replicas dequeue from one Redis list)
  - Visibility (ARQ dashboard, job status, retries)
"""
import logging
from arq.connections import RedisSettings
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("worker")


def parse_redis_url(url: str) -> RedisSettings:
    """Parse a redis:// URL into an ARQ RedisSettings object."""
    import urllib.parse
    parsed = urllib.parse.urlparse(url)
    return RedisSettings(
        host=parsed.hostname or "localhost",
        port=parsed.port or 6379,
        password=parsed.password,
        database=int(parsed.path.lstrip("/")) if parsed.path.lstrip("/") else 0,
    )


async def startup(ctx: dict) -> None:
    logger.info("Worker starting up...")


async def shutdown(ctx: dict) -> None:
    logger.info("Worker shutting down...")


async def sample_task(ctx: dict, message: str) -> bool:
    """Placeholder task — replace with real campaign processing (see module docstring)."""
    logger.info(f"Executing sample task with message: {message}")
    return True


class WorkerSettings:
    functions = [sample_task]
    redis_settings = parse_redis_url(settings.REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown
