#!/usr/bin/env node

/**
 * Development server that actually loads and executes the TypeScript API endpoints
 * This provides a more realistic testing environment than the mock server
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import url from 'url';
import { register } from 'module';

// Register TypeScript/ES6 module handler
register('tsx/esm', import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const port = process.env.PORT || 3001;

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// Helper to create Vercel-compatible request/response objects
const createVercelRequest = (req, parsedUrl, body) => ({
  ...req,
  url: req.url,
  method: req.method,
  headers: req.headers,
  body: body,
  query: parsedUrl.query,
  cookies: {},
});

const createVercelResponse = (res) => {
  const vercelRes = {
    setHeader: (name, value) => res.setHeader(name, value),
    status: (code) => {
      vercelRes.statusCode = code;
      return vercelRes;
    },
    json: (data) => {
      setCorsHeaders(res);
      res.writeHead(vercelRes.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    },
    end: (data) => {
      setCorsHeaders(res);
      res.writeHead(vercelRes.statusCode || 200);
      res.end(data);
    },
    statusCode: 200
  };
  return vercelRes;
};

// Dynamic import cache
const handlerCache = new Map();

// Load API handler dynamically
const loadHandler = async (path) => {
  if (handlerCache.has(path)) {
    return handlerCache.get(path);
  }

  try {
    const apiPath = join(__dirname, 'api', path);
    const module = await import(apiPath);
    const handler = module.default;
    handlerCache.set(path, handler);
    return handler;
  } catch (error) {
    console.error(`Failed to load handler for ${path}:`, error);
    return null;
  }
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${new Date().toISOString()} ${method} ${path}`);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body for POST/PUT requests
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

  // Route API calls to actual handlers
  if (path.startsWith('/api/')) {
    const apiPath = path.replace('/api/', '');
    
    // Map API paths to file paths
    const pathMappings = {
      'health': 'health.ts',
      'elevenlabs/voices': 'elevenlabs/voices.ts',
      'elevenlabs/tts': 'elevenlabs/tts.ts',
      'elevenlabs/signed-url': 'elevenlabs/signed-url.ts',
      'openai/chat': 'openai/chat.ts',
      'openai/tts': 'openai/tts.ts',
      'huggingface/chat': 'huggingface/chat.ts',
      'openrouter/chat': 'openrouter/chat.ts',
      'sessions': 'sessions.ts',
      'db-sessions': 'db-sessions.ts',
      'auth/user': 'auth/user.ts',
      'memory/add': 'memory/add.ts',
      'memory/recent': 'memory/recent.ts',
      'memory/relevant': 'memory/relevant.ts',
    };

    const handlerPath = pathMappings[apiPath];
    if (handlerPath) {
      try {
        const handler = await loadHandler(handlerPath);
        if (handler) {
          const vercelReq = createVercelRequest(req, parsedUrl, body);
          const vercelRes = createVercelResponse(res);
          await handler(vercelReq, vercelRes);
          return;
        }
      } catch (error) {
        console.error(`Error executing handler for ${apiPath}:`, error);
        setCorsHeaders(res);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Internal server error',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
        return;
      }
    }
  }

  // Fallback - serve 404 for unknown API endpoints
  if (path.startsWith('/api/')) {
    setCorsHeaders(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not found',
      path: path,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // For non-API requests, return a simple response
  setCorsHeaders(res);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Spectra Dev Server</title></head>
      <body>
        <h1>Spectra Development Server</h1>
        <p>API endpoints available at <a href="/api/health">/api/health</a></p>
        <p>Running on port ${port}</p>
      </body>
    </html>
  `);
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Spectra development server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Keys configured:`);
  console.log(`  - ElevenLabs: ${!!process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}`);
  console.log(`  - OpenAI: ${!!process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`  - HuggingFace: ${!!(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN) ? '✅' : '❌'}`);
  console.log(`  - Database: ${!!process.env.DATABASE_URL ? '✅' : '❌'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});