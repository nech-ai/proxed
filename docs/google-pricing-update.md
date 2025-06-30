# Google AI Pricing Update

## Overview

Updated the Google AI models and pricing in the proxy application based on the official Google AI pricing documentation (https://ai.google.dev/gemini-api/docs/pricing).

## Changes Made

### 1. Updated Pricing Configuration (`packages/utils/lib/pricing.ts`)

Added comprehensive Google model pricing with the following models and rates:

#### Gemini 2.5 Series
- **gemini-2.5-pro**: $1.25/$10.00 per 1M tokens (input/output)
- **gemini-2.5-flash**: $0.30/$2.50 per 1M tokens
- **gemini-2.5-flash-lite-preview-06-17**: $0.10/$0.40 per 1M tokens

#### Gemini 2.0 Series
- **gemini-2.0-flash**: $0.10/$0.40 per 1M tokens
- **gemini-2.0-flash-lite**: $0.075/$0.30 per 1M tokens

#### Gemini 1.5 Series
- **gemini-1.5-flash**: $0.075/$0.30 per 1M tokens (≤128k), higher for longer contexts
- **gemini-1.5-flash-8b**: $0.0375/$0.15 per 1M tokens (≤128k)
- **gemini-1.5-pro**: $1.25/$5.00 per 1M tokens (≤128k)

#### Legacy & Embedding Models
- **gemini-pro**: $0.50/$1.50 per 1M tokens (estimated)
- **gemini-pro-vision**: $0.50/$1.50 per 1M tokens (estimated)
- **gemini-embedding-exp**, **text-embedding-004**, **embedding-001**: $0.0625/$0.00 per 1M tokens

### 2. Pricing Logic Updates

- Added `GoogleModel` type import
- Created `GOOGLE_MODELS` pricing record
- Added `DEFAULT_GOOGLE_PRICING` fallback ($0.30/$1.50 per 1M tokens)
- Updated `getModelPricingWithFallback()` to handle Google provider
- Updated `getModelPricing()` to support Google models
- Added Google to `PROVIDER_MODELS` constant

## Important Notes

1. **Context-based Pricing**: Some models have different pricing tiers based on context length:
   - Models like Gemini 1.5 Pro charge more for prompts >128k tokens
   - Gemini 2.5 Pro charges more for prompts >200k tokens

2. **Multimodal Pricing**: The pricing shown is for text tokens. Audio/video inputs may have different rates:
   - Audio inputs typically cost more (e.g., $1.00 per 1M tokens for Gemini 2.5 Flash)
   - Video inputs are converted to tokens at specific rates

3. **Embedding Models**: These models only charge for input tokens as they don't generate text output.

4. **Default Pricing**: Unknown Google models will use conservative default pricing of $0.30/$1.50 per 1M tokens.

## Usage Example

```typescript
import { calculateCosts } from '@proxed/utils/lib/pricing';

const costs = calculateCosts({
  provider: 'GOOGLE',
  model: 'gemini-2.5-flash',
  promptTokens: 1000000,  // 1M tokens
  completionTokens: 500000 // 500K tokens
});

console.log(costs);
// Output: { promptCost: 0.3, completionCost: 1.25, totalCost: 1.55 }
```

## Testing

The pricing calculations work with:
- `calculateCosts()`: Calculate costs for a specific request
- `formatCostsForDB()`: Format costs for database storage (6 decimal places)
- `getModelPricing()`: Get pricing for a specific model

All existing tests continue to pass, and the Google pricing integrates seamlessly with the existing pricing infrastructure.