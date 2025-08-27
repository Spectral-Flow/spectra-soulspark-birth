/*
 * Modern LLM Integration Client (Updated 2025)
 * Supports latest SDK patterns for Hugging Face, OpenAI, and OpenRouter
 * Server-side only - reads API keys from environment variables
 * Compatible with latest LTS Node.js versions
 */

import { HfInference } from '@huggingface/inference';
import OpenAI, { AzureOpenAI } from 'openai';
import axios from 'axios';

// Initialize SDKs with environment variables
const hf = process.env.HUGGINGFACE_API_KEY 
  ? new HfInference(process.env.HUGGINGFACE_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const azureOpenai = process.env.AZURE_OPENAI_API_KEY
  ? new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT
    })
  : null;

/**
 * Universal LLM query function with multiple provider support
 * @param {string} prompt - The input prompt
 * @param {string} provider - 'huggingface', 'openai', 'azure-openai', 'openrouter', or 'local'
 * @param {object} options - Configuration options
 * @returns {Promise<any>} LLM response
 */
export async function queryLLM(prompt, provider = 'huggingface', options = {}) {
  if (provider === 'huggingface') {
    if (!hf) {
      throw new Error('HUGGINGFACE_API_KEY not set');
    }

    const model = options.model || process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium';
    
    try {
      // Use latest HF SDK pattern for text generation
      const response = await hf.textGeneration({
        model,
        inputs: prompt,
        parameters: {
          max_length: options.maxTokens || 150,
          temperature: options.temperature || 0.7,
          do_sample: true,
          ...options.parameters
        }
      });
      
      return response.generated_text || response;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw new Error(`HuggingFace request failed: ${error.message}`);
    }
    
  } else if (provider === 'openai') {
    if (!openai) {
      throw new Error('OPENAI_API_KEY not set');
    }

    const model = options.model || 'gpt-4o-mini'; // Latest efficient model

    try {
      // Use latest OpenAI SDK pattern
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        ...options.parameters
      });

      return response.choices?.[0]?.message?.content ?? response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI request failed: ${error.message}`);
    }

  } else if (provider === 'azure-openai') {
    if (!azureOpenai) {
      throw new Error('Azure OpenAI not configured. Set AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT');
    }

    const deployment = options.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';

    try {
      // Use Azure OpenAI SDK pattern
      const response = await azureOpenai.chat.completions.create({
        model: deployment, // For Azure OpenAI, model should be the deployment name
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 512,
        temperature: options.temperature || 0.7,
        ...options.parameters
      });

      return response.choices?.[0]?.message?.content ?? response;
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      throw new Error(`Azure OpenAI request failed: ${error.message}`);
    }

  } else if (provider === 'openrouter') {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not set');
    }

    const model = options.model || 'microsoft/dialoGPT-medium';

    try {
      // OpenRouter API using axios with latest patterns
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 512,
          temperature: options.temperature || 0.7,
          ...options.parameters
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
            'X-Title': 'SPECTRA AI'
          },
          timeout: options.timeout || 30000
        }
      );

      return response.data.choices?.[0]?.message?.content ?? response.data;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter request failed: ${error.message}`);
    }

  } else if (provider === 'local') {
    const endpoint = options.endpoint || process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434';
    const model = options.model || process.env.LOCAL_LLM_MODEL || 'llama2';
    const apiType = options.apiType || process.env.LOCAL_LLM_API_TYPE || 'ollama'; // ollama, openai-compatible, text-generation-webui

    if (!endpoint) {
      throw new Error('LOCAL_LLM_ENDPOINT not set and no endpoint provided in options');
    }

    try {
      let response;
      
      if (apiType === 'ollama') {
        // Ollama API format
        response = await axios.post(
          `${endpoint}/api/generate`,
          {
            model,
            prompt,
            stream: false,
            options: {
              temperature: options.temperature || 0.7,
              top_p: options.topP || 0.9,
              max_tokens: options.maxTokens || 512,
              ...options.parameters
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: options.timeout || 60000 // Local LLMs can be slower
          }
        );
        
        return response.data.response || response.data;
        
      } else if (apiType === 'openai-compatible') {
        // OpenAI-compatible API format (e.g., LM Studio, text-generation-webui with OpenAI extension)
        response = await axios.post(
          `${endpoint}/v1/chat/completions`,
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 512,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            ...options.parameters
          },
          {
            headers: {
              'Content-Type': 'application/json',
              // Some local APIs may require authentication
              ...(process.env.LOCAL_LLM_API_KEY && {
                'Authorization': `Bearer ${process.env.LOCAL_LLM_API_KEY}`
              })
            },
            timeout: options.timeout || 60000
          }
        );
        
        return response.data.choices?.[0]?.message?.content ?? response.data;
        
      } else if (apiType === 'text-generation-webui') {
        // Text generation web UI API format
        response = await axios.post(
          `${endpoint}/api/v1/generate`,
          {
            text: prompt,
            max_new_tokens: options.maxTokens || 512,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            do_sample: true,
            ...options.parameters
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: options.timeout || 60000
          }
        );
        
        return response.data.results?.[0]?.text ?? response.data;
        
      } else {
        throw new Error(`Unsupported local API type: ${apiType}. Supported: 'ollama', 'openai-compatible', 'text-generation-webui'`);
      }
      
    } catch (error) {
      console.error('Local LLM API error:', error);
      
      // Provide helpful error messages for common issues
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to local LLM at ${endpoint}. Make sure your local LLM server is running and accessible.`);
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error(`Local LLM request timed out. The model might be loading or processing - try again in a moment.`);
      } else {
        throw new Error(`Local LLM request failed: ${error.message}`);
      }
    }
  }

  throw new Error(`Unsupported provider: ${provider}. Supported: 'huggingface', 'openai', 'azure-openai', 'openrouter', 'local'`);
}

/**
 * Get available service status for diagnostics
 * @returns {object} Service availability status
 */
export function getServiceStatus() {
  return {
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    azureOpenai: !!process.env.AZURE_OPENAI_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    local: !!process.env.LOCAL_LLM_ENDPOINT,
    sdks: {
      huggingface: !!hf,
      openai: !!openai,
      azureOpenai: !!azureOpenai
    },
    azureConfig: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'Not configured',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'Not configured',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'
    },
    localConfig: {
      endpoint: process.env.LOCAL_LLM_ENDPOINT || 'Not configured',
      model: process.env.LOCAL_LLM_MODEL || 'Default',
      apiType: process.env.LOCAL_LLM_API_TYPE || 'ollama'
    }
  };
}

/**
 * Test local LLM connectivity and model availability
 * @param {string} endpoint - Local LLM endpoint URL
 * @param {string} apiType - API type (ollama, openai-compatible, text-generation-webui)
 * @returns {Promise<object>} Connection test results
 */
export async function testLocalLLMConnection(endpoint, apiType = 'ollama') {
  try {
    let testUrl;
    let expectedResponse;
    
    switch (apiType) {
      case 'ollama':
        testUrl = `${endpoint}/api/tags`;
        expectedResponse = 'models';
        break;
      case 'openai-compatible':
        testUrl = `${endpoint}/v1/models`;
        expectedResponse = 'data';
        break;
      case 'text-generation-webui':
        testUrl = `${endpoint}/api/v1/model`;
        expectedResponse = 'result';
        break;
      default:
        throw new Error(`Unsupported API type: ${apiType}`);
    }
    
    const response = await axios.get(testUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.LOCAL_LLM_API_KEY && {
          'Authorization': `Bearer ${process.env.LOCAL_LLM_API_KEY}`
        })
      }
    });
    
    return {
      success: true,
      endpoint,
      apiType,
      models: response.data[expectedResponse] || response.data,
      status: 'Connected'
    };
    
  } catch (error) {
    return {
      success: false,
      endpoint,
      apiType,
      error: error.message,
      status: 'Connection failed'
    };
  }
}

/**
 * Batch process multiple prompts (for efficiency)
 * @param {Array<string>} prompts - Array of prompts
 * @param {string} provider - LLM provider
 * @param {object} options - Configuration options
 * @returns {Promise<Array>} Array of responses
 */
export async function batchQueryLLM(prompts, provider = 'huggingface', options = {}) {
  const batchSize = options.batchSize || 5;
  const results = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map(prompt => 
      queryLLM(prompt, provider, options).catch(error => ({ error: error.message }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, options.batchDelay || 1000));
    }
  }
  
  return results;
}

// Export for backwards compatibility
export default queryLLM;
