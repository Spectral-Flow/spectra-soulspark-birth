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

const logger = createLogger('elevenlabs-tts');

/**
 * ElevenLabs TTS API Proxy with enhanced security and monitoring
 * Securely handles ElevenLabs TTS requests with server-side API keys
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

  const apiKey = getApiKey('ELEVENLABS_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'ElevenLabs API key not configured', 'Service temporarily unavailable', undefined, requestId);
  }

  try {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', options = {} } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['text']);
    if (!validation.valid) {
      return sendError(res, 400, 'Missing required fields', `Required: ${validation.missing.join(', ')}`, undefined, requestId);
    }

    // Validate text input
    const textValidation = validateText(text, 5000, 1);
    if (!textValidation.valid) {
      return sendError(res, 400, 'Invalid text input', textValidation.error, undefined, requestId);
    }

    // Sanitize text input
    const sanitizedText = sanitizeText(text);

    // Validate voice ID format
    if (typeof voiceId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(voiceId)) {
      return sendError(res, 400, 'Invalid voice ID format', 'Voice ID must contain only alphanumeric characters, hyphens, and underscores', undefined, requestId);
    }

    logger.info('TTS request initiated', { 
      textLength: sanitizedText.length, 
      voiceId, 
      model: options.model || 'eleven_multilingual_v2' 
    }, requestId);

    const ttsRequest = {
      text: sanitizedText,
      model_id: options.model || 'eleven_multilingual_v2',
      voice_settings: {
        stability: Math.max(0, Math.min(1, options.stability || 0.5)),
        similarity_boost: Math.max(0, Math.min(1, options.similarityBoost || 0.8)),
        style: Math.max(0, Math.min(1, options.style || 0.2)),
        use_speaker_boost: Boolean(options.useSpeakerBoost || true),
      },
    };

    const start = Date.now();
    const response = await fetchWithTimeout(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(ttsRequest),
      },
      30000 // 30 second timeout for TTS
    );

    const responseTime = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      
      // Map specific ElevenLabs errors to user-friendly messages
      let userMessage = 'ElevenLabs service error';
      if (response.status === 401) {
        userMessage = 'Invalid API key';
      } else if (response.status === 403) {
        userMessage = 'Insufficient permissions or quota exceeded';
      } else if (response.status === 404) {
        userMessage = 'Voice not found';
      } else if (response.status === 422) {
        userMessage = 'Invalid request parameters';
      }
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const audioBuffer = await response.arrayBuffer();
    
    logger.info('TTS generation successful', { 
      audioSize: audioBuffer.byteLength,
      responseTime,
      voiceId
    }, requestId);

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Request-ID', requestId);
    
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    logger.error('TTS endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error.name === 'AbortError') {
      return sendError(res, 408, 'Request timeout', 'TTS generation took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'TTS generation failed', undefined, requestId);
  }
}