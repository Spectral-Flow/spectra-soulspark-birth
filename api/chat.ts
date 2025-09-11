import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from './utils/logger';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  getApiKey,
  fetchWithTimeout,
  validateRequired,
  applyRateLimit
} from './utils/common';

const logger = createLogger('unified-chat');

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

interface ChatRequest {
  provider: 'openai' | 'azure-openai' | 'openrouter' | 'huggingface';
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  // Azure-specific
  endpoint?: string;
  deployment?: string;
}

/**
 * Unified Chat Completion API Proxy
 * Routes to different AI providers based on the provider parameter
 * Supports: OpenAI, Azure OpenAI, OpenRouter, and Hugging Face
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'Only POST method is supported', undefined, requestId);
  }

  try {
    // Apply rate limiting
    if (!applyRateLimit(req, res)) {
      return;
    }

    const { 
      provider,
      messages, 
      model,
      temperature = 0.7,
      max_tokens = 1000,
      stream = false,
      endpoint,
      deployment
    }: ChatRequest = req.body;

    // Validate required fields
    const validation = validateRequired({ provider, messages }, ['provider', 'messages']);
    if (!validation.valid) {
      return sendError(res, 400, 'Missing required fields', validation.missing?.join(', '), undefined, requestId);
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 400, 'Invalid messages', 'Messages must be a non-empty array', undefined, requestId);
    }

    logger.info(`Chat request initiated`, { provider, model, messageCount: messages.length, stream }, requestId);

    // Route to appropriate provider
    switch (provider) {
      case 'openai':
        return await handleOpenAI(req, res, { messages, model, temperature, max_tokens, stream }, requestId);
      case 'azure-openai':
        return await handleAzureOpenAI(req, res, { messages, model, temperature, max_tokens, stream, endpoint, deployment }, requestId);
      case 'openrouter':
        return await handleOpenRouter(req, res, { messages, model, temperature, max_tokens, stream }, requestId);
      case 'huggingface':
        return await handleHuggingFace(req, res, { messages, model, temperature, max_tokens, stream }, requestId);
      default:
        return sendError(res, 400, 'Invalid provider', `Unsupported provider: ${provider}`, undefined, requestId);
    }

  } catch (error) {
    logger.error('Unified chat API error', error, undefined, requestId);
    return sendError(res, 500, 'Internal server error', 'An unexpected error occurred', error, requestId);
  }
}

// OpenAI handler
async function handleOpenAI(req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'OpenAI API key not configured', 'Server configuration error', undefined, requestId);
  }

  const { messages, model = 'gpt-4o-mini', temperature, max_tokens, stream } = params;

  const validModels = ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
  if (!validModels.includes(model)) {
    return sendError(res, 400, 'Invalid model', `Model must be one of: ${validModels.join(', ')}`, undefined, requestId);
  }

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream
      })
    }, 30000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenAI API error', undefined, { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText,
        responseTime
      }, requestId);
      
      let userMessage = 'OpenAI Chat service error';
      if (response.status === 401) userMessage = 'Invalid API key';
      else if (response.status === 400) userMessage = 'Invalid request parameters or content policy violation';
      else if (response.status === 429) userMessage = 'Rate limit exceeded or quota exhausted';
      else if (response.status === 500) userMessage = 'OpenAI service temporarily unavailable';
      else if (response.status === 503) userMessage = 'OpenAI service overloaded, please try again';
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    if (stream) {
      logger.info('OpenAI streaming response initiated', { responseTime }, requestId);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Request-ID', requestId);
      
      response.body?.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          logger.info('OpenAI streaming completed', { responseTime }, requestId);
          res.end();
        }
      }));
      return;
    }

    const data = await response.json();
    logger.info('OpenAI chat completion successful', { responseTime, model }, requestId);
    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('OpenAI chat error', error, undefined, requestId);
    return sendError(res, 500, 'OpenAI service error', 'Failed to get chat completion', error, requestId);
  }
}

// Azure OpenAI handler
async function handleAzureOpenAI(req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('AZURE_OPENAI_API_KEY');
  const endpoint = params.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = params.deployment || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

  if (!apiKey || !endpoint) {
    return sendError(res, 500, 'Azure OpenAI not configured', 'Missing API key or endpoint', undefined, requestId);
  }

  const { messages, temperature, max_tokens, stream } = params;

  try {
    const startTime = Date.now();
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-12-01-preview`;
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens,
        stream
      })
    }, 30000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Azure OpenAI API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      return sendError(res, response.status, 'Azure OpenAI service error', errorText, undefined, requestId);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Request-ID', requestId);
      
      response.body?.pipeTo(new WritableStream({
        write(chunk) { res.write(chunk); },
        close() { res.end(); }
      }));
      return;
    }

    const data = await response.json();
    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('Azure OpenAI chat error', error, undefined, requestId);
    return sendError(res, 500, 'Azure OpenAI service error', 'Failed to get chat completion', error, requestId);
  }
}

// OpenRouter handler
async function handleOpenRouter(req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('OPENROUTER_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'OpenRouter API key not configured', 'Server configuration error', undefined, requestId);
  }

  const { messages, model = '@preset/spectra', temperature, max_tokens, stream } = params;

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://spectra-soulspark.vercel.app',
        'X-Title': 'SPECTRA AI'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream
      })
    }, 30000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenRouter API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      return sendError(res, response.status, 'OpenRouter service error', errorText, undefined, requestId);
    }

    const data = await response.json();
    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('OpenRouter chat error', error, undefined, requestId);
    return sendError(res, 500, 'OpenRouter service error', 'Failed to get chat completion', error, requestId);
  }
}

// Hugging Face handler
async function handleHuggingFace(req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('HUGGINGFACE_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'Hugging Face API key not configured', 'Server configuration error', undefined, requestId);
  }

  const { messages, model = 'meta-llama/Llama-2-7b-chat-hf', temperature, max_tokens } = params;

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: messages.map(m => m.content).join('\n'),
        parameters: {
          temperature,
          max_new_tokens: max_tokens
        }
      })
    }, 30000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Hugging Face API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      return sendError(res, response.status, 'Hugging Face service error', errorText, undefined, requestId);
    }

    const data = await response.json();
    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('Hugging Face chat error', error, undefined, requestId);
    return sendError(res, 500, 'Hugging Face service error', 'Failed to get chat completion', error, requestId);
  }
}