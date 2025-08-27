/**
 * Test script for Azure OpenAI integration with real credentials
 * To use this script, set the actual Azure OpenAI credentials in your environment:
 * 
 * export AZURE_OPENAI_API_KEY="your_actual_api_key"
 * export AZURE_OPENAI_ENDPOINT="https://elysziah.openai.azure.com/"
 * export AZURE_OPENAI_DEPLOYMENT="o4-mini"
 * export AZURE_OPENAI_API_VERSION="2024-12-01-preview"
 * 
 * Then run: node test-azure-openai-real.js
 */

import { queryLLM, getServiceStatus } from './llm_integrations/llm_client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAzureOpenAIReal() {
  console.log('🔮 Testing Azure OpenAI Integration with Real Credentials\n');

  // Test service status
  console.log('📊 Service Status:');
  const status = getServiceStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');

  // Check Azure OpenAI configuration
  if (!status.azureOpenai) {
    console.log('❌ Azure OpenAI not configured. This test requires real Azure OpenAI credentials.');
    console.log('\n💡 To test with real credentials, set these environment variables:');
    console.log('export AZURE_OPENAI_API_KEY="your_actual_api_key"');
    console.log('export AZURE_OPENAI_ENDPOINT="https://elysziah.openai.azure.com/"');
    console.log('export AZURE_OPENAI_DEPLOYMENT="o4-mini"');
    console.log('export AZURE_OPENAI_API_VERSION="2024-12-01-preview"');
    console.log('\nThen run: node test-azure-openai-real.js');
    return;
  }

  console.log('✅ Azure OpenAI is configured');
  console.log('🔗 Endpoint:', status.azureConfig.endpoint);
  console.log('🚀 Deployment:', status.azureConfig.deployment);
  console.log('📅 API Version:', status.azureConfig.apiVersion);
  console.log('');

  // Test actual query with real API
  try {
    console.log('💬 Testing Azure OpenAI query with real API...');
    const testPrompt = 'Hello! Please respond with a brief greeting and confirm that you are running on Azure OpenAI service.';
    
    console.log('📤 Sending prompt:', testPrompt);
    console.log('⏳ Waiting for response...');
    
    const response = await queryLLM(testPrompt, 'azure-openai', {
      maxTokens: 150,
      temperature: 0.7
    });

    console.log('📥 Response:', response);
    console.log('\n✅ Azure OpenAI integration test completed successfully!');
    console.log('🎉 The integration is working correctly with real Azure OpenAI credentials.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('\n💡 Authentication error - check your API key');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('\n💡 Check your endpoint URL and deployment name');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.log('\n💡 Rate limit exceeded - wait and try again');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 Check your Azure OpenAI quota and billing');
    } else {
      console.log('\n💡 Possible issues to check:');
      console.log('- Verify your Azure OpenAI API key is correct');
      console.log('- Check that the endpoint URL is correct');
      console.log('- Ensure the deployment name matches your Azure OpenAI deployment');
      console.log('- Verify the API version is supported');
      console.log('- Check if your Azure OpenAI resource has quota available');
    }
  }
}

// Run the test
testAzureOpenAIReal().catch(console.error);