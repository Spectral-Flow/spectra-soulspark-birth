import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from './utils/logger';
import { 
  handlePreflight, 
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

const logger = createLogger('unified-tts');

interface TTSRequest {
  provider: 'openai' | 'elevenlabs';
  text: string;
  // OpenAI specific
  voice?: string;
  model?: string;
  response_format?: string;
  // ElevenLabs specific
  voiceId?: string;
  options?: any;
}

/**
 * Unified Text-to-Speech API Proxy
 * Routes to different TTS providers based on the provider parameter
 * Supports: OpenAI TTS, ElevenLabs TTS
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'Only POST method is supported', undefined, requestId);
  }

  // Apply rate limiting
  if (!applyRateLimit(req, res, strictRateLimiter)) {
    return;
  }

  try {
    const { 
      provider,
      text,
      voice,
      model,
      response_format,
      voiceId,
      options
    }: TTSRequest = req.body;

    // Validate required fields
    const validation = validateRequired({ provider, text }, ['provider', 'text']);
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

    logger.info(`TTS request initiated`, { provider, textLength: sanitizedText.length }, requestId);

    // Route to appropriate provider
    switch (provider) {
      case 'openai':
        return await handleOpenAITTS(req, res, { text: sanitizedText, voice, model, response_format }, requestId);
      case 'elevenlabs':
        return await handleElevenLabsTTS(req, res, { text: sanitizedText, voiceId, options }, requestId);
      default:
        return sendError(res, 400, 'Invalid provider', `Unsupported provider: ${provider}`, undefined, requestId);
    }

  } catch (error) {
    logger.error('Unified TTS API error', error, undefined, requestId);
    return sendError(res, 500, 'Internal server error', 'An unexpected error occurred', error, requestId);
  }
}

// OpenAI TTS handler
async function handleOpenAITTS(_req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'OpenAI API key not configured', 'TTS service temporarily unavailable', undefined, requestId);
  }

  const { text, voice = 'nova', model = 'tts-1', response_format = 'mp3' } = params;

  // Validate OpenAI-specific parameters
  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const validModels = ['tts-1', 'tts-1-hd'];
  const validFormats = { mp3: 'audio/mpeg', opus: 'audio/opus', aac: 'audio/aac', flac: 'audio/flac' };

  if (!validVoices.includes(voice)) {
    return sendError(res, 400, 'Invalid voice', `Voice must be one of: ${validVoices.join(', ')}`, undefined, requestId);
  }

  if (!validModels.includes(model)) {
    return sendError(res, 400, 'Invalid model', `Model must be one of: ${validModels.join(', ')}`, undefined, requestId);
  }

  if (!Object.keys(validFormats).includes(response_format)) {
    return sendError(res, 400, 'Invalid format', `Format must be one of: ${Object.keys(validFormats).join(', ')}`, undefined, requestId);
  }

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format
      })
    }, 60000); // TTS can take longer

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('OpenAI TTS API error', undefined, { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText,
        responseTime,
        model,
        voice 
      }, requestId);
      
      let userMessage = 'OpenAI TTS service error';
      if (response.status === 400) userMessage = 'Invalid request parameters';
      else if (response.status === 401) userMessage = 'Invalid API key';
      else if (response.status === 413) userMessage = 'Text too long for TTS conversion';
      else if (response.status === 429) userMessage = 'Rate limit exceeded';
      else if (response.status === 500) userMessage = 'OpenAI service temporarily unavailable';
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const contentType = (validFormats as any)[response_format] || 'audio/mpeg';

    logger.info('OpenAI TTS conversion successful', { 
      responseTime, 
      audioSize: audioBuffer.byteLength,
      model,
      voice,
      format: response_format 
    }, requestId);

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    logger.error('OpenAI TTS error', error, undefined, requestId);
    return sendError(res, 500, 'OpenAI TTS service error', 'Failed to convert text to speech', error, requestId);
  }
}

// ElevenLabs TTS handler
async function handleElevenLabsTTS(_req: VercelRequest, res: VercelResponse, params: any, requestId: string) {
  const apiKey = getApiKey('ELEVENLABS_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'ElevenLabs API key not configured', 'Service temporarily unavailable', undefined, requestId);
  }

  const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', options = {} } = params;

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
    text,
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