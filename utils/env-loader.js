/**
 * Environment Variable Loader Utility
 * Ensures proper environment variable loading for Vercel and local development
 * Updated for latest Node.js LTS compatibility
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables with fallback chain
 * Prioritizes production environment, then local .env files
 */
export function loadEnvironment() {
  // In production (Vercel), environment variables are already loaded
  if (process.env.VERCEL_ENV || process.env.NODE_ENV === 'production') {
    console.log('✅ Production environment detected, using platform environment variables');
    return;
  }

  // For local development, load .env files
  const envPath = join(__dirname, '../.env');
  const result = config({ path: envPath });
  
  if (result.error) {
    console.warn('⚠️ No .env file found, using system environment variables only');
  } else {
    console.log('✅ Environment variables loaded from .env file');
  }
}

/**
 * Validate required environment variables for LLM services
 * @param {string[]} requiredKeys - Array of required environment variable keys
 * @returns {boolean} True if all required keys are present
 */
export function validateEnvironment(requiredKeys = []) {
  const missing = requiredKeys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are present');
  return true;
}

/**
 * Get service configuration with fallbacks
 * @returns {object} Service configuration object
 */
export function getServiceConfig() {
  return {
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN,
      model: process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'microsoft/dialoGPT-medium'
    },
    local: {
      endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434',
      model: process.env.LOCAL_LLM_MODEL || 'llama2',
      apiType: process.env.LOCAL_LLM_API_TYPE || 'ollama',
      apiKey: process.env.LOCAL_LLM_API_KEY || null
    },
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY,
      agentId: process.env.VITE_ELEVENLABS_AGENT_ID
    }
  };
}

// Auto-load environment on import (for server-side)
if (typeof window === 'undefined') {
  loadEnvironment();
}