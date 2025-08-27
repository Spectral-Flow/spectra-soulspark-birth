import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from '../utils/logger';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  getApiKey,
  fetchWithTimeout,
  validateRequired,
  applyRateLimit
} from '../utils/common';

const logger = createLogger('azure-openai-chat');

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

/**
 * Azure OpenAI Chat Completion API Proxy with enhanced validation
 * Securely handles Azure OpenAI chat requests with server-side API keys
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', undefined, undefined, requestId);
  }

  // Apply rate limiting
  if (!applyRateLimit(req, res)) {
    return;
  }

  const apiKey = getApiKey('AZURE_OPENAI_API_KEY');
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';

  if (!apiKey || !endpoint) {
    return sendError(res, 500, 'Azure OpenAI not configured', 'Azure OpenAI service temporarily unavailable. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT', undefined, requestId);
  }

  try {
    const { messages, temperature, max_tokens, stream } = req.body;

    // Validate required fields
    if (!validateRequired(messages, 'messages', res, requestId)) return;

    // Validate messages format
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 400, 'Invalid messages format', 'Messages must be a non-empty array', undefined, requestId);
    }

    // Validate message structure
    const invalidMessage = messages.find((msg: any) => 
      !msg.role || !msg.content || 
      !['system', 'user', 'assistant'].includes(msg.role)
    );

    if (invalidMessage) {
      return sendError(res, 400, 'Invalid message format', 'Each message must have role and content', undefined, requestId);
    }

    logger.info('Processing Azure OpenAI chat request', { 
      messageCount: messages.length, 
      deployment,
      temperature: temperature || 'default',
      maxTokens: max_tokens || 'default'
    }, requestId);

    // Construct Azure OpenAI endpoint URL
    const azureUrl = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const requestBody = {
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
      stream: stream || false
    };

    logger.debug('Making Azure OpenAI API request', { url: azureUrl }, requestId);

    const response = await fetchWithTimeout(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    }, 60000);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Azure OpenAI API error', new Error(`${response.status}: ${errorText}`), { status: response.status }, requestId);
      
      // Handle specific Azure OpenAI error codes
      if (response.status === 401) {
        return sendError(res, 401, 'Azure OpenAI authentication failed', 'Invalid API key', undefined, requestId);
      } else if (response.status === 429) {
        return sendError(res, 429, 'Azure OpenAI rate limit exceeded', 'Please try again later', undefined, requestId);
      } else if (response.status === 404) {
        return sendError(res, 404, 'Azure OpenAI deployment not found', `Deployment '${deployment}' not found`, undefined, requestId);
      } else {
        return sendError(res, 500, 'Azure OpenAI request failed', 'Chat service temporarily unavailable', { status: response.status }, requestId);
      }
    }

    const data = await response.json();
    
    logger.info('Azure OpenAI API request completed', { 
      usage: data.usage,
      model: data.model 
    }, requestId);

    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('Azure OpenAI chat error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return sendError(res, 408, 'Request timeout', 'Azure OpenAI request took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'Chat service temporarily unavailable', undefined, requestId);
  }
}