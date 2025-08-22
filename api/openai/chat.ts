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

const logger = createLogger('openai-chat');

// Valid OpenAI chat models
const VALID_MODELS = [
  'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini',
  'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'
];

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

/**
 * OpenAI Chat Completion API Proxy with enhanced validation and streaming support
 * Securely handles OpenAI chat requests with server-side API keys
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

  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'OpenAI API key not configured', 'Chat service temporarily unavailable', undefined, requestId);
  }

  try {
    const { 
      messages, 
      model = 'gpt-4o-mini', 
      temperature = 0.7,
      max_tokens = 1000,
      stream = false,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0
    } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['messages']);
    if (!validation.valid) {
      return sendError(res, 400, 'Missing required fields', `Required: ${validation.missing.join(', ')}`, undefined, requestId);
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 400, 'Invalid messages', 'Messages must be a non-empty array', undefined, requestId);
    }

    // Validate message structure
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i] as ChatMessage;
      if (!message.role || !message.content) {
        return sendError(res, 400, 'Invalid message format', `Message ${i} must have role and content`, undefined, requestId);
      }
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return sendError(res, 400, 'Invalid message role', `Message ${i} role must be system, user, or assistant`, undefined, requestId);
      }
      if (typeof message.content !== 'string' || message.content.length === 0) {
        return sendError(res, 400, 'Invalid message content', `Message ${i} content must be a non-empty string`, undefined, requestId);
      }
      // Validate content length (approximate token limit)
      if (message.content.length > 32000) {
        return sendError(res, 400, 'Message too long', `Message ${i} content exceeds maximum length`, undefined, requestId);
      }
    }

    // Validate model
    if (!VALID_MODELS.includes(model)) {
      return sendError(res, 400, 'Invalid model', `Model must be one of: ${VALID_MODELS.slice(0, 5).join(', ')}...`, undefined, requestId);
    }

    // Validate numeric parameters
    if (temperature < 0 || temperature > 2) {
      return sendError(res, 400, 'Invalid temperature', 'Temperature must be between 0 and 2', undefined, requestId);
    }
    if (max_tokens < 1 || max_tokens > 4096) {
      return sendError(res, 400, 'Invalid max_tokens', 'max_tokens must be between 1 and 4096', undefined, requestId);
    }
    if (top_p < 0 || top_p > 1) {
      return sendError(res, 400, 'Invalid top_p', 'top_p must be between 0 and 1', undefined, requestId);
    }

    const totalMessageLength = messages.reduce((sum: number, msg: ChatMessage) => sum + msg.content.length, 0);
    
    logger.info('OpenAI Chat request initiated', { 
      messageCount: messages.length, 
      totalMessageLength,
      model,
      temperature,
      max_tokens,
      stream 
    }, requestId);

    const start = Date.now();
    
    // Prepare request body
    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      stream
    };

    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, 60000); // 60 second timeout for chat

    const responseTime = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenAI Chat API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime,
        model 
      }, requestId);
      
      // Map specific OpenAI errors to user-friendly messages
      let userMessage = 'OpenAI Chat service error';
      if (response.status === 401) {
        userMessage = 'Invalid API key';
      } else if (response.status === 400) {
        userMessage = 'Invalid request parameters or content policy violation';
      } else if (response.status === 429) {
        userMessage = 'Rate limit exceeded or quota exhausted';
      } else if (response.status === 500) {
        userMessage = 'OpenAI service temporarily unavailable';
      } else if (response.status === 503) {
        userMessage = 'OpenAI service overloaded, please try again';
      }
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    // Handle streaming responses
    if (stream) {
      logger.info('OpenAI Chat streaming response initiated', { responseTime }, requestId);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Request-ID', requestId);
      
      // Pipe the streaming response
      response.body?.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          logger.info('OpenAI Chat streaming completed', { responseTime }, requestId);
          res.end();
        }
      }));
      
      return;
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.choices || !Array.isArray(data.choices)) {
      logger.error('Invalid chat API response structure', undefined, { data }, requestId);
      return sendError(res, 502, 'Invalid API response', 'Unexpected response format from OpenAI', undefined, requestId);
    }

    // Log usage information
    if (data.usage) {
      logger.info('OpenAI Chat completion successful', { 
        responseTime,
        model,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }, requestId);
    } else {
      logger.info('OpenAI Chat completion successful', { responseTime, model }, requestId);
    }

    // Set response headers
    res.setHeader('X-Request-ID', requestId);

    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('OpenAI Chat endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error.name === 'AbortError') {
      return sendError(res, 408, 'Request timeout', 'Chat completion took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'Chat completion failed', undefined, requestId);
  }
}