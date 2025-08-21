/*
 * Modern LLM Integration Client (Updated 2025)
 * Supports latest SDK patterns for Hugging Face, OpenAI, and OpenRouter
 * Server-side only - reads API keys from environment variables
 * Compatible with latest LTS Node.js versions
 */

import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize SDKs with environment variables
const hf = process.env.HUGGINGFACE_API_KEY 
  ? new HfInference(process.env.HUGGINGFACE_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Universal LLM query function with multiple provider support
 * @param {string} prompt - The input prompt
 * @param {string} provider - 'huggingface', 'openai', or 'openrouter'
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
  }

  throw new Error(`Unsupported provider: ${provider}. Supported: 'huggingface', 'openai', 'openrouter'`);
}

/**
 * Get available service status for diagnostics
 * @returns {object} Service availability status
 */
export function getServiceStatus() {
  return {
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    sdks: {
      huggingface: !!hf,
      openai: !!openai
    }
  };
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
