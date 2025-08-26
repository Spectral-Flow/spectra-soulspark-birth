/**
 * Test script for Local LLM integration
 * Run with: node test-local-llm.js
 */

import { queryLLM, testLocalLLMConnection, getServiceStatus } from './llm_integrations/llm_client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testLocalLLM() {
  console.log('🔮 Testing Local LLM Integration\n');

  // Test service status
  console.log('📊 Service Status:');
  const status = getServiceStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');

  // Test configuration
  const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434';
  const apiType = process.env.LOCAL_LLM_API_TYPE || 'ollama';
  const model = process.env.LOCAL_LLM_MODEL || 'llama2';

  console.log(`🔗 Testing connection to: ${endpoint}`);
  console.log(`🤖 API Type: ${apiType}`);
  console.log(`📝 Model: ${model}\n`);

  // Test connectivity
  try {
    const connectionTest = await testLocalLLMConnection(endpoint, apiType);
    
    if (connectionTest.success) {
      console.log('✅ Connection successful!');
      console.log('Available models:', connectionTest.models);
      console.log('');

      // Test actual query
      console.log('💬 Testing query...');
      const testPrompt = 'Hello! Please respond with a brief greeting.';
      
      const response = await queryLLM(testPrompt, 'local', {
        endpoint,
        model,
        apiType,
        maxTokens: 50,
        temperature: 0.7
      });

      console.log('📤 Prompt:', testPrompt);
      console.log('📥 Response:', response);
      console.log('\n✅ Local LLM integration test completed successfully!');

    } else {
      console.log('❌ Connection failed:', connectionTest.error);
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure your local LLM server is running');
      console.log('2. Check the endpoint URL and port');
      console.log('3. Verify both devices are on the same network');
      console.log('4. For mobile: use IP address instead of localhost');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('- Check your LOCAL_LLM_ENDPOINT in .env file');
    console.log('- Ensure the LLM server is accessible');
    console.log('- Try increasing timeout values for slow mobile LLMs');
  }
}

// Run the test
testLocalLLM().catch(console.error);