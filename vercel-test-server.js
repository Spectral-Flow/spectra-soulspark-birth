#!/usr/bin/env node

/**
 * Vercel Function Test Server
 * Loads and tests actual Vercel serverless functions locally
 */

import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const port = process.env.PORT || 3001;

// Mock Vercel Request/Response
class MockVercelRequest {
  constructor(req) {
    this.method = req.method;
    this.url = req.url;
    this.headers = req.headers;
    this.query = {};
    this.body = {};
    
    // Parse URL and query
    const parsed = url.parse(req.url, true);
    this.query = parsed.query;
    
    // Store original request for body parsing
    this._req = req;
  }
  
  async parseBody() {
    if (this.method === 'POST' || this.method === 'PUT') {
      const chunks = [];
      for await (const chunk of this._req) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      try {
        this.body = data ? JSON.parse(data) : {};
      } catch (error) {
        this.body = {};
      }
    }
  }
}

class MockVercelResponse {
  constructor(res) {
    this._res = res;
    this._status = 200;
    this._headers = {};
  }
  
  setHeader(name, value) {
    this._headers[name] = value;
    return this;
  }
  
  status(code) {
    this._status = code;
    return this;
  }
  
  json(data) {
    this.setHeader('Content-Type', 'application/json');
    this._send(JSON.stringify(data, null, 2));
  }
  
  send(data) {
    this._send(data);
  }
  
  end(data) {
    this._send(data || '');
  }
  
  _send(data) {
    // Set headers
    Object.entries(this._headers).forEach(([name, value]) => {
      this._res.setHeader(name, value);
    });
    
    this._res.writeHead(this._status);
    this._res.end(data);
  }
}

// Function loader
async function loadFunction(filePath) {
  try {
    const module = await import(filePath);
    return module.default;
  } catch (error) {
    console.error(`Error loading function ${filePath}:`, error.message);
    return null;
  }
}

// Route mapper
const routes = {
  '/api/health': './api/health.ts',
  '/api/elevenlabs/tts': './api/elevenlabs/tts.ts',
  '/api/elevenlabs/voices': './api/elevenlabs/voices.ts',
  '/api/elevenlabs/signed-url': './api/elevenlabs/signed-url.ts',
  '/api/openai/tts': './api/openai/tts.ts',
  '/api/openai/chat': './api/openai/chat.ts',
  '/api/sessions': './api/sessions.ts',
  '/api/auth/user': './api/auth/user.ts'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} ${req.method} ${pathname}`);
  
  // Handle CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Find matching route
  const functionPath = routes[pathname];
  
  if (functionPath) {
    try {
      const handler = await loadFunction(functionPath);
      
      if (handler) {
        const mockReq = new MockVercelRequest(req);
        await mockReq.parseBody();
        
        const mockRes = new MockVercelResponse(res);
        
        await handler(mockReq, mockRes);
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Function failed to load' }));
      }
    } catch (error) {
      console.error('Function execution error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Function execution error',
        message: error.message 
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      path: pathname,
      availableRoutes: Object.keys(routes)
    }));
  }
});

server.listen(port, () => {
  console.log(`🚀 Vercel Function Test Server running on http://localhost:${port}`);
  console.log(`📋 Available routes:`);
  Object.keys(routes).forEach(route => {
    console.log(`  ${route}`);
  });
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});