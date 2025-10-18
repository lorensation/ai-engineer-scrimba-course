"""Tests for the translation API."""
import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import json

from app.main import app
from app.services.openrouter import TranslationResult

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health check returns OK."""
        response = client.get("/healthz")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        assert data["service"] == "pollyglot-translator"


class TestTranslationEndpoint:
    """Test translation endpoint."""
    
    @patch('app.routers.translate.openrouter_service.translate')
    def test_successful_translation(self, mock_translate):
        """Test successful translation request."""
        # Mock successful translation
        mock_translate.return_value = TranslationResult(
            content="Hola mundo",
            latency_ms=250.5,
            model="anthropic/claude-3.5-sonnet",
            tokens_used=15
        )
        
        response = client.post("/api/translate", json={
            "text": "Hello world",
            "source": "en",
            "target": "es"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["text"] == "Hola mundo"
        assert data["source_language"] == "en"
        assert data["target_language"] == "es"
        assert data["model"] == "anthropic/claude-3.5-sonnet"
        assert data["latency_ms"] == 250.5
        assert data["tokens_used"] == 15
        assert data["detected_language"] is None
    
    @patch('app.routers.translate.openrouter_service.translate')
    @patch('app.routers.translate.detector.detect_language')
    def test_auto_detection(self, mock_detect, mock_translate):
        """Test translation with auto-detection."""
        # Mock language detection
        mock_detect.return_value = "en"
        
        # Mock successful translation
        mock_translate.return_value = TranslationResult(
            content="Bonjour le monde",
            latency_ms=300.0,
            model="anthropic/claude-3.5-sonnet",
            tokens_used=18
        )
        
        response = client.post("/api/translate", json={
            "text": "Hello world",
            "source": "auto",
            "target": "fr"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["text"] == "Bonjour le monde"
        assert data["source_language"] == "en"
        assert data["target_language"] == "fr"
        assert data["detected_language"] == "en"
        
        # Verify detection was called
        mock_detect.assert_called_once_with("Hello world")
        
        # Verify translation was called with detected language
        mock_translate.assert_called_once_with(
            text="Hello world",
            source="en",
            target="fr",
            model=None
        )
    
    def test_validation_errors(self):
        """Test request validation errors."""
        # Empty text
        response = client.post("/api/translate", json={
            "text": "",
            "source": "en",
            "target": "es"
        })
        assert response.status_code == 422
        
        # Invalid source language
        response = client.post("/api/translate", json={
            "text": "Hello",
            "source": "invalid",
            "target": "es"
        })
        assert response.status_code == 422
        
        # Invalid target language
        response = client.post("/api/translate", json={
            "text": "Hello",
            "source": "en",
            "target": "invalid"
        })
        assert response.status_code == 422
        
        # Target cannot be auto
        response = client.post("/api/translate", json={
            "text": "Hello",
            "source": "en",
            "target": "auto"
        })
        assert response.status_code == 422
        
        # Text too long
        response = client.post("/api/translate", json={
            "text": "x" * 5001,
            "source": "en",
            "target": "es"
        })
        assert response.status_code == 422
    
    def test_same_language_error(self):
        """Test error when source and target are the same."""
        response = client.post("/api/translate", json={
            "text": "Hello world",
            "source": "en",
            "target": "en"
        })
        
        assert response.status_code == 400
        assert "cannot be the same" in response.json()["detail"]
    
    @patch('app.routers.translate.openrouter_service.translate')
    def test_translation_service_error(self, mock_translate):
        """Test handling of translation service errors."""
        # Mock translation error
        mock_translate.return_value = TranslationResult(
            content="",
            latency_ms=100.0,
            model="anthropic/claude-3.5-sonnet",
            error="API rate limit exceeded"
        )
        
        response = client.post("/api/translate", json={
            "text": "Hello world",
            "source": "en",
            "target": "es"
        })
        
        assert response.status_code == 500
        assert "API rate limit exceeded" in response.json()["detail"]
    
    @patch('app.routers.translate.openrouter_service.translate')
    def test_custom_model(self, mock_translate):
        """Test translation with custom model."""
        mock_translate.return_value = TranslationResult(
            content="Hola mundo",
            latency_ms=200.0,
            model="openai/gpt-4o",
            tokens_used=12
        )
        
        response = client.post("/api/translate", json={
            "text": "Hello world",
            "source": "en",
            "target": "es",
            "model": "openai/gpt-4o"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["model"] == "openai/gpt-4o"
        
        # Verify custom model was passed to service
        mock_translate.assert_called_once_with(
            text="Hello world",
            source="en",
            target="es",
            model="openai/gpt-4o"
        )


class TestOpenRouterService:
    """Test OpenRouter service integration."""
    
    @pytest.fixture
    def mock_httpx_response(self):
        """Mock HTTP response fixture."""
        class MockResponse:
            def __init__(self, status_code, json_data):
                self.status_code = status_code
                self._json_data = json_data
            
            def json(self):
                return self._json_data
        
        return MockResponse
    
    @patch('app.services.openrouter.httpx.AsyncClient')
    @pytest.mark.asyncio
    async def test_successful_translation_service(self, mock_client_class, mock_httpx_response):
        """Test successful OpenRouter API call."""
        from app.services.openrouter import OpenRouterService
        
        # Mock HTTP response
        mock_response = mock_httpx_response(200, {
            "choices": [{
                "message": {
                    "content": "Hola mundo"
                }
            }],
            "usage": {
                "total_tokens": 15
            }
        })
        
        # Mock client
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        mock_client_class.return_value.__aenter__.return_value = mock_client
        
        service = OpenRouterService()
        result = await service.translate("Hello world", "en", "es")
        
        assert result.content == "Hola mundo"
        assert result.tokens_used == 15
        assert result.error is None
        assert result.latency_ms > 0
    
    @patch('app.services.openrouter.httpx.AsyncClient')
    @pytest.mark.asyncio
    async def test_rate_limit_handling(self, mock_client_class, mock_httpx_response):
        """Test rate limit handling with retries."""
        from app.services.openrouter import OpenRouterService
        
        # Mock rate limit response followed by success
        mock_rate_limit = mock_httpx_response(429, {"error": "Rate limited"})
        mock_success = mock_httpx_response(200, {
            "choices": [{
                "message": {
                    "content": "Hola mundo"
                }
            }]
        })
        
        # Mock client with rate limit then success
        mock_client = AsyncMock()
        mock_client.post.side_effect = [mock_rate_limit, mock_success]
        mock_client_class.return_value.__aenter__.return_value = mock_client
        
        service = OpenRouterService()
        
        # Patch sleep to avoid waiting in tests
        with patch('asyncio.sleep'):
            result = await service.translate("Hello world", "en", "es")
        
        assert result.content == "Hola mundo"
        assert result.error is None
        
        # Verify retries were attempted
        assert mock_client.post.call_count == 2
    
    @patch('app.services.openrouter.httpx.AsyncClient')
    @pytest.mark.asyncio
    async def test_timeout_handling(self, mock_client_class):
        """Test timeout handling."""
        from app.services.openrouter import OpenRouterService
        import httpx
        
        # Mock client that raises timeout
        mock_client = AsyncMock()
        mock_client.post.side_effect = httpx.TimeoutException("Request timeout")
        mock_client_class.return_value.__aenter__.return_value = mock_client
        
        service = OpenRouterService()
        
        with patch('asyncio.sleep'):
            result = await service.translate("Hello world", "en", "es")
        
        assert result.content == ""
        assert "timeout" in result.error.lower()


class TestLanguageDetection:
    """Test language detection service."""
    
    def test_english_detection(self):
        """Test English text detection."""
        from app.services.detect import detector
        
        text = "The quick brown fox jumps over the lazy dog. This is a test."
        result = detector.detect_language(text)
        assert result == "en"
    
    def test_spanish_detection(self):
        """Test Spanish text detection."""
        from app.services.detect import detector
        
        text = "El rápido zorro marrón salta sobre el perro perezoso. Esta es una prueba."
        result = detector.detect_language(text)
        assert result == "es"
    
    def test_short_text_fallback(self):
        """Test fallback for short text."""
        from app.services.detect import detector
        
        text = "Hi"
        result = detector.detect_language(text)
        assert result == "auto"
    
    def test_unknown_language_fallback(self):
        """Test fallback for unknown language."""
        from app.services.detect import detector
        
        text = "xyz abc def ghi jkl mno pqr stu vwx"
        result = detector.detect_language(text)
        assert result == "auto"


# Test fixtures and utilities
@pytest.fixture
def sample_translation_request():
    """Sample translation request for testing."""
    return {
        "text": "Hello world",
        "source": "en",
        "target": "es"
    }


@pytest.fixture
def sample_translation_response():
    """Sample translation response for testing."""
    return {
        "text": "Hola mundo",
        "source_language": "en",
        "target_language": "es",
        "model": "anthropic/claude-3.5-sonnet",
        "latency_ms": 250.5,
        "tokens_used": 15,
        "detected_language": None
    }


if __name__ == "__main__":
    pytest.main([__file__])