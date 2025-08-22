#!/usr/bin/env node

/**
 * Comprehensive Backend API Integration Test
 * Tests all backend endpoints through HTTP calls to verify functionality
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment
config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TIMEOUT = 30000; // 30 seconds

console.log('🚀 Starting Comprehensive Backend Integration Tests');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`⏱️  Timeout: ${TIMEOUT}ms\n`);

// Test helper function
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Spectra-Backend-Test/1.0.0',
      ...options.headers
    },
    ...options
  };

  try {
    console.log(`📡 ${options.method || 'GET'} ${endpoint}`);
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      data: null,
      ok: false
    };
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  
  const result = await makeRequest('/api/health');
  
  if (result.ok) {
    console.log('✅ Health endpoint responding');
    if (result.data && typeof result.data === 'object') {
      console.log(`📊 Status: ${result.data.status || 'unknown'}`);
      console.log(`🔧 Environment: ${result.data.environment || 'unknown'}`);
      if (result.data.services) {
        const services = Object.entries(result.data.services)
          .filter(([_, configured]) => configured)
          .map(([name, _]) => name);
        console.log(`🔌 Configured services: ${services.join(', ') || 'none'}`);
      }
      if (result.data.summary) {
        console.log(`📈 Service Summary: ${result.data.summary.healthy}/${result.data.summary.configured} healthy`);
      }
    }
    return true;
  } else {
    console.log(`❌ Health endpoint failed: ${result.status} - ${result.statusText}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    return false;
  }
}

async function testElevenLabsEndpoints() {
  console.log('\n🎵 Testing ElevenLabs Endpoints...');
  let allPassed = true;
  
  // Test Voices endpoint
  console.log('  Testing Voices Endpoint:');
  const voicesResult = await makeRequest('/api/elevenlabs/voices');
  
  if (voicesResult.ok) {
    console.log('    ✅ Voices endpoint responding');
    if (voicesResult.data && voicesResult.data.voices) {
      console.log(`    🎭 Found ${voicesResult.data.voices.length} voices`);
    }
    if (voicesResult.headers['cache-control']) {
      console.log(`    💾 Cache: ${voicesResult.headers['cache-control']}`);
    }
  } else {
    console.log(`    ❌ Voices endpoint failed: ${voicesResult.status}`);
    allPassed = false;
  }
  
  // Test TTS endpoint
  console.log('  Testing TTS Endpoint:');
  const ttsResult = await makeRequest('/api/elevenlabs/tts', {
    method: 'POST',
    body: JSON.stringify({
      text: 'Hello, this is a test of the enhanced TTS system.',
      voiceId: 'pNInz6obpgDQGcFmaJgB'
    })
  });
  
  if (ttsResult.ok) {
    console.log('    ✅ TTS endpoint responding');
    const contentType = ttsResult.headers['content-type'];
    if (contentType && contentType.includes('audio/')) {
      const audioSize = ttsResult.headers['content-length'] || 'unknown';
      console.log(`    🎵 Audio generated: ${audioSize} bytes`);
    } else {
      console.log(`    📄 Response type: ${contentType || 'unknown'}`);
    }
  } else {
    console.log(`    ❌ TTS endpoint failed: ${ttsResult.status}`);
    if (ttsResult.data && ttsResult.data.error) {
      console.log(`    📝 Error: ${ttsResult.data.error}`);
    }
    allPassed = false;
  }
  
  // Test Signed URL endpoint
  console.log('  Testing Signed URL Endpoint:');
  const signedUrlResult = await makeRequest('/api/elevenlabs/signed-url', {
    method: 'POST',
    body: JSON.stringify({
      agentId: 'agent_3001k351jqn1ex4tvqp9tj7srxqh'
    })
  });
  
  if (signedUrlResult.ok) {
    console.log('    ✅ Signed URL endpoint responding');
    if (signedUrlResult.data && signedUrlResult.data.signed_url) {
      console.log('    🔗 Signed URL generated successfully');
    }
  } else if (signedUrlResult.status === 500 && signedUrlResult.data?.error?.includes('not configured')) {
    console.log('    ⚠️  Signed URL endpoint properly handling missing config');
  } else {
    console.log(`    ❌ Signed URL endpoint failed: ${signedUrlResult.status}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function testOpenAIEndpoints() {
  console.log('\n🤖 Testing OpenAI Endpoints...');
  let allPassed = true;
  
  // Test TTS endpoint
  console.log('  Testing OpenAI TTS Endpoint:');
  const ttsResult = await makeRequest('/api/openai/tts', {
    method: 'POST',
    body: JSON.stringify({
      text: 'Hello, this is a test of the OpenAI TTS system.',
      voice: 'alloy',
      model: 'tts-1'
    })
  });
  
  if (ttsResult.ok) {
    console.log('    ✅ OpenAI TTS endpoint responding');
    const contentType = ttsResult.headers['content-type'];
    if (contentType && contentType.includes('audio/')) {
      const audioSize = ttsResult.headers['content-length'] || 'unknown';
      console.log(`    🎵 Audio generated: ${audioSize} bytes`);
    }
  } else {
    console.log(`    ❌ OpenAI TTS endpoint failed: ${ttsResult.status}`);
    allPassed = false;
  }
  
  // Test Chat endpoint
  console.log('  Testing OpenAI Chat Endpoint:');
  const chatResult = await makeRequest('/api/openai/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello! Please respond with just "Hello back!" to confirm the API is working.' }
      ],
      model: 'gpt-4o-mini',
      max_tokens: 50
    })
  });
  
  if (chatResult.ok) {
    console.log('    ✅ OpenAI Chat endpoint responding');
    if (chatResult.data && chatResult.data.choices) {
      const response = chatResult.data.choices[0]?.message?.content;
      console.log(`    💬 AI Response: "${response?.substring(0, 50)}..."`);
    }
  } else {
    console.log(`    ❌ OpenAI Chat endpoint failed: ${chatResult.status}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function testSessionManagement() {
  console.log('\n💾 Testing Session Management...');
  let allPassed = true;
  
  const testSessionId = `test-session-${Date.now()}`;
  
  // Test session creation
  console.log('  Creating new session:');
  const createResult = await makeRequest('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      sessionId: testSessionId,
      messages: [
        { role: 'user', content: 'Test message for session creation' }
      ],
      metadata: { test: true }
    })
  });
  
  if (createResult.ok) {
    console.log('    ✅ Session created successfully');
    if (createResult.data && createResult.data.session) {
      console.log(`    📝 Session ID: ${createResult.data.session.id}`);
    }
  } else {
    console.log(`    ❌ Session creation failed: ${createResult.status}`);
    allPassed = false;
  }
  
  // Test session retrieval
  console.log('  Retrieving session:');
  const getResult = await makeRequest(`/api/sessions?sessionId=${testSessionId}`);
  
  if (getResult.ok) {
    console.log('    ✅ Session retrieved successfully');
  } else {
    console.log(`    ❌ Session retrieval failed: ${getResult.status}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function testInputValidation() {
  console.log('\n🔒 Testing Input Validation...');
  let validationPassed = true;
  
  // Test empty text validation
  console.log('  Testing text validation:');
  const emptyTextResult = await makeRequest('/api/elevenlabs/tts', {
    method: 'POST',
    body: JSON.stringify({ text: '' })
  });
  
  if (emptyTextResult.status === 400) {
    console.log('    ✅ Empty text properly rejected');
  } else {
    console.log(`    ❌ Empty text validation failed: ${emptyTextResult.status}`);
    validationPassed = false;
  }
  
  // Test invalid voice ID validation
  console.log('  Testing voice ID validation:');
  const invalidVoiceResult = await makeRequest('/api/elevenlabs/tts', {
    method: 'POST',
    body: JSON.stringify({
      text: 'Test',
      voiceId: 'invalid-voice-id-with-script-tags<script>alert("xss")</script>'
    })
  });
  
  if (invalidVoiceResult.status === 400) {
    console.log('    ✅ Invalid voice ID properly rejected');
  } else {
    console.log(`    ❌ Voice ID validation failed: ${invalidVoiceResult.status}`);
    validationPassed = false;
  }
  
  return validationPassed;
}

async function runAllTests() {
  const results = {
    health: false,
    elevenlabs: false,
    openai: false,
    sessions: false,
    validation: false
  };
  
  try {
    results.health = await testHealthEndpoint();
    results.elevenlabs = await testElevenLabsEndpoints();
    results.openai = await testOpenAIEndpoints();
    results.sessions = await testSessionManagement();
    results.validation = await testInputValidation();
    
    console.log('\n📊 Test Results Summary:');
    console.log(`🔍 Health Check: ${results.health ? '✅' : '❌'}`);
    console.log(`🎵 ElevenLabs: ${results.elevenlabs ? '✅' : '❌'}`);
    console.log(`🤖 OpenAI: ${results.openai ? '✅' : '❌'}`);
    console.log(`💾 Sessions: ${results.sessions ? '✅' : '❌'}`);
    console.log(`🔒 Validation: ${results.validation ? '✅' : '❌'}`);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log(`\n📈 Overall Success Rate: ${percentage}% (${passed}/${total})`);
    
    if (percentage === 100) {
      console.log('\n🎉 All backend systems are functioning correctly!');
    } else if (percentage >= 80) {
      console.log('\n✅ Backend systems are mostly functional with minor issues.');
    } else {
      console.log('\n⚠️  Backend systems need attention - several critical issues found.');
    }
    
  } catch (error) {
    console.error('\n❌ Test runner encountered an error:', error.message);
  }
}

// Check if server is running first
async function checkServerHealth() {
  console.log('🔎 Checking if development server is running...');
  const result = await makeRequest('/api/health');
  
  if (!result.ok) {
    console.log('❌ Development server is not responding.');
    console.log('   Please start the development server with: node dev-server.js');
    process.exit(1);
  }
  
  console.log('✅ Development server is running.\n');
}

// Main execution
async function main() {
  await checkServerHealth();
  await runAllTests();
}

main().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});