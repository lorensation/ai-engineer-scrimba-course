"""OpenRouter service for handling translation requests."""
import asyncio
import time
from typing import Dict, Optional, Any
from dataclasses import dataclass
import httpx
import logging

from ..core.settings import settings

logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    """Result of a translation request."""
    content: str
    latency_ms: float
    model: str
    tokens_used: Optional[int] = None
    error: Optional[str] = None


class OpenRouterService:
    """Service for interacting with OpenRouter API."""
    
    BASE_URL = "https://openrouter.ai/api/v1"
    
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.default_model = settings.openrouter_model
        self.app_url = settings.public_app_url
        
    async def translate(
        self,
        text: str,
        source: str,
        target: str,
        model: Optional[str] = None
    ) -> TranslationResult:
        """
        Translate text using OpenRouter API.
        
        Args:
            text: Text to translate
            source: Source language (e.g., "auto", "en", "es")
            target: Target language (e.g., "en", "es", "fr")
            model: OpenRouter model to use (defaults to configured model)
            
        Returns:
            TranslationResult with translated content and metadata
        """
        start_time = time.time()
        model = model or self.default_model
        
        try:
            # Build the prompt based on source language
            if source == "auto":
                prompt = f"Translate the following text to {self._get_language_name(target)}:\n\n{text}"
            else:
                source_name = self._get_language_name(source)
                target_name = self._get_language_name(target)
                prompt = f"Translate the following {source_name} text to {target_name}:\n\n{text}"
            
            # Prepare request payload
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a translation engine. Only return the translated text without any additional commentary or explanation."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.1,
                "max_tokens": len(text) * 3  # Conservative estimate for translation
            }
            
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            if self.app_url:
                headers["HTTP-Referer"] = self.app_url
                headers["X-Title"] = "PollyGlot"
            
            # Make request with retries
            result = await self._make_request_with_retries(payload, headers)
            
            if result.error:
                return result
            
            latency_ms = (time.time() - start_time) * 1000
            
            return TranslationResult(
                content=result.content,
                latency_ms=latency_ms,
                model=model,
                tokens_used=result.tokens_used
            )
            
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            logger.error(f"Translation error: {str(e)}")
            
            return TranslationResult(
                content="",
                latency_ms=latency_ms,
                model=model,
                error=f"Translation failed: {str(e)}"
            )
    
    async def _make_request_with_retries(
        self,
        payload: Dict[str, Any],
        headers: Dict[str, str],
        max_retries: int = 3
    ) -> TranslationResult:
        """Make HTTP request with exponential backoff retries."""
        
        for attempt in range(max_retries + 1):
            try:
                timeout = httpx.Timeout(30.0)
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(
                        f"{self.BASE_URL}/chat/completions",
                        json=payload,
                        headers=headers
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"]
                            tokens_used = data.get("usage", {}).get("total_tokens")
                            
                            return TranslationResult(
                                content=content.strip(),
                                latency_ms=0,  # Will be set by caller
                                model=payload["model"],
                                tokens_used=tokens_used
                            )
                        else:
                            raise Exception("No translation content in response")
                    
                    elif response.status_code == 429:
                        # Rate limited, wait and retry
                        if attempt < max_retries:
                            wait_time = (2 ** attempt) + 1
                            logger.warning(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}")
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            return TranslationResult(
                                content="",
                                latency_ms=0,
                                model=payload["model"],
                                error="Rate limit exceeded"
                            )
                    
                    else:
                        error_msg = f"HTTP {response.status_code}: {response.text}"
                        if attempt < max_retries:
                            wait_time = (2 ** attempt) + 1
                            logger.warning(f"Request failed ({error_msg}), retrying in {wait_time}s")
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            return TranslationResult(
                                content="",
                                latency_ms=0,
                                model=payload["model"],
                                error=error_msg
                            )
                            
            except httpx.TimeoutException:
                if attempt < max_retries:
                    wait_time = (2 ** attempt) + 1
                    logger.warning(f"Request timeout, retrying in {wait_time}s")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    return TranslationResult(
                        content="",
                        latency_ms=0,
                        model=payload["model"],
                        error="Request timeout"
                    )
            
            except Exception as e:
                if attempt < max_retries:
                    wait_time = (2 ** attempt) + 1
                    logger.warning(f"Request error ({str(e)}), retrying in {wait_time}s")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    return TranslationResult(
                        content="",
                        latency_ms=0,
                        model=payload["model"],
                        error=str(e)
                    )
    
    def _get_language_name(self, code: str) -> str:
        """Convert language code to human-readable name."""
        language_map = {
            "auto": "Auto-detect",
            "en": "English",
            "es": "Spanish", 
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese",
            "ar": "Arabic",
            "hi": "Hindi",
            "nl": "Dutch",
            "sv": "Swedish",
            "da": "Danish",
            "no": "Norwegian",
            "fi": "Finnish",
            "pl": "Polish",
            "tr": "Turkish"
        }
        return language_map.get(code, code)