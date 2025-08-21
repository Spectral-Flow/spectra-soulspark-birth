/*
 * Lightweight LLM integration client
 * Supports Hugging Face (inference) and OpenAI API via axios
 * Reads API keys from environment variables (server-side)
 */

import axios from 'axios';

export async function queryLLM(prompt, provider = 'huggingface', options = {}) {
  if (provider === 'huggingface') {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not set');
    }

    const model = options.model || process.env.HUGGINGFACE_MODEL || 'gpt2';

    const res = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: options.timeout || 30000
      }
    );

    return res.data;
  } else if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set');
    }

    const model = options.model || 'gpt-4';

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model, messages: [{ role: 'user', content: prompt }], max_tokens: options.maxTokens || 512 },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, timeout: options.timeout || 30000 }
    );

    return res.data.choices?.[0]?.message?.content ?? res.data;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
