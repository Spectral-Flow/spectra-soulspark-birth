import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from './utils/logger.js';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  getApiKey,
  fetchWithTimeout
} from './utils/common.js';

const logger = createLogger('health');

/**
 * Enhanced health check endpoint with service monitoring
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed', undefined, undefined, requestId);
  }

  logger.info('Health check requested', { method: req.method }, requestId);

  try {
    // Check API key availability
    const serviceStatus = {
      elevenlabs: {
        configured: !!getApiKey('ELEVENLABS_API_KEY', false),
        healthy: false,
        responseTime: 0
      },
      openai: {
        configured: !!getApiKey('OPENAI_API_KEY', false),
        healthy: false,
        responseTime: 0
      },
      huggingface: {
        configured: !!getApiKey('HUGGINGFACE_API_KEY', false) || !!getApiKey('HF_TOKEN', false),
        healthy: false,
        responseTime: 0
      },
      database: {
        configured: !!process.env.DATABASE_URL,
        healthy: false,
        responseTime: 0
      }
    };

    // Test external service connectivity (only if configured)
    const healthCheckPromises = [];

    // ElevenLabs health check
    if (serviceStatus.elevenlabs.configured) {
      healthCheckPromises.push(
        (async () => {
          try {
            const start = Date.now();
            const response = await fetchWithTimeout(
              'https://api.elevenlabs.io/v1/voices',
              {
                headers: { 'xi-api-key': getApiKey('ELEVENLABS_API_KEY')! }
              },
              5000
            );
            serviceStatus.elevenlabs.responseTime = Date.now() - start;
            serviceStatus.elevenlabs.healthy = response.ok;
          } catch (error) {
            logger.warn('ElevenLabs health check failed', { error: error.message }, requestId);
          }
        })()
      );
    }

    // OpenAI health check
    if (serviceStatus.openai.configured) {
      healthCheckPromises.push(
        (async () => {
          try {
            const start = Date.now();
            const response = await fetchWithTimeout(
              'https://api.openai.com/v1/models',
              {
                headers: { 'Authorization': `Bearer ${getApiKey('OPENAI_API_KEY')}` }
              },
              5000
            );
            serviceStatus.openai.responseTime = Date.now() - start;
            serviceStatus.openai.healthy = response.ok;
          } catch (error) {
            logger.warn('OpenAI health check failed', { error: error.message }, requestId);
          }
        })()
      );
    }

    // Hugging Face health check
    if (serviceStatus.huggingface.configured) {
      healthCheckPromises.push(
        (async () => {
          try {
            const start = Date.now();
            const hfToken = getApiKey('HF_TOKEN', false) || getApiKey('HUGGINGFACE_API_KEY', false);
            const response = await fetchWithTimeout(
              'https://huggingface.co/api/whoami-v2',
              {
                headers: { 'Authorization': `Bearer ${hfToken}` }
              },
              5000
            );
            serviceStatus.huggingface.responseTime = Date.now() - start;
            serviceStatus.huggingface.healthy = response.ok;
          } catch (error) {
            logger.warn('Hugging Face health check failed', { error: error.message }, requestId);
          }
        })()
      );
    }

    // Wait for all health checks (with timeout)
    await Promise.allSettled(healthCheckPromises);

    // Determine overall health
    const configuredServices = Object.values(serviceStatus).filter(service => service.configured);
    const healthyServices = configuredServices.filter(service => service.healthy);
    const overallHealth = configuredServices.length === 0 ? 'degraded' : 
                         healthyServices.length === configuredServices.length ? 'healthy' : 
                         healthyServices.length > 0 ? 'degraded' : 'unhealthy';

    const health = {
      status: overallHealth,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      requestId,
      services: serviceStatus,
      summary: {
        total: Object.keys(serviceStatus).length,
        configured: configuredServices.length,
        healthy: healthyServices.length,
        uptime: process.uptime()
      }
    };

    logger.info('Health check completed', { 
      status: overallHealth, 
      configuredServices: configuredServices.length,
      healthyServices: healthyServices.length 
    }, requestId);

    return sendSuccess(res, health, 200, requestId);

  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    return sendError(res, 500, 'Health check failed', 'Internal server error', undefined, requestId);
  }
}