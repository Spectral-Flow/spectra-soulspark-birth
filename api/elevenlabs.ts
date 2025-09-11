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
  validateText,
  sanitizeText,
  applyRateLimit,
  strictRateLimiter
} from './utils/common';

const logger = createLogger('unified-elevenlabs');

// Cache voices for 1 hour to reduce API calls
let voicesCache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Unified ElevenLabs API Proxy
 * Handles TTS, Voices, and Signed URL operations
 * Routes to different ElevenLabs services based on the operation parameter
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  try {
    let operation: string;
    let requestData: any;

    if (req.method === 'GET') {
      // GET requests use query parameters
      const { operation: op, ...queryParams } = req.query;
      operation = op as string;
      requestData = { operation, ...queryParams };
    } else if (req.method === 'POST') {
      // POST requests have operation in body
      requestData = req.body;
      operation = requestData.operation;
    } else {
      return sendError(res, 405, 'Method not allowed', 'Only GET and POST methods are supported', undefined, requestId);
    }

    if (!operation) {
      return sendError(res, 400, 'Missing operation', 'Operation parameter is required (tts, voices, signed-url)', undefined, requestId);
    }

    const apiKey = getApiKey('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return sendError(res, 500, 'ElevenLabs API key not configured', 'Service temporarily unavailable', undefined, requestId);
    }

    logger.info(`ElevenLabs ${operation} request initiated`, { method: req.method }, requestId);

    // Route to appropriate operation
    switch (operation) {
      case 'tts':
        if (req.method !== 'POST') {
          return sendError(res, 405, 'Method not allowed', 'TTS operation requires POST method', undefined, requestId);
        }
        return await handleTTS(requestData, res, apiKey, requestId);
      
      case 'voices':
        if (req.method !== 'GET') {
          return sendError(res, 405, 'Method not allowed', 'Voices operation requires GET method', undefined, requestId);
        }
        return await handleVoices(res, apiKey, requestId);
      
      case 'signed-url':
        if (req.method !== 'POST') {
          return sendError(res, 405, 'Method not allowed', 'Signed URL operation requires POST method', undefined, requestId);
        }
        return await handleSignedUrl(requestData, res, apiKey, requestId);
      
      default:
        return sendError(res, 400, 'Invalid operation', `Unsupported operation: ${operation}`, undefined, requestId);
    }

  } catch (error) {
    logger.error('Unified ElevenLabs API error', error, undefined, requestId);
    return sendError(res, 500, 'Internal server error', 'An unexpected error occurred', error, requestId);
  }
}

// Handle TTS operation
async function handleTTS(data: any, res: VercelResponse, apiKey: string, requestId: string) {
  // Apply rate limiting for TTS
  // Note: We pass mock req object since we don't have access to the original req here
  // In a real implementation, you might want to pass req through or restructure this
  const mockReq = { headers: {} } as VercelRequest;
  if (!applyRateLimit(mockReq, res, strictRateLimiter)) {
    return;
  }

  const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', options = {} } = data;

  // Validate required fields
  const validation = validateRequired({ text }, ['text']);
  if (!validation.valid) {
    return sendError(res, 400, 'Missing required fields', validation.missing?.join(', '), undefined, requestId);
  }

  // Validate and sanitize text
  const textValidation = validateText(text);
  if (!textValidation.valid) {
    return sendError(res, 400, 'Invalid text input', textValidation.error, undefined, requestId);
  }

  const sanitizedText = sanitizeText(text);
  if (!sanitizedText) {
    return sendError(res, 400, 'Empty text after sanitization', 'Text contains only invalid characters', undefined, requestId);
  }

  // Default ElevenLabs options
  const defaultOptions = {
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    model_id: 'eleven_multilingual_v2'
  };

  const requestBody = {
    text: sanitizedText,
    ...defaultOptions,
    ...options
  };

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    }, 60000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs TTS API error', undefined, { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText,
        responseTime,
        voiceId 
      }, requestId);
      
      let userMessage = 'ElevenLabs TTS service error';
      if (response.status === 400) userMessage = 'Invalid request parameters or voice ID';
      else if (response.status === 401) userMessage = 'Invalid API key';
      else if (response.status === 422) userMessage = 'Text validation failed';
      else if (response.status === 429) userMessage = 'Rate limit exceeded';
      else if (response.status === 500) userMessage = 'ElevenLabs service temporarily unavailable';
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();

    logger.info('ElevenLabs TTS conversion successful', { 
      responseTime, 
      audioSize: audioBuffer.byteLength,
      voiceId 
    }, requestId);

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    logger.error('ElevenLabs TTS error', error, undefined, requestId);
    return sendError(res, 500, 'ElevenLabs TTS service error', 'Failed to convert text to speech', error, requestId);
  }
}

