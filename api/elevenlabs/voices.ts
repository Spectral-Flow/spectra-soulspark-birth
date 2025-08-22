import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from '../utils/logger';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  getApiKey,
  fetchWithTimeout,
  applyRateLimit
} from '../utils/common';

const logger = createLogger('elevenlabs-voices');

// Cache voices for 1 hour to reduce API calls
let voicesCache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * ElevenLabs Voices API Proxy with caching and enhanced error handling
 * Fetches available voices from ElevenLabs
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed', undefined, undefined, requestId);
  }

  // Apply rate limiting
  if (!applyRateLimit(req, res)) {
    return;
  }

  const apiKey = getApiKey('ELEVENLABS_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'ElevenLabs API key not configured', 'Service temporarily unavailable', undefined, requestId);
  }

  try {
    // Check cache first
    const now = Date.now();
    if (voicesCache && (now - voicesCache.timestamp < CACHE_DURATION)) {
      logger.info('Serving voices from cache', { cacheAge: now - voicesCache.timestamp }, requestId);
      return sendSuccess(res, voicesCache.data, 200, requestId);
    }

    logger.info('Fetching voices from ElevenLabs API', {}, requestId);

    const start = Date.now();
    const response = await fetchWithTimeout('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    }, 10000); // 10 second timeout

    const responseTime = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs voices API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime 
      }, requestId);
      
      // Map specific ElevenLabs errors to user-friendly messages
      let userMessage = 'ElevenLabs service error';
      if (response.status === 401) {
        userMessage = 'Invalid API key';
      } else if (response.status === 403) {
        userMessage = 'Insufficient permissions';
      } else if (response.status === 429) {
        userMessage = 'Rate limit exceeded';
      }
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.voices || !Array.isArray(data.voices)) {
      logger.error('Invalid voices API response structure', undefined, { data }, requestId);
      return sendError(res, 502, 'Invalid API response', 'Unexpected response format from ElevenLabs', undefined, requestId);
    }

    // Filter and enhance voice data
    const enhancedData = {
      ...data,
      voices: data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'general',
        labels: voice.labels || {},
        preview_url: voice.preview_url,
        available_for_tiers: voice.available_for_tiers,
        settings: voice.settings,
        // Add metadata
        optimized_for_streaming: voice.settings?.use_speaker_boost !== false
      }))
    };

    // Update cache
    voicesCache = {
      data: enhancedData,
      timestamp: now
    };

    logger.info('Voices fetched successfully', { 
      voiceCount: data.voices.length, 
      responseTime 
    }, requestId);

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Request-ID', requestId);

    return sendSuccess(res, enhancedData, 200, requestId);

  } catch (error) {
    logger.error('Voices endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error.name === 'AbortError') {
      return sendError(res, 408, 'Request timeout', 'Voices fetch took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'Failed to fetch voices', undefined, requestId);
  }
}