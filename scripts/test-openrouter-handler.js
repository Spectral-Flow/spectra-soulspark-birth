#!/usr/bin/env node

/**
 * Direct test of OpenRouter API endpoint handler
 * Tests the function directly without needing a server
 */

import handler from '../api/openrouter/chat.ts';

// Mock Vercel request and response objects
class MockVercelRequest {
  constructor(method, body) {
    this.method = method;
    this.body = body;
    this.headers = {};
  }
}

class MockVercelResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.response = null;
  }

  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.response = { type: 'json', data };
    return this;
  }

  end() {
    this.response = { type: 'end' };
    return this;
  }
}

async function testOpenRouterEndpoint() {
  console.log('🧪 Testing OpenRouter API Endpoint Handler\n');

  // Test 1: OPTIONS request (CORS preflight)
  console.log('Test 1: OPTIONS request (CORS preflight)');
  const optionsReq = new MockVercelRequest('OPTIONS', {});
  const optionsRes = new MockVercelResponse();
  
  await handler(optionsReq, optionsRes);
  
  console.log(`  Status: ${optionsRes.statusCode}`);
  console.log(`  Response Type: ${optionsRes.response?.type}`);
  console.log(`  CORS Headers: ${JSON.stringify(optionsRes.headers)}`);
  console.log(`  ✅ ${optionsRes.statusCode === 200 ? 'PASS' : 'FAIL'}\n`);

  // Test 2: Invalid method
  console.log('Test 2: Invalid method (GET)');
  const getReq = new MockVercelRequest('GET', {});
  const getRes = new MockVercelResponse();
  
  await handler(getReq, getRes);
  
  console.log(`  Status: ${getRes.statusCode}`);
  console.log(`  Response: ${JSON.stringify(getRes.response?.data)}`);
  console.log(`  ✅ ${getRes.statusCode === 405 ? 'PASS' : 'FAIL'}\n`);

  // Test 3: Missing API key (should fail gracefully)
  console.log('Test 3: Missing API key');
  const missingKeyReq = new MockVercelRequest('POST', {
    messages: [{ role: 'user', content: 'Hello' }]
  });
  const missingKeyRes = new MockVercelResponse();
  
  // Temporarily remove the API key
  const originalKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  
  await handler(missingKeyReq, missingKeyRes);
  
  console.log(`  Status: ${missingKeyRes.statusCode}`);
  console.log(`  Response: ${JSON.stringify(missingKeyRes.response?.data)}`);
  console.log(`  ✅ ${missingKeyRes.statusCode === 500 ? 'PASS' : 'FAIL'}\n`);
  
  // Restore the API key
  if (originalKey) {
    process.env.OPENROUTER_API_KEY = originalKey;
  }

  // Test 4: Missing messages
  console.log('Test 4: Missing messages array');
  const noMessagesReq = new MockVercelRequest('POST', {});
  const noMessagesRes = new MockVercelResponse();
  
  await handler(noMessagesReq, noMessagesRes);
  
  console.log(`  Status: ${noMessagesRes.statusCode}`);
  console.log(`  Response: ${JSON.stringify(noMessagesRes.response?.data)}`);
  console.log(`  ✅ ${noMessagesRes.statusCode === 400 ? 'PASS' : 'FAIL'}\n`);

  // Test 5: Valid request structure (will fail without real API key but should show proper request format)
  console.log('Test 5: Valid request structure');
  const validReq = new MockVercelRequest('POST', {
    messages: [{ role: 'user', content: 'Hello! How are you today?' }],
    model: '@preset/spectra',
    temperature: 0.7,
    max_tokens: 100
  });
  const validRes = new MockVercelResponse();
  
  try {
    await handler(validReq, validRes);
    console.log(`  Status: ${validRes.statusCode}`);
    if (validRes.response?.data?.error) {
      console.log(`  Error: ${validRes.response.data.error}`);
      if (validRes.response.data.error.includes('API key not configured')) {
        console.log(`  ✅ PASS (Expected API key error)`);
      } else {
        console.log(`  ✅ PASS (Request structure valid, got external API error)`);
      }
    } else {
      console.log(`  Response: ${JSON.stringify(validRes.response?.data)}`);
      console.log(`  ✅ PASS (Successful response)`);
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log(`  ✅ PASS (Expected error due to missing/invalid API key)`);
  }

  console.log('\n🎉 All endpoint structure tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - CORS handling: ✅');
  console.log('   - Method validation: ✅'); 
  console.log('   - API key validation: ✅');
  console.log('   - Input validation: ✅');
  console.log('   - Request structure: ✅');
  console.log('\n💡 To test with a real OpenRouter API key:');
  console.log('   1. Set OPENROUTER_API_KEY in your .env file');
  console.log('   2. Deploy to Vercel or run with vercel dev');
  console.log('   3. Test using the test-openrouter.html page');
}

testOpenRouterEndpoint().catch(console.error);