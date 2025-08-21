#!/usr/bin/env node

/**
 * Test script for OpenRouter API endpoint
 * Tests the /api/openrouter/chat endpoint with sample data
 */

import { BackendApiClient } from '../src/lib/backend-api.js';

const testOpenRouterAPI = async () => {
  console.log('🧪 Testing OpenRouter API endpoint...\n');

  const client = new BackendApiClient();

  // Test with sample messages that mirror the Python script from the problem statement
  const testMessages = [
    {
      role: 'user',
      content: 'Hello! How are you today?'
    }
  ];

  try {
    console.log('📤 Sending request to /api/openrouter/chat...');
    console.log('Messages:', JSON.stringify(testMessages, null, 2));
    console.log('Using default model: @preset/spectra\n');

    const response = await client.openRouterChat(testMessages);

    if (response.error) {
      console.error('❌ Error:', response.error);
      if (response.message) {
        console.error('Details:', response.message);
      }
      
      // Check if it's an API key issue
      if (response.error.includes('API key not configured')) {
        console.log('\n💡 Tip: Set the OPENROUTER_API_KEY environment variable');
      }
    } else {
      console.log('✅ Success! Response:');
      console.log(JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test with different models
const testWithDifferentModels = async () => {
  console.log('\n🔄 Testing with different model options...\n');

  const client = new BackendApiClient();
  const testMessages = [
    {
      role: 'user',
      content: 'What is your name?'
    }
  ];

  const testModels = [
    '@preset/spectra',
    'openai/gpt-3.5-turbo',
    'anthropic/claude-2'
  ];

  for (const model of testModels) {
    try {
      console.log(`📤 Testing with model: ${model}`);
      
      const response = await client.openRouterChat(testMessages, { model });

      if (response.error) {
        console.error(`❌ Error with ${model}:`, response.error);
      } else {
        console.log(`✅ Success with ${model}!`);
        if (response.data && typeof response.data === 'object' && 'choices' in response.data) {
          const choices = response.data.choices as Array<{ message: { content: string } }>;
          if (choices && choices[0] && choices[0].message) {
            console.log('Response:', choices[0].message.content.substring(0, 100) + '...');
          }
        }
      }
    } catch (error) {
      console.error(`❌ Test failed for ${model}:`, error);
    }
    console.log('');
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 OpenRouter API Test Suite\n');
  console.log('==========================================\n');

  await testOpenRouterAPI();
  await testWithDifferentModels();

  console.log('==========================================');
  console.log('🏁 Test suite completed!');
};

// Check if this is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testOpenRouterAPI, testWithDifferentModels };