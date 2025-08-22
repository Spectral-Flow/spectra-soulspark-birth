/**
 * Common utilities for API endpoints
 * Provides CORS handling, error responses, and input validation
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from './logger';

const logger = createLogger('api-utils');

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set comprehensive CORS headers
 */
export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours preflight cache
}

/**
 * Handle CORS preflight requests
 */
export function handlePreflight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Standard error response format
 */
export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Send standardized error response
 */
export function sendError(
  res: VercelResponse, 
  status: number, 
  error: string, 
  message?: string, 
  details?: unknown,
  requestId?: string
): void {
  setCorsHeaders(res);
  
  const errorResponse: ApiError = {
    error,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId
  };

  logger.error(`API Error: ${error}`, undefined, { status, details }, requestId);
  
  res.status(status).json(errorResponse);
}

/**
 * Send standardized success response
 */
export function sendSuccess(
  res: VercelResponse, 
  data: unknown, 
  status: number = 200,
  requestId?: string
): void {
  setCorsHeaders(res);
  
  logger.info('API Success', { status }, requestId);
  
  res.status(status).json(data);
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, unknown>, 
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(field => !body[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validate text input (length, content)
 */
export function validateText(
  text: unknown, 
  maxLength: number = 10000,
  minLength: number = 1
): { valid: boolean; error?: string } {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Text must be a string' };
  }
  
  if (text.length < minLength) {
    return { valid: false, error: `Text must be at least ${minLength} characters` };
  }
  
  if (text.length > maxLength) {
    return { valid: false, error: `Text must be no more than ${maxLength} characters` };
  }
  
  return { valid: true };
}

/**
 * Sanitize text input (basic XSS protection)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Global rate limiter instances
export const defaultRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const strictRateLimiter = new RateLimiter(60000, 10);   // 10 requests per minute

/**
 * Apply rate limiting to an endpoint
 */
export function applyRateLimit(
  req: VercelRequest, 
  res: VercelResponse, 
  rateLimiter: RateLimiter = defaultRateLimiter
): boolean {
  const identifier = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    'unknown';
  
  if (!rateLimiter.isAllowed(identifier)) {
    sendError(res, 429, 'Rate limit exceeded', 'Too many requests, please try again later');
    return false;
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(identifier));
  return true;
}

/**
 * Extract API key from environment with validation
 */
export function getApiKey(keyName: string, required: boolean = true): string | null {
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
}

/**
 * Timeout wrapper for fetch requests
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}