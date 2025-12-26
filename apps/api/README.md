# Proxed API Proxy Service

## Overview

The Proxed API Proxy Service is a secure, high-performance proxy for AI model APIs (OpenAI, Anthropic) with built-in authentication, rate limiting, monitoring, and error handling.

## Features

### Security
- **Request validation**: Validates incoming requests for security concerns
- **Header sanitization**: Removes sensitive and platform-specific headers before forwarding
- **Token-based authentication**: Supports device tokens and test keys
- **Rate limiting**: Prevents abuse with configurable rate limits

### Reliability
- **Automatic retries**: Configurable retry logic with exponential backoff
- **Circuit breaker**: Prevents cascading failures
- **Timeout handling**: Configurable request timeouts
- **Error tracking**: Comprehensive error logging and metrics

### Performance
- **Database read replicas**: Smart routing for read operations
- **Response caching**: Via filtered headers
- **Connection pooling**: Efficient database connections
- **Metrics collection**: Request counts, latency histograms, error rates

### Observability
- **Structured logging**: JSON logs with request context
- **Metrics endpoint**: Real-time metrics (development only)
- **Geo tracking**: Track request origins
- **Execution history**: Detailed request/response logging

## Configuration

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_BASE=https://api.openai.com/v1  # Base URL for OpenAI API
OPENAI_MAX_RETRIES=2                       # Maximum retry attempts
OPENAI_RETRY_DELAY=1000                    # Base delay for retries (ms)
OPENAI_TIMEOUT=120000                      # Request timeout (ms)
OPENAI_DEBUG=false                         # Enable debug logging

# Anthropic Configuration
ANTHROPIC_API_BASE=https://api.anthropic.com/v1
ANTHROPIC_MAX_RETRIES=2
ANTHROPIC_RETRY_DELAY=1000
ANTHROPIC_TIMEOUT=120000
ANTHROPIC_DEBUG=false

# General Configuration
NODE_ENV=production                        # Environment (development/production)
LOG_LEVEL=info                            # Log level (debug/info/warn/error)
SUPPRESS_WAITUNTIL_WARNING=false          # Suppress waitUntil warnings in dev

# Database Configuration
DATABASE_PRIMARY_URL=postgres://...        # Primary database URL
DATABASE_LHR_URL=postgres://...           # London replica URL
```

## API Endpoints

### OpenAI Proxy
```
POST /v1/openai/:projectId/chat/completions
POST /v1/openai/:projectId/completions
POST /v1/openai/:projectId/embeddings
...
```

### Anthropic Proxy
```
POST /v1/anthropic/:projectId/messages
POST /v1/anthropic/:projectId/complete
...
```

### Health & Monitoring
```
GET /health           # Basic health check
GET /geo-info        # Get geo information from headers
GET /metrics         # Get current metrics (dev only)
```

## Authentication

The proxy supports two authentication methods:

### 1. Device Token (Production)
```bash
curl -X POST https://api.proxed.ai/v1/openai/PROJECT_ID/chat/completions \
  -H "Authorization: Bearer API_KEY.DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [...]}'
```

### 2. Test Key (Development)
```bash
curl -X POST https://api.proxed.ai/v1/openai/PROJECT_ID/chat/completions \
  -H "Authorization: Bearer API_KEY.TEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [...]}'
```

## Error Handling

The proxy implements comprehensive error handling:

### Retry Logic
- Automatic retries for transient errors (429, 502, 503, 504)
- Exponential backoff with jitter
- Configurable retry limits

### Error Responses
```json
{
  "error": "PROVIDER_ERROR",
  "message": "Request timeout",
  "details": {
    "timeout": 30000,
    "targetUrl": "https://api.openai.com/v1/chat/completions"
  },
  "requestId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Metrics

The proxy collects the following metrics:

- **Request counts**: By provider, project, method, and status
- **Error counts**: By provider, project, and error type
- **Latency histograms**: P50, P95, P99 latencies
- **Rate limit hits**: Track rate limit violations

Access metrics in development:
```bash
curl http://localhost:3000/metrics
```

## Security Best Practices

1. **Never expose API keys**: The proxy handles key management securely
2. **Use HTTPS**: Always use HTTPS in production
3. **Monitor rate limits**: Set up alerts for rate limit violations
4. **Rotate keys regularly**: Use the key rotation feature
5. **Audit logs**: Review execution logs regularly

## Development

### Running Locally
```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test
```

### Adding a New Provider

1. Add provider configuration to `utils/provider-config.ts`
2. Create response mapper in `utils/[provider].ts`
3. Create route handler in `routes/[provider].ts`
4. Add provider type to `types.ts`
5. Update router in `routers.ts`

## Deployment

The proxy is optimized for edge deployment:

- **Vercel**: Automatic deployment with edge functions
- **Cloudflare Workers**: Global edge deployment
- **Fly.io**: Multi-region deployment with read replicas

## Monitoring

### Logs
- Structured JSON logs for easy parsing
- Request IDs for tracing
- Geo information for analytics

### Alerts
Set up alerts for:
- High error rates
- Slow response times
- Rate limit violations
- Authentication failures

## Support

For issues or questions:
- GitHub Issues: https://github.com/proxed-ai/proxed
- Documentation: https://docs.proxed.ai
- Email: support@proxed.ai
