# OpenRouter API Integration

This directory contains the OpenRouter API integration for SPECTRA, supporting the `@preset/spectra` model and other OpenRouter models.

## Endpoint

**POST** `/api/openrouter/chat`

## Features

- 🎯 **Default Model**: `@preset/spectra` (as specified in the problem statement)
- 🔄 **OpenAI Compatible**: Accepts standard OpenAI chat completion format
- 🔐 **Server-side API Key**: Secure API key handling (no client-side exposure)
- 🌐 **CORS Enabled**: Works with web applications
- ⚡ **Error Handling**: Comprehensive validation and error responses

## Usage

### Python (Exact format from problem statement)

```python
import requests
import json
import os

url = "https://your-app.vercel.app/api/openrouter/chat"  # Your deployed endpoint
headers = {
    "Content-Type": "application/json"
}
payload = {
    "model": "@preset/spectra",
    "messages": [
        {
            "role": "user",
            "content": "Hello! How are you today?"
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

### JavaScript/TypeScript

```javascript
// Using the backend API client
import { backendApi } from '@/lib/backend-api';

const response = await backendApi.openRouterChat([
    { role: 'user', content: 'Hello! How are you today?' }
], {
    model: '@preset/spectra',  // Optional - this is the default
    temperature: 0.7,
    max_tokens: 1000
});
```

### Direct HTTP Request

```bash
curl -X POST https://your-app.vercel.app/api/openrouter/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "@preset/spectra",
    "messages": [
      {
        "role": "user",
        "content": "Hello! How are you today?"
      }
    ]
  }'
```

## Request Format

```typescript
{
  "model": "@preset/spectra",        // Default: "@preset/spectra"
  "messages": [                      // Required: Array of messages
    {
      "role": "user",               // "user", "assistant", or "system"
      "content": "Your message"     // String content
    }
  ],
  "temperature": 0.7,               // Optional: 0-1, default 0.7
  "max_tokens": 1000,               // Optional: max response tokens, default 1000
  "stream": false                   // Optional: streaming, default false
}
```

## Response Format

### Success (200)

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "@preset/spectra",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Error Responses

**Missing API Key (500)**
```json
{
  "error": "OpenRouter API key not configured"
}
```

**Invalid Input (400)**
```json
{
  "error": "Messages array is required"
}
```

**OpenRouter API Error (various)**
```json
{
  "error": "OpenRouter API error",
  "details": "Detailed error message from OpenRouter"
}
```

## Setup

### Environment Variables

Add to your `.env` file:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Getting an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Create an account
3. Generate an API key
4. Add it to your environment variables

### Deployment

Deploy to Vercel and set the environment variable in your project settings:

```bash
vercel env add OPENROUTER_API_KEY
```

## Supported Models

While the endpoint defaults to `@preset/spectra`, you can use any OpenRouter model by specifying it in the request:

- `@preset/spectra` (default)
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-2`
- `google/palm-2-chat-bison`
- `meta-llama/llama-2-70b-chat`
- And many more...

## Testing

### Local Testing

```bash
# Test the endpoint structure
npm run test:api

# Test with curl (requires server running)
./scripts/test-openrouter-endpoint.sh

# Test Python compatibility
python3 scripts/test-python-compatibility.py
```

### Browser Testing

Open `test-openrouter.html` in your browser to test the endpoint interactively.

## Integration with SPECTRA

The OpenRouter endpoint is automatically available in the SPECTRA backend API client:

```typescript
import { backendApi } from '@/lib/backend-api';

// Use OpenRouter with @preset/spectra
const response = await backendApi.openRouterChat(messages);

// Compare with other providers
const openaiResponse = await backendApi.openAIChat(messages);
const hfResponse = await backendApi.huggingFaceChat(messages);
```

## Security

- ✅ API keys are handled server-side only
- ✅ No client-side API key exposure
- ✅ CORS headers properly configured
- ✅ Input validation and sanitization
- ✅ Error handling without sensitive data leakage

---

🎉 **Ready for production!** This endpoint provides seamless integration with OpenRouter while maintaining the security and reliability standards of the SPECTRA platform.