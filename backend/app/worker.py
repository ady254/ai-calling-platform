"""
ARQ background worker.

Fix #5 / #27: Implements `process_campaign_task` which is enqueued by
`start_campaign_execution` in campaign_executor.py.  The worker picks it up
from Redis, calls the core `_process_campaign` loop, and gracefully honours
pause/stop flags written to Redis by `pause_campaign_execution` /
`stop_campaign_execution`.

Run the worker with:
    arq app.worker.WorkerSettings
"""
import logging
from uuid import UUID

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


async def process_campaign_task(ctx: dict, campaign_id: str, business_id: str) -> None:
    """
    ARQ task: run the campaign processing loop for one campaign.

    `ctx` is provided by ARQ and contains (among other things) `ctx['redis']`,
    which `_process_campaign` uses to poll the pause/stop control flag.

    Args:
        ctx:         ARQ worker context (injected automatically).
        campaign_id: String UUID of the campaign to process.
        business_id: String UUID of the owning business.
    """
    from app.services.campaign_executor import _process_campaign  # local import avoids circularity

    logger.info(f"Worker picked up campaign {campaign_id}")
    await _process_campaign(ctx, UUID(campaign_id), UUID(business_id))
    logger.info(f"Worker finished campaign {campaign_id}")


class WorkerSettings:
    functions = [process_campaign_task]
    redis_settings = parse_redis_url(settings.REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown
