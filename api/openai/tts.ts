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
  validateText,
  sanitizeText,
  applyRateLimit,
  strictRateLimiter
} from '../utils/common';

const logger = createLogger('openai-tts');

// Valid OpenAI TTS voices
const VALID_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
const VALID_MODELS = ['tts-1', 'tts-1-hd'];

/**
 * OpenAI TTS API Proxy with enhanced validation and monitoring
 * Securely handles OpenAI TTS requests with server-side API keys
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', undefined, undefined, requestId);
  }

  // Apply rate limiting
  if (!applyRateLimit(req, res, strictRateLimiter)) {
    return;
  }

  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'OpenAI API key not configured', 'TTS service temporarily unavailable', undefined, requestId);
  }

  try {
    const { text, voice = 'nova', model = 'tts-1', response_format = 'mp3' } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['text']);
    if (!validation.valid) {
      return sendError(res, 400, 'Missing required fields', `Required: ${validation.missing.join(', ')}`, undefined, requestId);
    }

    // Validate text input
    const textValidation = validateText(text, 4096, 1); // OpenAI has 4096 character limit
    if (!textValidation.valid) {
      return sendError(res, 400, 'Invalid text input', textValidation.error, undefined, requestId);
    }

    // Validate voice
    if (!VALID_VOICES.includes(voice)) {
      return sendError(res, 400, 'Invalid voice', `Voice must be one of: ${VALID_VOICES.join(', ')}`, undefined, requestId);
    }

    // Validate model
    if (!VALID_MODELS.includes(model)) {
      return sendError(res, 400, 'Invalid model', `Model must be one of: ${VALID_MODELS.join(', ')}`, undefined, requestId);
    }

    // Validate response format
    const validFormats = ['mp3', 'opus', 'aac', 'flac'];
    if (!validFormats.includes(response_format)) {
      return sendError(res, 400, 'Invalid response format', `Format must be one of: ${validFormats.join(', ')}`, undefined, requestId);
    }

    // Sanitize text input
    const sanitizedText = sanitizeText(text);

    logger.info('OpenAI TTS request initiated', { 
      textLength: sanitizedText.length, 
      voice, 
      model,
      response_format 
    }, requestId);

    const start = Date.now();
    const response = await fetchWithTimeout('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: sanitizedText,
        voice,
        response_format,
      }),
    }, 30000); // 30 second timeout

    const responseTime = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenAI TTS API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      
      // Map specific OpenAI errors to user-friendly messages
      let userMessage = 'OpenAI TTS service error';
      if (response.status === 401) {
        userMessage = 'Invalid API key';
      } else if (response.status === 400) {
        userMessage = 'Invalid request parameters';
      } else if (response.status === 429) {
        userMessage = 'Rate limit exceeded or quota exhausted';
      } else if (response.status === 500) {
        userMessage = 'OpenAI service temporarily unavailable';
      }
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const audioBuffer = await response.arrayBuffer();
    
    logger.info('OpenAI TTS generation successful', { 
      audioSize: audioBuffer.byteLength,
      responseTime,
      voice,
      model 
    }, requestId);

    // Set appropriate headers based on format
    const mimeTypes = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac'
    };

    res.setHeader('Content-Type', mimeTypes[response_format] || 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Request-ID', requestId);
    
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    logger.error('OpenAI TTS endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error.name === 'AbortError') {
      return sendError(res, 408, 'Request timeout', 'TTS generation took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'TTS generation failed', undefined, requestId);
  }
}