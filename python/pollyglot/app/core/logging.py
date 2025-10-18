"""Logging configuration for the application."""
import logging
import sys
from typing import Any, Dict

from .settings import settings


def setup_logging() -> None:
    """Setup application logging configuration."""
    
    # Configure log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Set log level based on debug setting
    log_level = logging.DEBUG if settings.debug else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("fastapi").setLevel(log_level)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name."""
    return logging.getLogger(name)


def log_request(
    request_id: str,
    method: str,
    path: str,
    status_code: int,
    latency_ms: float,
    extra_data: Dict[str, Any] = None
) -> None:
    """Log HTTP request details."""
    logger = get_logger("pollyglot.request")
    
    log_data = {
        "request_id": request_id,
        "method": method,
        "path": path,
        "status_code": status_code,
        "latency_ms": latency_ms
    }
    
    if extra_data:
        log_data.update(extra_data)
    
    logger.info(f"Request completed: {log_data}")


def log_translation(
    request_id: str,
    source_lang: str,
    target_lang: str,
    model: str,
    latency_ms: float,
    tokens_used: int = None
) -> None:
    """Log translation request details."""
    logger = get_logger("pollyglot.translation")
    
    log_data = {
        "request_id": request_id,
        "source_lang": source_lang,
        "target_lang": target_lang,
        "model": model,
        "latency_ms": latency_ms
    }
    
    if tokens_used:
        log_data["tokens_used"] = tokens_used
    
    logger.info(f"Translation completed: {log_data}")