/**
 * API route for testing local LLM connections
 * This allows the frontend to test connectivity to local LLMs
 */

import { testLocalLLMConnection } from '../../llm_integrations/llm_client.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, apiType, model, apiKey } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    // Temporarily set the API key for this test if provided
    const originalApiKey = process.env.LOCAL_LLM_API_KEY;
    if (apiKey) {
      process.env.LOCAL_LLM_API_KEY = apiKey;
    }

    const result = await testLocalLLMConnection(endpoint, apiType || 'ollama');

    // Restore original API key
    if (originalApiKey !== undefined) {
      process.env.LOCAL_LLM_API_KEY = originalApiKey;
    } else {
      delete process.env.LOCAL_LLM_API_KEY;
    }

    // Format models for frontend consumption
    if (result.success && result.models) {
      if (apiType === 'ollama' && Array.isArray(result.models.models)) {
        result.models = result.models.models.map(m => m.name || m);
      } else if (apiType === 'openai-compatible' && Array.isArray(result.models.data)) {
        result.models = result.models.data.map(m => m.id || m);
      }
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Local LLM test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to test local LLM connection'
    });
  }
}