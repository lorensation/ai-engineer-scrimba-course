"""Main FastAPI application."""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .core.settings import settings
from .core.logging import setup_logging, get_logger
from .core.rate_limit import setup_rate_limiting
from .routers import health, translate

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting PollyGlot Translator API")
    logger.info(f"Using model: {settings.openrouter_model}")
    logger.info(f"Rate limit: {settings.rate_limit_per_min} requests/minute")
    
    yield
    
    # Shutdown
    logger.info("Shutting down PollyGlot Translator API")


# Create FastAPI app
app = FastAPI(
    title="PollyGlot Translator",
    description="A lightweight translator web app using OpenRouter API",
    version="1.0.0",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Setup rate limiting
setup_rate_limiting(app)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(translate.router, tags=["translation"])

# Setup templates and static files
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
async def serve_index(request: Request):
    """Serve the main application page."""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "app_title": "PollyGlot",
            "default_model": settings.openrouter_model
        }
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors by serving the main page (SPA behavior)."""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "app_title": "PollyGlot",
            "default_model": settings.openrouter_model
        },
        status_code=200
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )