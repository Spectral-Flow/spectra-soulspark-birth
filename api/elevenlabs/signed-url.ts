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
  applyRateLimit,
  strictRateLimiter
} from '../utils/common';

const logger = createLogger('elevenlabs-signed-url');

/**
 * ElevenLabs Conversational AI Signed URL API with enhanced validation
 * Generates signed URLs for private agent conversations with proper error handling
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', undefined, undefined, requestId);
  }

  // Apply strict rate limiting for this sensitive endpoint
  if (!applyRateLimit(req, res, strictRateLimiter)) {
    return;
  }

  const apiKey = getApiKey('ELEVENLABS_API_KEY');
  if (!apiKey) {
    return sendError(res, 500, 'ElevenLabs API key not configured', 'Conversational AI service temporarily unavailable', undefined, requestId);
  }

  try {
    const { agentId, userId, metadata } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['agentId']);
    if (!validation.valid) {
      return sendError(res, 400, 'Missing required fields', `Required: ${validation.missing.join(', ')}`, undefined, requestId);
    }

    // Validate agent ID format
    if (typeof agentId !== 'string' || !/^agent_[a-zA-Z0-9_-]+$/.test(agentId)) {
      return sendError(res, 400, 'Invalid agent ID format', 'Agent ID must start with "agent_" followed by alphanumeric characters', undefined, requestId);
    }

    logger.info('Generating signed URL for conversational AI', { 
      agentId, 
      hasUserId: !!userId,
      hasMetadata: !!metadata 
    }, requestId);

    const start = Date.now();
    
    // Build query parameters
    const queryParams = new URLSearchParams({ agent_id: agentId });
    if (userId) {
      queryParams.append('user_id', userId);
    }

    const response = await fetchWithTimeout(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
      15000 // 15 second timeout
    );

    const responseTime = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs signed URL API error', undefined, { 
        status: response.status, 
        error: errorText,
        responseTime,
        agentId 
      }, requestId);
      
      // Map specific ElevenLabs errors to user-friendly messages
      let userMessage = 'Conversational AI service error';
      if (response.status === 401) {
        userMessage = 'Invalid API key';
      } else if (response.status === 403) {
        userMessage = 'Insufficient permissions or agent not accessible';
      } else if (response.status === 404) {
        userMessage = 'Agent not found';
      } else if (response.status === 422) {
        userMessage = 'Invalid agent configuration';
      } else if (response.status === 429) {
        userMessage = 'Rate limit exceeded';
      }
      
      return sendError(res, response.status, userMessage, errorText, undefined, requestId);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.signed_url) {
      logger.error('Invalid signed URL API response structure', undefined, { data }, requestId);
      return sendError(res, 502, 'Invalid API response', 'Unexpected response format from ElevenLabs', undefined, requestId);
    }

    // Enhance response with metadata
    const enhancedData = {
      ...data,
      metadata: {
        agentId,
        userId,
        requestId,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        responseTime,
        ...(metadata && { userMetadata: metadata })
      }
    };

    logger.info('Signed URL generated successfully', { 
      agentId,
      responseTime,
      hasSignedUrl: !!data.signed_url 
    }, requestId);

    // Set appropriate headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Request-ID', requestId);

    return sendSuccess(res, enhancedData, 200, requestId);

  } catch (error) {
    logger.error('Signed URL endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    
    if (error.name === 'AbortError') {
      return sendError(res, 408, 'Request timeout', 'Signed URL generation took too long', undefined, requestId);
    }
    
    return sendError(res, 500, 'Internal server error', 'Failed to generate signed URL', undefined, requestId);
  }
}