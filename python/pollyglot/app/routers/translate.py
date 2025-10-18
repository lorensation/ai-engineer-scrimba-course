"""Translation router with validation and rate limiting."""
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field, validator
from slowapi import Limiter

from ..core.rate_limit import limiter
from ..core.logging import log_translation
from ..services.openrouter import OpenRouterService
from ..services.detect import detector

router = APIRouter()


class TranslationRequest(BaseModel):
    """Request model for translation."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    source: str = Field(default="auto", description="Source language code")
    target: str = Field(..., description="Target language code")
    model: Optional[str] = Field(None, description="OpenRouter model to use")
    
    @validator("text")
    def validate_text(cls, v):
        """Validate text input."""
        if not v or not v.strip():
            raise ValueError("Text cannot be empty")
        return v.strip()
    
    @validator("source", "target")
    def validate_language_codes(cls, v):
        """Validate language codes."""
        valid_codes = {
            "auto", "en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", 
            "zh", "ar", "hi", "nl", "sv", "da", "no", "fi", "pl", "tr"
        }
        if v not in valid_codes:
            raise ValueError(f"Invalid language code: {v}")
        return v
    
    @validator("target")
    def validate_target_not_auto(cls, v):
        """Target language cannot be auto."""
        if v == "auto":
            raise ValueError("Target language cannot be 'auto'")
        return v


class TranslationResponse(BaseModel):
    """Response model for translation."""
    text: str
    source_language: str
    target_language: str
    model: str
    latency_ms: float
    tokens_used: Optional[int] = None
    detected_language: Optional[str] = None


# Initialize OpenRouter service
openrouter_service = OpenRouterService()


@router.post("/api/translate", response_model=TranslationResponse)
@limiter.limit("10/minute")
async def translate_text(request: Request, translation_request: TranslationRequest):
    """
    Translate text using OpenRouter API.
    
    Rate limited to 10 requests per minute per IP.
    """
    request_id = str(uuid.uuid4())
    
    try:
        # Detect source language if auto
        detected_language = None
        source_lang = translation_request.source
        
        if source_lang == "auto":
            detected_language = detector.detect_language(translation_request.text)
            if detected_language != "auto":
                source_lang = detected_language
        
        # Validate that source and target are different
        if source_lang == translation_request.target and source_lang != "auto":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source and target languages cannot be the same"
            )
        
        # Call translation service
        result = await openrouter_service.translate(
            text=translation_request.text,
            source=source_lang,
            target=translation_request.target,
            model=translation_request.model
        )
        
        # Log translation
        log_translation(
            request_id=request_id,
            source_lang=source_lang,
            target_lang=translation_request.target,
            model=result.model,
            latency_ms=result.latency_ms,
            tokens_used=result.tokens_used
        )
        
        # Handle translation errors
        if result.error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.error
            )
        
        return TranslationResponse(
            text=result.content,
            source_language=source_lang,
            target_language=translation_request.target,
            model=result.model,
            latency_ms=result.latency_ms,
            tokens_used=result.tokens_used,
            detected_language=detected_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation failed: {str(e)}"
        )