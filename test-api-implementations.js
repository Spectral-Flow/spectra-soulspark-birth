#!/usr/bin/env node

/**
 * API Implementation Tester
 * Tests the actual TypeScript API implementations by importing and running them
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

// For TypeScript module compatibility
const require = createRequire(import.meta.url);

// Load environment
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Vercel request/response for testing
class MockVercelRequest {
  constructor(method = 'GET', url = '/', body = {}, headers = {}) {
    this.method = method;
    this.url = url;
    this.body = body;
    this.headers = headers;
    this.query = {};
  }
}

class MockVercelResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this._data = null;
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this._data = data;
    return this;
  }

  end(data) {
    if (data) this._data = data;
    return this;
  }

  getData() {
    return this._data;
  }
}

// Test helper
async function testEndpoint(handlerPath, req, description) {
  console.log(`\n🧪 Testing: ${description}`);
  
  try {
    // Load the handler module
    const fullPath = resolve(__dirname, 'api', handlerPath);
    const module = await import(fullPath + '?t=' + Date.now()); // Cache busting
    const handler = module.default;

    if (!handler) {
      console.log(`❌ No default export found in ${handlerPath}`);
      return false;
    }

    // Create mock response
    const res = new MockVercelResponse();

    // Execute handler
    await handler(req, res);

    // Check results
    const data = res.getData();
    console.log(`✅ Status: ${res.statusCode}`);
    
    if (data) {
      if (typeof data === 'object') {
        console.log(`📄 Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`📄 Response: ${data.toString().substring(0, 200)}...`);
      }
    }

    return res.statusCode >= 200 && res.statusCode < 400;

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log(`📍 Stack: ${error.stack?.split('\n')[1]?.trim()}`);
    return false;
  }
}

async function runAPITests() {
  console.log('🚀 Starting Real API Implementation Tests\n');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Keys configured:`);
  console.log(`  - ElevenLabs: ${!!process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}`);
  console.log(`  - OpenAI: ${!!process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`  - HuggingFace: ${!!(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN) ? '✅' : '❌'}`);

  const tests = [
    // Health endpoint
    {
      path: 'health.ts',
      req: new MockVercelRequest('GET', '/api/health'),
      description: 'Health Check Endpoint'
    },

    // ElevenLabs endpoints
    {
      path: 'elevenlabs/voices.ts',
      req: new MockVercelRequest('GET', '/api/elevenlabs/voices'),
      description: 'ElevenLabs Voices Endpoint'
    },
    
    {
      path: 'elevenlabs/tts.ts',
      req: new MockVercelRequest('POST', '/api/elevenlabs/tts', {
        text: 'Hello, this is a test of the ElevenLabs TTS system.',
        voiceId: 'pNInz6obpgDQGcFmaJgB'
      }),
      description: 'ElevenLabs TTS Endpoint'
    },

    {
      path: 'elevenlabs/signed-url.ts',
      req: new MockVercelRequest('POST', '/api/elevenlabs/signed-url', {
        agentId: 'agent_3001k351jqn1ex4tvqp9tj7srxqh'
      }),
      description: 'ElevenLabs Signed URL Endpoint'
    },

    // OpenAI endpoints
    {
      path: 'openai/tts.ts',
      req: new MockVercelRequest('POST', '/api/openai/tts', {
        text: 'Hello, this is a test of the OpenAI TTS system.',
        voice: 'alloy',
        model: 'tts-1'
      }),
      description: 'OpenAI TTS Endpoint'
    },

    {
      path: 'openai/chat.ts',
      req: new MockVercelRequest('POST', '/api/openai/chat', {
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        model: 'gpt-4o-mini'
      }),
      description: 'OpenAI Chat Endpoint'
    },

    // Session management
    {
      path: 'sessions.ts',
      req: new MockVercelRequest('POST', '/api/sessions', {
        sessionId: 'test-session-123',
        messages: [{ role: 'user', content: 'Test message' }]
      }),
      description: 'Session Management Endpoint'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await testEndpoint(test.path, test.req, test.description);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log(`\n🎉 All API implementations are working correctly!`);
  } else {
    console.log(`\n⚠️  Some API implementations need attention.`);
  }
}

// Run the tests
runAPITests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});