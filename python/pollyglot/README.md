# PollyGlot - Lightweight Web Translator

A modern, lightweight translator web application built with FastAPI and vanilla JavaScript. PollyGlot provides real-time translation using OpenRouter's AI models with a clean, responsive interface.

![PollyGlot Screenshot](docs/screenshot.png)

## Features

- **Real-time Translation**: Powered by OpenRouter's AI models (Claude, GPT-4, Gemini, etc.)
- **Auto-detection**: Automatically detect source language or choose manually
- **Multi-language Support**: 20+ languages including English, Spanish, French, German, and more
- **Smart UI**: Clean, responsive design with dark/light theme toggle
- **Translation History**: Persistent history of last 5 translations
- **Export Functions**: Copy to clipboard and download as text file
- **Language Swapping**: Quick swap between source and target languages
- **Keyboard Shortcuts**: Ctrl/Cmd+Enter to translate
- **Rate Limiting**: Built-in protection against API abuse
- **Production Ready**: Docker support, comprehensive testing, and monitoring

## Quick Start

### Prerequisites

- Python 3.11+
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Local Development

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd pollyglot
   make quick-start
   ```

2. **Configure environment**:
   ```bash
   # Edit .env file with your API key
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
   ```

3. **Start development server**:
   ```bash
   make dev
   ```

4. **Open in browser**: http://localhost:8000

### Docker Deployment

```bash
# Build and run with Docker Compose
make docker-run

# Or with Nginx proxy
make docker-run-proxy
```

## API Configuration

### Supported Models

PollyGlot supports any OpenRouter model. Popular choices:

- `anthropic/claude-3.5-sonnet` (Default - excellent for translation)
- `openai/gpt-4o` (High quality, slower)
- `google/gemini-pro-1.5` (Fast, good quality)
- `meta-llama/llama-3.1-8b-instruct` (Cost-effective)
- `mistralai/mistral-7b-instruct` (Fast, multilingual)

### Language Support

- Auto-detect
- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean, Chinese, Arabic, Hindi
- Dutch, Swedish, Danish, Norwegian, Finnish, Polish, Turkish

*Easy to extend - see `app/services/openrouter.py` for adding more languages.*

## Environment Variables

```bash
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PUBLIC_APP_URL=http://localhost:8000
RATE_LIMIT_PER_MIN=10
HOST=0.0.0.0
PORT=8000
DEBUG=false
REDIS_URL=redis://localhost:6379/0
```

## Development

### Available Commands

```bash
make help          # Show all available commands
make install       # Install dependencies
make dev           # Start development server
make test          # Run tests
make lint          # Run linting
make format        # Format code
make run           # Start production server
make docker-build  # Build Docker image
make clean         # Clean temporary files
```

### Project Structure

```
pollyglot/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── settings.py      # Configuration management
│   │   ├── logging.py       # Logging setup
│   │   └── rate_limit.py    # Rate limiting
│   ├── routers/
│   │   ├── translate.py     # Translation endpoints
│   │   └── health.py        # Health check
│   ├── services/
│   │   ├── openrouter.py    # OpenRouter API client
│   │   └── detect.py        # Language detection
│   ├── templates/
│   │   └── index.html       # Frontend template
│   └── static/
│       ├── css/styles.css   # Styles
│       └── js/app.js        # Frontend logic
├── tests/
│   └── test_translate.py    # Test suite
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container definition
├── docker-compose.yml     # Multi-service setup
└── Makefile               # Development commands
```

### API Endpoints

- `GET /` - Serve web interface
- `POST /api/translate` - Translate text
- `GET /healthz` - Health check

#### Translation Request

```json
{
  "text": "Hello world",
  "source": "en",
  "target": "es",
  "model": "anthropic/claude-3.5-sonnet"
}
```

#### Translation Response

```json
{
  "text": "Hola mundo",
  "source_language": "en",
  "target_language": "es",
  "model": "anthropic/claude-3.5-sonnet",
  "latency_ms": 245.7,
  "tokens_used": 15,
  "detected_language": null
}
```

## Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific test file
pytest tests/test_translate.py -v
```

## Security Features

- **Rate Limiting**: 10 requests/minute per IP (configurable)
- **Input Validation**: Pydantic models with strict validation
- **API Key Protection**: Server-side only, never exposed to frontend
- **CORS Configuration**: Restricted to same-origin + localhost
- **Error Handling**: Graceful handling of upstream failures
- **Request Logging**: Comprehensive audit trail

## Performance

- **Async Architecture**: Non-blocking I/O for high concurrency
- **Connection Pooling**: Efficient HTTP client with pooling
- **Retry Logic**: Exponential backoff for upstream failures
- **Caching Ready**: Redis integration for rate limiting
- **Resource Limits**: Configurable timeouts and limits

## Deployment

### Docker Production Setup

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your API key

# 2. Deploy with Docker Compose
docker-compose up -d

# 3. Check logs
docker-compose logs -f pollyglot

# 4. Health check
curl http://localhost:8000/healthz
```

### Manual Production Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Cost Considerations

Translation costs depend on your chosen model and usage:

- **Claude 3.5 Sonnet**: ~$3-15 per 1M tokens
- **GPT-4o**: ~$2.50-10 per 1M tokens  
- **Gemini Pro**: ~$0.50-1.50 per 1M tokens
- **Llama 3.1**: ~$0.18-0.54 per 1M tokens

Typical translation: 10-50 tokens. Rate limiting helps control costs.

## Rate Limiting

Default: 10 requests/minute per IP. Configure via:

```bash
RATE_LIMIT_PER_MIN=20
REDIS_URL=redis://localhost:6379/0  # For distributed rate limiting
```

## Monitoring

- Health endpoint: `/healthz`
- Request logging with latency and token usage
- Error tracking and retry metrics
- Prometheus metrics ready (see `app/core/logging.py`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `make check` to validate
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: GitHub Issues
- **Documentation**: This README and inline code comments
- **API Reference**: OpenAPI docs at `/docs` when running

---

**Note**: This application requires an OpenRouter API key and will incur costs based on usage. Monitor your usage through the OpenRouter dashboard.