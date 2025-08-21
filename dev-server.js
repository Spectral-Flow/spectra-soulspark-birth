#!/usr/bin/env node

/**
 * Local development server for testing API endpoints
 * Simulates Vercel's serverless function environment
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import url from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const port = process.env.PORT || 3000;

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// JSON response helper
const sendJSON = (res, data, status = 200) => {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

// Mock API response generator
const mockApiResponse = (serviceName, method, body = {}, query = {}) => ({
  service: serviceName,
  success: true,
  data: { 
    message: `${serviceName} API endpoint working`,
    request: { method, body, query }
  },
  timestamp: new Date().toISOString()
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  console.log(`${new Date().toISOString()} ${method} ${path}`);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body for POST requests
  let body = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      body = data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error parsing request body:', error);
    }
  }

  // Route handling
  if (path === '/api/health') {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        elevenlabs: !!process.env.ELEVENLABS_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        database: !!process.env.DATABASE_URL,
      },
    };
    sendJSON(res, health);
  } else if (path === '/api/elevenlabs/voices') {
    sendJSON(res, mockApiResponse('ElevenLabs Voices', method, body, query));
  } else if (path === '/api/elevenlabs/tts') {
    sendJSON(res, mockApiResponse('ElevenLabs TTS', method, body, query));
  } else if (path === '/api/elevenlabs/signed-url') {
    sendJSON(res, mockApiResponse('ElevenLabs Signed URL', method, body, query));
  } else if (path === '/api/openai/chat') {
    sendJSON(res, mockApiResponse('OpenAI Chat', method, body, query));
  } else if (path === '/api/openai/tts') {
    sendJSON(res, mockApiResponse('OpenAI TTS', method, body, query));
  } else if (path === '/api/huggingface/chat') {
    sendJSON(res, mockApiResponse('Hugging Face Chat', method, body, query));
  } else if (path === '/api/openrouter/chat') {
    sendJSON(res, mockApiResponse('OpenRouter Chat', method, body, query));
  } else if (path.startsWith('/api/sessions')) {
    sendJSON(res, mockApiResponse('Session Management', method, body, query));
  } else if (path.startsWith('/api/auth/')) {
    sendJSON(res, mockApiResponse('Authentication', method, body, query));
  } else if (path.startsWith('/api/memory/')) {
    sendJSON(res, mockApiResponse('Memory Management', method, body, query));
  } else if (path.startsWith('/api/db-sessions')) {
    sendJSON(res, mockApiResponse('Database Sessions', method, body, query));
  } else {
    sendJSON(res, {
      error: 'Not found',
      path: path,
      timestamp: new Date().toISOString()
    }, 404);
  }
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Local development server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Services configured: ${Object.keys({
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
  }).filter(key => !!process.env[key.toUpperCase() + '_API_KEY']).join(', ')}`);
});