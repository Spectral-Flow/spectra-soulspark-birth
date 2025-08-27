/**
 * Test script for Azure OpenAI integration
 * Run with: node test-azure-openai.js
 */

import { queryLLM, getServiceStatus } from './llm_integrations/llm_client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAzureOpenAI() {
  console.log('🔮 Testing Azure OpenAI Integration\n');

  // Test service status
  console.log('📊 Service Status:');
  const status = getServiceStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');

  // Check Azure OpenAI configuration
  if (!status.azureOpenai) {
    console.log('❌ Azure OpenAI not configured. Please set the following environment variables:');
    console.log('- AZURE_OPENAI_API_KEY');
    console.log('- AZURE_OPENAI_ENDPOINT');
    console.log('- AZURE_OPENAI_DEPLOYMENT (optional, defaults to "o4-mini")');
    console.log('- AZURE_OPENAI_API_VERSION (optional, defaults to "2024-12-01-preview")');
    console.log('\n💡 Example configuration:');
    console.log('AZURE_OPENAI_API_KEY=your_api_key_here');
    console.log('AZURE_OPENAI_ENDPOINT=https://elysziah.openai.azure.com/');
    console.log('AZURE_OPENAI_DEPLOYMENT=o4-mini');
    console.log('AZURE_OPENAI_API_VERSION=2024-12-01-preview');
    return;
  }

  console.log('✅ Azure OpenAI is configured');
  console.log('🔗 Endpoint:', status.azureConfig.endpoint);
  console.log('🚀 Deployment:', status.azureConfig.deployment);
  console.log('📅 API Version:', status.azureConfig.apiVersion);
  console.log('');

  // Test actual query
  try {
    console.log('💬 Testing Azure OpenAI query...');
    const testPrompt = 'Hello! Please respond with a brief greeting and tell me you are Azure OpenAI.';
    
    const response = await queryLLM(testPrompt, 'azure-openai', {
      maxTokens: 100,
      temperature: 0.7
    });

    console.log('📤 Prompt:', testPrompt);
    console.log('📥 Response:', response);
    console.log('\n✅ Azure OpenAI integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('- Verify your Azure OpenAI API key is correct');
    console.log('- Check that the endpoint URL is correct (should end with /)');
    console.log('- Ensure the deployment name matches your Azure OpenAI deployment');
    console.log('- Verify the API version is supported');
    console.log('- Check if your Azure OpenAI resource has quota available');
  }
}

// Run the test
testAzureOpenAI().catch(console.error);