"""Application settings using Pydantic Settings."""
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenRouter Configuration
    openrouter_api_key: str
    openrouter_model: str = "anthropic/claude-3.5-sonnet"
    public_app_url: Optional[str] = None
    
    # Rate Limiting
    rate_limit_per_min: int = 10
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # Redis Configuration (optional)
    redis_url: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()