// Handle Voices operation
async function handleVoices(res: VercelResponse, apiKey: string, requestId: string) {
  // Apply standard rate limiting for voices
  const mockReq = { headers: {} } as VercelRequest;
  if (!applyRateLimit(mockReq, res)) {
    return;
  }

  try {
    // Check cache first
    const now = Date.now();
    if (voicesCache && (now - voicesCache.timestamp < CACHE_DURATION)) {
      logger.info('Serving voices from cache', { cacheAge: now - voicesCache.timestamp }, requestId);
      return sendSuccess(res, voicesCache.data, 200, requestId);
    }

    const startTime = Date.now();
    const response = await fetchWithTimeout('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    }, 15000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs Voices API error', undefined, { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText,
        responseTime 
      }, requestId);
      
      let userMessage = 'ElevenLabs Voices service error';
      if (response.status === 401) userMessage = 'Invalid API key';
      else if (response.status === 429) userMessage = 'Rate limit exceeded';
      else if (response.status === 500) userMessage = 'ElevenLabs service temporarily unavailable';
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const data = await response.json();
    
    // Update cache
    voicesCache = {
      data,
      timestamp: now
    };

    logger.info('ElevenLabs voices fetched successfully', { 
      responseTime, 
      voiceCount: data.voices?.length || 0 
    }, requestId);

    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('ElevenLabs voices error', error, undefined, requestId);
    return sendError(res, 500, 'ElevenLabs Voices service error', 'Failed to fetch voices', error, requestId);
  }
}

// Handle Signed URL operation
async function handleSignedUrl(data: any, res: VercelResponse, apiKey: string, requestId: string) {
  // Apply strict rate limiting for signed URL
  const mockReq = { headers: {} } as VercelRequest;
  if (!applyRateLimit(mockReq, res, strictRateLimiter)) {
    return;
  }

  const { agentId, userId, metadata } = data;

  // Validate required fields
  const validation = validateRequired({ agentId }, ['agentId']);
  if (!validation.valid) {
    return sendError(res, 400, 'Missing required fields', validation.missing?.join(', '), undefined, requestId);
  }

  // Validate agent ID format (basic validation)
  if (typeof agentId !== 'string' || agentId.length < 3) {
    return sendError(res, 400, 'Invalid agent ID', 'Agent ID must be a valid string', undefined, requestId);
  }

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(`https://api.elevenlabs.io/v1/convai/conversations/signed_url`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_id: userId,
        metadata: metadata || {}
      })
    }, 15000);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs Signed URL API error', undefined, { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText,
        responseTime,
        agentId 
      }, requestId);
      
      let userMessage = 'ElevenLabs Conversational AI service error';
      if (response.status === 400) userMessage = 'Invalid agent ID or request parameters';
      else if (response.status === 401) userMessage = 'Invalid API key';
      else if (response.status === 404) userMessage = 'Agent not found';
      else if (response.status === 429) userMessage = 'Rate limit exceeded';
      else if (response.status === 500) userMessage = 'ElevenLabs service temporarily unavailable';
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const data = await response.json();

    logger.info('ElevenLabs signed URL generated successfully', { 
      responseTime, 
      agentId,
      hasUrl: !!data.signed_url 
    }, requestId);

    return sendSuccess(res, data, 200, requestId);

  } catch (error) {
    logger.error('ElevenLabs signed URL error', error, undefined, requestId);
    return sendError(res, 500, 'ElevenLabs Conversational AI service error', 'Failed to generate signed URL', error, requestId);
  }
}