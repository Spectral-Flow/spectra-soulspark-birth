#!/usr/bin/env node

/**
 * Simple API testing script for backend endpoints
 * Run with: npm run test:api
 */

import https from 'https';
import http from 'http';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testAPI() {
  console.log('🔍 Testing SPECTRA Backend API...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      path: '/api/health',
      method: 'GET',
    },
    {
      name: 'ElevenLabs Voices',
      path: '/api/elevenlabs/voices',
      method: 'GET',
    },
    {
      name: 'Session Creation',
      path: '/api/sessions',
      method: 'POST',
      body: {
        userId: 'test-user',
        metadata: { test: true },
      },
    },
    {
      name: 'User Registration',
      path: '/api/auth/user',
      method: 'POST',
      body: {
        action: 'register',
        username: `test-user-${Date.now()}`,
        email: 'test@example.com',
      },
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await makeRequest(test.path, {
        method: test.method,
        body: test.body,
      });

      console.log(`  Status: ${result.status}`);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`  ✅ Success`);
        if (result.data && typeof result.data === 'object') {
          const keys = Object.keys(result.data).slice(0, 3);
          console.log(`  Data keys: ${keys.join(', ')}${keys.length < Object.keys(result.data).length ? '...' : ''}`);
        }
      } else {
        console.log(`  ❌ Failed`);
        console.log(`  Error: ${result.data?.error || result.data}`);
      }
    } catch (error) {
      console.log(`  ❌ Network Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('✨ API testing complete!');
}

// Run tests
testAPI().catch(console.error);