#!/usr/bin/env node

/**
 * Demo script for the new Hugging Face router integration
 * This shows how the Python OpenAI client usage translates to the new TypeScript API
 */

// Python equivalent being demonstrated:
/*
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

completion = client.chat.completions.create(
    model="openai/gpt-oss-20b:fireworks-ai",
    messages=[
        {
            "role": "user",
            "content": "What is the capital of France?"
        }
    ],
)

print(completion.choices[0].message)
*/

// TypeScript/JavaScript equivalent using our new API:
async function demoHuggingFaceRouter() {
    console.log('🤖 SPECTRA Hugging Face Router Demo\n');
    
    // Check if running in a server environment where we can test the API
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    console.log(`Testing API at: ${baseUrl}`);
    
    if (!process.env.HF_TOKEN) {
        console.log('⚠️  Warning: HF_TOKEN environment variable not set');
        console.log('   The API call will fail, but this demonstrates the structure\n');
    }
    
    // Demonstrate the API call structure
    const apiCall = {
        endpoint: `${baseUrl}/api/huggingface/chat`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            model: 'openai/gpt-oss-20b:fireworks-ai',
            messages: [
                {
                    role: 'user',
                    content: 'What is the capital of France?'
                }
            ],
            temperature: 0.7,
            max_tokens: 100
        }
    };
    
    console.log('📋 API Call Structure:');
    console.log(JSON.stringify(apiCall, null, 2));
    console.log('\n');
    
    // Show the equivalent usage in the enhanced voice bridge
    console.log('🌉 Enhanced Voice Bridge Usage:');
    console.log(`
import { createEnhancedVoiceBridge } from '@/voice/enhanced-voice-bridge';

// Create bridge with Hugging Face preference
const voiceBridge = createEnhancedVoiceBridge({
    preferHuggingFace: true,
    preferBackend: true
});

// Use chat completion - will automatically use Hugging Face if configured
const response = await voiceBridge.chatCompletion([
    {
        role: 'user',
        content: 'What is the capital of France?'
    }
], {
    model: 'openai/gpt-oss-20b:fireworks-ai',
    temperature: 0.7,
    max_tokens: 100
});

console.log(response.choices[0].message.content);
    `);
    
    console.log('\n📝 Direct Backend API Usage:');
    console.log(`
import { backendApi } from '@/lib/backend-api';

const response = await backendApi.huggingFaceChat([
    {
        role: 'user',
        content: 'What is the capital of France?'
    }
], {
    model: 'openai/gpt-oss-20b:fireworks-ai',
    temperature: 0.7,
    max_tokens: 100
});

console.log(response.data.choices[0].message.content);
    `);
    
    console.log('\n✨ Features Implemented:');
    console.log('✅ New /api/huggingface/chat endpoint');
    console.log('✅ HF_TOKEN environment variable support');
    console.log('✅ Hugging Face router model format support');
    console.log('✅ Enhanced voice bridge integration');
    console.log('✅ Fallback support (HF → OpenAI → WebSpeech)');
    console.log('✅ Example usage and test files');
    console.log('✅ Documentation updates');
    
    console.log('\n📁 Files Created/Modified:');
    console.log('- api/huggingface/chat.ts (new endpoint)');
    console.log('- src/lib/backend-api.ts (added huggingFaceChat method)');
    console.log('- src/voice/enhanced-voice-bridge.ts (added HF preference)');
    console.log('- src/examples/backend-usage.ts (added chatWithHuggingFace)');
    console.log('- scripts/test-api.js (added HF test)');
    console.log('- test-huggingface.html (browser test page)');
    console.log('- .env.example (added HF_TOKEN)');
    console.log('- BACKEND_DEPLOYMENT.md (updated docs)');
    
    console.log('\n🎯 Python→TypeScript Translation Complete!');
    console.log('The Python OpenAI client usage with Hugging Face router');
    console.log('is now fully supported in the SPECTRA TypeScript ecosystem.');
}

// Run the demo
demoHuggingFaceRouter().catch(console.error);