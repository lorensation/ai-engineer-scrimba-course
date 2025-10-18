"""Rate limiting configuration using SlowAPI."""
from typing import Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request, Response
import redis
import logging

from .settings import settings

logger = logging.getLogger(__name__)


def _get_redis_client() -> Optional[redis.Redis]:
    """Get Redis client if URL is configured."""
    if settings.redis_url:
        try:
            client = redis.from_url(settings.redis_url)
            # Test connection
            client.ping()
            return client
        except Exception as e:
            logger.warning(f"Could not connect to Redis: {e}. Using in-memory storage.")
    return None


def _get_identifier(request: Request) -> str:
    """Get client identifier for rate limiting."""
    return get_remote_address(request)


# Initialize limiter with Redis if available, fallback to in-memory
redis_client = _get_redis_client()
if redis_client:
    limiter = Limiter(
        key_func=_get_identifier,
        storage_uri=settings.redis_url
    )
else:
    limiter = Limiter(
        key_func=_get_identifier,
        default_limits=[f"{settings.rate_limit_per_min}/minute"]
    )


def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom rate limit exceeded handler."""
    response = Response(
        content=f"Rate limit exceeded: {exc.detail}",
        status_code=429,
        headers={"Content-Type": "application/json"}
    )
    response.headers["Retry-After"] = str(exc.retry_after)
    return response


def setup_rate_limiting(app):
    """Setup rate limiting middleware and handlers."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)