# Azure OpenAI Integration

SPECTRA now supports Azure OpenAI as an alternative to standard OpenAI services. This integration provides the same functionality with Azure's infrastructure and compliance features.

## Configuration

Add the following environment variables to your `.env` file:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### Getting Azure OpenAI Credentials

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to your Azure OpenAI resource
3. In the resource overview, find:
   - **API Key**: Go to "Keys and Endpoint" section
   - **Endpoint**: Listed in the "Keys and Endpoint" section
   - **Deployment**: Go to "Model deployments" to see your deployment names

## Usage

### Using the LLM Client

```javascript
import { queryLLM } from './llm_integrations/llm_client.js';

// Query Azure OpenAI
const response = await queryLLM('Hello, world!', 'azure-openai', {
  maxTokens: 150,
  temperature: 0.7,
  deployment: 'your-deployment-name' // Optional, uses environment default
});

console.log(response);
```

### Using the API Endpoint

```javascript
// POST to /api/azure-openai/chat
const response = await fetch('/api/azure-openai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, Azure OpenAI!' }
    ],
    temperature: 0.7,
    max_tokens: 150
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## Testing

Test your Azure OpenAI integration:

```bash
# Basic configuration test
npm run test:azure-openai

# Comprehensive integration test
npm run test:azure-integration

# Test with real API calls (requires valid credentials)
node test-azure-openai-real.js
```

## Health Check

The Azure OpenAI service status is included in the health check endpoint:

```bash
GET /api/health
```

Response includes:
```json
{
  "services": {
    "azureOpenai": {
      "configured": true,
      "healthy": true,
      "responseTime": 245,
      "endpoint": "https://your-resource.openai.azure.com/",
      "deployment": "your-deployment"
    }
  }
}
```

## Supported Models

Azure OpenAI supports various models depending on your deployment:
- GPT-4 variants (gpt-4, gpt-4-turbo, gpt-4o)
- GPT-3.5 variants (gpt-3.5-turbo)
- Custom fine-tuned models

The model name should match your deployment name in Azure OpenAI.

## Error Handling

Common error scenarios and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Azure OpenAI not configured` | Missing environment variables | Set `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` |
| `Authentication failed` | Invalid API key | Verify your API key in Azure Portal |
| `Deployment not found` | Wrong deployment name | Check deployment name in Azure OpenAI Studio |
| `Rate limit exceeded` | Too many requests | Implement rate limiting or increase quota |
| `Connection timeout` | Network or service issues | Check Azure service status |

## Migration from OpenAI

To migrate from standard OpenAI to Azure OpenAI:

1. Set up Azure OpenAI resource and deployment
2. Update environment variables to use Azure OpenAI configuration
3. Change provider from `'openai'` to `'azure-openai'` in your code
4. Test the integration with the new credentials

The API interface remains the same, only the provider configuration changes.