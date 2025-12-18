# Google AI Provider Integration

This document describes the implementation of Google AI (Gemini) provider support in the Proxed platform.

## Overview

The Google AI provider integration allows users to proxy requests to Google's Gemini models through the Proxed platform, providing the same security, monitoring, and management features available for OpenAI and Anthropic.

## Implementation Details

### 1. Provider Configuration

The Google provider has been added to the core providers list in `packages/utils/lib/providers.ts`:

```typescript
export const PROVIDERS = {
  OPENAI: "OPENAI",
  ANTHROPIC: "ANTHROPIC",
  GOOGLE: "GOOGLE",
} as const;
```

### 2. Supported Models

The following Google AI models are supported:

#### Gemini 3 (preview)
- `gemini-3-pro-preview` - Frontier multimodal model (preview)
- `gemini-3-flash-preview` - Low-latency, cost-efficient model (preview)
- `gemini-3-pro-image-preview` - Native image generation model (preview)

#### Gemini 2.5 Series
- `gemini-2.5-pro` - State-of-the-art thinking model
- `gemini-2.5-flash` - Best price-performance model
- `gemini-2.5-flash-lite` - Cost-efficient model

#### Gemini 2.0 Series
- `gemini-2.0-flash` - Next-gen features and improved capabilities
- `gemini-2.0-flash-lite` - Optimized for cost efficiency and low latency
- `gemini-2.0-flash-exp` - Experimental

#### Gemini 1.5 Series
- `gemini-1.5-flash` - Fast and versatile multimodal model
- `gemini-1.5-flash-8b` - Small model for lower intelligence tasks
- `gemini-1.5-pro` - Mid-size model for complex reasoning tasks

#### Imagen 4 (image generation)
- `imagen-4.0-generate-001` - Imagen 4 (default)
- `imagen-4.0-fast-generate-001` - Imagen 4 Fast
- `imagen-4.0-ultra-generate-001` - Imagen 4 Ultra

### 3. API Configuration

#### Environment Variables

Add the following to your `.env` file:

```bash
# Google AI API Configuration
GOOGLE_API_BASE=https://generativelanguage.googleapis.com/v1beta
GOOGLE_MAX_RETRIES=2
GOOGLE_RETRY_DELAY=1000
GOOGLE_TIMEOUT=120000
GOOGLE_DEBUG=false
```

#### Provider Headers

Google AI uses API key authentication with the following header:
- `x-goog-api-key: YOUR_API_KEY`

### 4. Request Format

Google AI uses a different request format compared to OpenAI. Here's an example:

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Hello, how are you?"
        }
      ]
    }
  ]
}
```

### 5. Response Format

Google AI responses have a unique structure:

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "I'm doing well, thank you!"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 5,
    "candidatesTokenCount": 7,
    "totalTokenCount": 12
  }
}
```

### 6. Finish Reasons

Google AI finish reasons are mapped to Proxed's standard finish reasons:

- `STOP` → `stop`
- `MAX_TOKENS` → `length`
- `SAFETY`, `RECITATION`, `PROHIBITED_CONTENT` → `content-filter`
- `OTHER` → `other`
- Others → `unknown`

### 7. Usage Tracking

Token usage is tracked using Google's response format:
- `promptTokenCount` → `promptTokens`
- `candidatesTokenCount` → `completionTokens`
- `totalTokenCount` → `totalTokens`

## API Endpoints

Google AI requests are proxied through:
```
https://api.proxed.ai/v1/google/{projectId}/{googleApiPath}
```

For example:
```
https://api.proxed.ai/v1/google/your-project-id/models/gemini-2.5-flash:generateContent
```

## Database Schema

The `provider_type` enum has been updated to include `GOOGLE`:

```sql
ALTER TYPE provider_type ADD VALUE 'GOOGLE';
```

## Testing

To test the Google AI integration:

1. Create a Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your Proxed account
3. Use the generated client key part in your requests
4. Test with a simple request:

```bash
curl -X POST https://api.proxed.ai/v1/google/YOUR_PROJECT_ID/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer YOUR_CLIENT_KEY_PART" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Explain how AI works"
      }]
    }]
  }'
```

## Monitoring

The Google provider integration includes:
- Circuit breaker protection
- Health checks to Google AI API
- Request/response logging
- Token usage tracking
- Error handling and retry logic

## Security

- API keys are split using the partial keys system
- All requests are authenticated and authorized
- Request/response data is encrypted in transit
- Usage is tracked per project and team
