// Import utilities with absolute path for better compatibility
const logger = {
    info: (msg, ctx, reqId) => console.log(JSON.stringify({ level: 'info', service: 'health', message: msg, context: ctx, requestId: reqId, timestamp: new Date().toISOString() })),
    error: (msg, err, ctx, reqId) => console.log(JSON.stringify({ level: 'error', service: 'health', message: msg, error: err?.message, context: ctx, requestId: reqId, timestamp: new Date().toISOString() })),
    warn: (msg, ctx, reqId) => console.log(JSON.stringify({ level: 'warn', service: 'health', message: msg, context: ctx, requestId: reqId, timestamp: new Date().toISOString() }))
};
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    res.setHeader('Access-Control-Max-Age', '86400');
};
const handlePreflight = (req, res) => {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.status(200).end();
        return true;
    }
    return false;
};
const sendError = (res, status, error, message, details, requestId) => {
    setCorsHeaders(res);
    const errorResponse = {
        error,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId
    };
    logger.error(`API Error: ${error}`, undefined, { status, details }, requestId);
    res.status(status).json(errorResponse);
};
const sendSuccess = (res, data, status = 200, requestId) => {
    setCorsHeaders(res);
    logger.info('API Success', { status }, requestId);
    res.status(status).json(data);
};
const getApiKey = (keyName, required = true) => {
    const key = process.env[keyName];
    if (!key && required) {
        logger.error(`Missing required API key: ${keyName}`);
        return null;
    }
    if (key && key.startsWith('mock_') && process.env.NODE_ENV === 'production') {
        logger.warn(`Mock API key detected in production: ${keyName}`);
        return null;
    }
    return key || null;
};
const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    }
    catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};
/**
 * Enhanced health check endpoint with service monitoring
 */
export default async function handler(req, res) {
    const requestId = generateRequestId();
    // Handle CORS preflight
    if (handlePreflight(req, res))
        return;
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
            healthCheckPromises.push((async () => {
                try {
                    const start = Date.now();
                    const response = await fetchWithTimeout('https://api.elevenlabs.io/v1/voices', {
                        headers: { 'xi-api-key': getApiKey('ELEVENLABS_API_KEY') }
                    }, 5000);
                    serviceStatus.elevenlabs.responseTime = Date.now() - start;
                    serviceStatus.elevenlabs.healthy = response.ok;
                }
                catch (error) {
                    logger.warn('ElevenLabs health check failed', { error: error.message }, requestId);
                }
            })());
        }
        // OpenAI health check
        if (serviceStatus.openai.configured) {
            healthCheckPromises.push((async () => {
                try {
                    const start = Date.now();
                    const response = await fetchWithTimeout('https://api.openai.com/v1/models', {
                        headers: { 'Authorization': `Bearer ${getApiKey('OPENAI_API_KEY')}` }
                    }, 5000);
                    serviceStatus.openai.responseTime = Date.now() - start;
                    serviceStatus.openai.healthy = response.ok;
                }
                catch (error) {
                    logger.warn('OpenAI health check failed', { error: error.message }, requestId);
                }
            })());
        }
        // Hugging Face health check
        if (serviceStatus.huggingface.configured) {
            healthCheckPromises.push((async () => {
                try {
                    const start = Date.now();
                    const hfToken = getApiKey('HF_TOKEN', false) || getApiKey('HUGGINGFACE_API_KEY', false);
                    const response = await fetchWithTimeout('https://huggingface.co/api/whoami-v2', {
                        headers: { 'Authorization': `Bearer ${hfToken}` }
                    }, 5000);
                    serviceStatus.huggingface.responseTime = Date.now() - start;
                    serviceStatus.huggingface.healthy = response.ok;
                }
                catch (error) {
                    logger.warn('Hugging Face health check failed', { error: error.message }, requestId);
                }
            })());
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
    }
    catch (error) {
        logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)), {}, requestId);
        return sendError(res, 500, 'Health check failed', 'Internal server error', undefined, requestId);
    }
}
