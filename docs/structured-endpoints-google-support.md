# Structured Endpoints - Google AI Support

This document describes the Google AI (Gemini) provider support for the structured response endpoints (text, vision, and PDF).

## Overview

The structured response endpoints now fully support Google AI models, providing the same functionality as OpenAI and Anthropic providers. These endpoints automatically select appropriate models based on the task type and validate model capabilities.

## Endpoints

### 1. Text Endpoint (`/v1/text`)

Processes text input and returns structured data according to the project's schema.

**Supported Google Models:**
- `gemini-2.5-pro` ✨ (recommended)
- `gemini-2.5-flash` ✨
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-pro`

**Example Request:**
```bash
curl -X POST https://api.proxed.ai/v1/text/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_CLIENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Extract key information from this text..."
  }'
```

### 2. Vision Endpoint (`/v1/vision`)

Analyzes images and returns structured data according to the project's schema.

**Supported Google Models:**
- `gemini-2.5-pro` ✨ (recommended for vision)
- `gemini-2.5-flash` ✨
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-pro`
- `gemini-pro-vision`

**Note:** Embedding models (`gemini-embedding-exp`, `text-embedding-004`, `embedding-001`) do NOT support vision inputs.

**Example Request:**
```bash
curl -X POST https://api.proxed.ai/v1/vision/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_CLIENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }'
```

### 3. PDF Endpoint (`/v1/pdf`)

Processes PDF documents and returns structured data according to the project's schema.

**Supported Google Models:**
- `gemini-2.5-pro` ✨ (recommended for documents)
- `gemini-2.5-flash` ✨
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-pro`

**Note:** Embedding models do NOT support PDF inputs.

**Example Request:**
```bash
curl -X POST https://api.proxed.ai/v1/pdf/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_CLIENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pdf": "data:application/pdf;base64,JVBERi0xLjQK..."
  }'
```

## Model Selection

### Automatic Model Selection

If no model is specified in the project configuration, the endpoints will automatically select an appropriate default model:

| Provider | Default Model | Reason |
|----------|--------------|---------|
| OPENAI | `gpt-4o` | Best structured output support |
| ANTHROPIC | `claude-3-5-sonnet-latest` | Latest capabilities |
| GOOGLE | `gemini-1.5-pro` | Reliable structured outputs |

### Model Validation

The endpoints validate that the selected model supports the required capabilities:

1. **Structured Outputs**: Required for all endpoints
   - Gemini 1.5+ models ✓
   - Gemini 2.x models ✓
   - gemini-pro ✓
   - Embedding models ✗

2. **Vision Support**: Required for `/v1/vision`
   - All Gemini models except embedding models ✓
   - Embedding models ✗

3. **PDF Support**: Required for `/v1/pdf`
   - Gemini 1.5+ models ✓
   - Gemini 2.x models ✓
   - gemini-pro ✓
   - Embedding models ✗

## Error Handling

### Model Capability Errors

If a model doesn't support the required capability, you'll receive a 400 error:

```json
{
  "error": "Model gemini-embedding-exp does not support vision inputs for provider GOOGLE",
  "code": "VALIDATION_ERROR"
}
```

### Solutions:
1. Change to a supported model in your project settings
2. Let the system use the default model by not specifying one
3. Check the model compatibility table above

## Best Practices

### 1. Model Selection
- Use `gemini-2.5-pro` for complex reasoning tasks
- Use `gemini-2.5-flash` for faster, cost-effective processing
- Use `gemini-1.5-pro` for stable, production workloads

### 2. Schema Design
- Google models work best with well-defined schemas
- Include clear descriptions for each field
- Use appropriate data types (string, number, boolean, array, object)

### 3. Prompts
- Google models respond well to structured prompts
- Include examples in your system prompt when possible
- Be specific about the expected output format

### 4. Error Handling
- Always handle model validation errors
- Implement fallback logic for unsupported models
- Monitor usage to ensure model availability

## Migration Guide

### From OpenAI/Anthropic to Google

1. **Update API Key**: Add a Google AI API key to your account
2. **Update Project**: Select the Google provider key in project settings
3. **Choose Model**: Select an appropriate Gemini model or use defaults
4. **Test**: The same API calls will now use Google AI

### Example Migration:

**Before (OpenAI):**
```javascript
const response = await fetch('https://api.proxed.ai/v1/text/PROJECT_ID', {
  headers: {
    'Authorization': 'Bearer OPENAI_CLIENT_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: "Analyze this" })
});
```

**After (Google):**
```javascript
const response = await fetch('https://api.proxed.ai/v1/text/PROJECT_ID', {
  headers: {
    'Authorization': 'Bearer GOOGLE_CLIENT_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: "Analyze this" })
});
```

The request format remains the same - only the provider key changes!

## Performance Considerations

### Response Times
- `gemini-2.5-flash`: Fastest response times
- `gemini-1.5-flash`: Good balance of speed and capability
- `gemini-2.5-pro`: Slower but highest quality

### Token Limits
- Input: Varies by model (8K to 1M tokens)
- Output: Typically 8K tokens
- PDF processing: May require more tokens

### Cost Optimization
- Use `gemini-2.5-flash` for high-volume, simple tasks
- Reserve `gemini-2.5-pro` for complex reasoning
- Monitor token usage through the dashboard

## Troubleshooting

### Common Issues

1. **"Model not found"**
   - Ensure you're using a valid model name
   - Check if the model is available in your region

2. **"Structured outputs not supported"**
   - Verify you're not using an embedding model
   - Update to a supported model

3. **"Timeout errors"**
   - PDF processing may take longer
   - Consider using a faster model
   - Check file size limits

### Debug Tips
- Check response headers for debugging info:
  - `X-Proxed-Provider`: Confirms Google is being used
  - `X-Proxed-Model`: Shows actual model used
  - `X-Proxed-Latency`: Response time in ms