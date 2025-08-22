#!/usr/bin/env node

/**
 * ElevenLabs Integration Test
 * Direct test of ElevenLabs API functionality using our backend utilities
 */

import { config } from 'dotenv';

// Load environment
config();

console.log('🎵 ElevenLabs Integration Test');
console.log('=' .repeat(50));

// Test the actual ElevenLabs API call
async function testElevenLabsDirectly() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ELEVENLABS_API_KEY not configured');
    return false;
  }
  
  if (apiKey.startsWith('your_') || apiKey.includes('mock')) {
    console.log('⚠️  Mock API key detected - cannot test real integration');
    return false;
  }
  
  console.log('✅ ElevenLabs API key configured');
  
  try {
    // Test voices endpoint
    console.log('\n📡 Testing ElevenLabs Voices API...');
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (voicesResponse.ok) {
      const voicesData = await voicesResponse.json();
      console.log(`✅ Voices API working - Found ${voicesData.voices?.length || 0} voices`);
      
      // Show first few voice names
      if (voicesData.voices && voicesData.voices.length > 0) {
        const voiceNames = voicesData.voices.slice(0, 3).map(v => v.name).join(', ');
        console.log(`🎭 Sample voices: ${voiceNames}`);
      }
    } else {
      console.log(`❌ Voices API failed: ${voicesResponse.status} ${voicesResponse.statusText}`);
      return false;
    }
    
    // Test TTS endpoint with a short sample
    console.log('\n🎤 Testing ElevenLabs TTS API...');
    const ttsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });
    
    if (ttsResponse.ok) {
      const audioSize = ttsResponse.headers.get('content-length');
      console.log(`✅ TTS API working - Generated ${audioSize} bytes of audio`);
    } else {
      console.log(`❌ TTS API failed: ${ttsResponse.status} ${ttsResponse.statusText}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ ElevenLabs API error: ${error.message}`);
    return false;
  }
}

// Test OpenAI API functionality
async function testOpenAIDirectly() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY not configured');
    return false;
  }
  
  if (apiKey.startsWith('your_') || apiKey.includes('mock')) {
    console.log('⚠️  Mock API key detected - cannot test real integration');
    return false;
  }
  
  console.log('✅ OpenAI API key configured');
  
  try {
    // Test models endpoint
    console.log('\n📡 Testing OpenAI Models API...');
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      const gpt4Models = modelsData.data?.filter(m => m.id.includes('gpt-4')) || [];
      console.log(`✅ Models API working - Found ${gpt4Models.length} GPT-4 models`);
    } else {
      console.log(`❌ Models API failed: ${modelsResponse.status} ${modelsResponse.statusText}`);
      return false;
    }
    
    // Test chat completions
    console.log('\n💬 Testing OpenAI Chat API...');
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Respond with exactly "API test successful" to confirm the connection works.' }
        ],
        max_tokens: 50
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      const response = chatData.choices?.[0]?.message?.content;
      console.log(`✅ Chat API working - Response: "${response}"`);
    } else {
      console.log(`❌ Chat API failed: ${chatResponse.status} ${chatResponse.statusText}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ OpenAI API error: ${error.message}`);
    return false;
  }
}

// Test our input validation utilities
async function testValidationUtilities() {
  console.log('\n🔒 Testing Input Validation Utilities...');
  
  try {
    // Import our validation utilities
    const { validateText, sanitizeText, validateRequired } = await import('./api/utils/common.js');
    
    // Test text validation
    const emptyText = validateText('');
    const longText = validateText('a'.repeat(20000));
    const validText = validateText('Hello, world!');
    
    console.log(`✅ Empty text validation: ${!emptyText.valid ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Long text validation: ${!longText.valid ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Valid text validation: ${validText.valid ? 'PASS' : 'FAIL'}`);
    
    // Test text sanitization
    const xssText = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeText(xssText);
    const isClean = !sanitized.includes('<script>');
    
    console.log(`✅ XSS sanitization: ${isClean ? 'PASS' : 'FAIL'}`);
    
    // Test required field validation
    const missingFields = validateRequired({}, ['text', 'voiceId']);
    const hasFields = validateRequired({ text: 'hello', voiceId: 'voice1' }, ['text', 'voiceId']);
    
    console.log(`✅ Missing fields detection: ${!missingFields.valid ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Required fields validation: ${hasFields.valid ? 'PASS' : 'FAIL'}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Validation utilities error: ${error.message}`);
    return false;
  }
}

// Test our logging system
async function testLoggingSystem() {
  console.log('\n📝 Testing Logging System...');
  
  try {
    const { createLogger } = await import('./api/utils/logger.js');
    
    const logger = createLogger('test-service');
    
    // Test different log levels
    logger.info('Test info message', { test: true }, 'req-123');
    logger.warn('Test warning message', { test: true }, 'req-123');
    logger.error('Test error message', new Error('Test error'), { test: true }, 'req-123');
    logger.debug('Test debug message', { test: true }, 'req-123');
    
    console.log('✅ Logging system working (check console output above)');
    return true;
    
  } catch (error) {
    console.log(`❌ Logging system error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting Backend Integration Tests\n');
  
  const results = {
    elevenlabs: false,
    openai: false,
    validation: false,
    logging: false
  };
  
  // Test ElevenLabs integration
  console.log('🎵 ELEVENLABS INTEGRATION TEST');
  console.log('-'.repeat(40));
  results.elevenlabs = await testElevenLabsDirectly();
  
  // Test OpenAI integration
  console.log('\n🤖 OPENAI INTEGRATION TEST');
  console.log('-'.repeat(40));
  results.openai = await testOpenAIDirectly();
  
  // Test validation utilities
  results.validation = await testValidationUtilities();
  
  // Test logging system
  results.logging = await testLoggingSystem();
  
  // Summary
  console.log('\n📊 INTEGRATION TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`🎵 ElevenLabs Integration: ${results.elevenlabs ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🤖 OpenAI Integration: ${results.openai ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔒 Validation Utilities: ${results.validation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📝 Logging System: ${results.logging ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`\n📈 Overall Success Rate: ${percentage}% (${passed}/${total})`);
  
  if (percentage === 100) {
    console.log('\n🎉 All backend integrations are working perfectly!');
    console.log('✨ Ready for production deployment!');
  } else if (percentage >= 50) {
    console.log('\n✅ Core backend functionality is working.');
    console.log('⚠️  Some integrations may need API keys or configuration.');
  } else {
    console.log('\n❌ Multiple backend systems need attention.');
    console.log('🔧 Check API keys, dependencies, and configuration.');
  }
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('Integration test failed:', error);
  process.exit(1);
});