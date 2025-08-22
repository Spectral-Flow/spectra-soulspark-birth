#!/usr/bin/env node

/**
 * Real API Development Server
 * Loads and executes actual TypeScript API files using tsx
 */

import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import url from 'url';
import fs from 'fs';

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

// Execute TypeScript API file using tsx
const executeAPIHandler = async (apiPath, requestData) => {
  return new Promise((resolve, reject) => {
    // Create a temporary script that runs the API handler
    const tempScript = `
      import handler from './${apiPath}';
      
      const req = ${JSON.stringify(requestData.req)};
      const responses = [];
      
      const res = {
        statusCode: 200,
        setHeader: (name, value) => responses.push(['header', name, value]),
        status: (code) => { res.statusCode = code; return res; },
        json: (data) => responses.push(['json', data]),
        end: (data) => responses.push(['end', data])
      };
      
      try {
        await handler(req, res);
        console.log(JSON.stringify({ status: 'success', statusCode: res.statusCode, responses }));
      } catch (error) {
        console.log(JSON.stringify({ status: 'error', error: error.message, stack: error.stack }));
      }
    `;

    // Write temp script
    const tempFile = join(__dirname, 'temp-api-runner.mjs');
    fs.writeFileSync(tempFile, tempScript);

    // Execute with tsx
    const child = spawn('npx', ['tsx', tempFile], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse result: ${stdout}`));
        }
      } else {
        reject(new Error(`Process failed: ${stderr || stdout}`));
      }
    });

    // Set timeout
    setTimeout(() => {
      child.kill();
      reject(new Error('Request timeout'));
    }, 30000);
  });
};

// Helper to create request data for API
const createRequestData = (req, parsedUrl, body) => ({
  req: {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: body,
    query: parsedUrl.query
  }
});

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

  // Route API calls to actual TypeScript handlers
  if (path.startsWith('/api/')) {
    const apiPath = path.replace('/api/', '');
    
    // Map API paths to TypeScript file paths
    const pathMappings = {
      'health': 'api/health.ts',
      'elevenlabs/voices': 'api/elevenlabs/voices.ts',
      'elevenlabs/tts': 'api/elevenlabs/tts.ts',
      'elevenlabs/signed-url': 'api/elevenlabs/signed-url.ts',
      'openai/chat': 'api/openai/chat.ts',
      'openai/tts': 'api/openai/tts.ts',
      'sessions': 'api/sessions.ts'
    };

    const tsFilePath = pathMappings[apiPath];
    if (tsFilePath && fs.existsSync(join(__dirname, tsFilePath))) {
      try {
        const requestData = createRequestData(req, parsedUrl, body);
        const result = await executeAPIHandler(tsFilePath, requestData);
        
        if (result.status === 'success') {
          setCorsHeaders(res);
          res.writeHead(result.statusCode);
          
          // Process responses
          for (const response of result.responses) {
            const [type, ...args] = response;
            switch (type) {
              case 'header':
                res.setHeader(args[0], args[1]);
                break;
              case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(args[0], null, 2));
                return;
              case 'end':
                res.end(args[0]);
                return;
            }
          }
          res.end();
        } else {
          setCorsHeaders(res);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'API handler error',
            message: result.error,
            timestamp: new Date().toISOString()
          }));
        }
        return;
      } catch (error) {
        console.error(`Error executing ${tsFilePath}:`, error);
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

  // Fallback for unknown API endpoints
  if (path.startsWith('/api/')) {
    setCorsHeaders(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not found',
      path: path,
      available: Object.keys({
        'health': 'api/health.ts',
        'elevenlabs/voices': 'api/elevenlabs/voices.ts',
        'elevenlabs/tts': 'api/elevenlabs/tts.ts',
        'elevenlabs/signed-url': 'api/elevenlabs/signed-url.ts',
        'openai/chat': 'api/openai/chat.ts',
        'openai/tts': 'api/openai/tts.ts',
        'sessions': 'api/sessions.ts'
      }).map(endpoint => `/api/${endpoint}`),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // For non-API requests, return a simple response
  setCorsHeaders(res);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>Spectra Real API Dev Server</title></head>
      <body>
        <h1>Spectra Real API Development Server</h1>
        <p>This server executes actual TypeScript API files.</p>
        <p><a href="/api/health">Health Check</a></p>
        <p>Running on port ${port}</p>
      </body>
    </html>
  `);
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Spectra Real API server running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
  console.log(`🔧 Executing actual TypeScript API files`);
  console.log(`📊 API Keys configured:`);
  console.log(`  - ElevenLabs: ${!!process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}`);
  console.log(`  - OpenAI: ${!!process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});