"""Health check router."""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "pollyglot-translator"
    }