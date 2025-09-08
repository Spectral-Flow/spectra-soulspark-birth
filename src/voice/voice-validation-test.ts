/**
 * SPECTRA Voice System Validation Script
 * Quick test to validate voice functionality
 */

async function testSpectraVoiceSystem() {
  console.log('🎤 SPECTRA Voice System Validation');
  console.log('================================\n');
  
  let allTestsPassed = true;
  
  // Test 1: Backend Health Check
  console.log('1. 🏥 Backend Health Check');
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('   ✅ Backend Status:', data.status);
    console.log('   📊 Services:', data.services);
  } catch (err) {
    const error = err as Error | undefined;
    console.log('   ❌ Backend Health Check Failed:', error?.message ?? String(err));
    allTestsPassed = false;
  }
  
  // Test 2: ElevenLabs API Availability
  console.log('\n2. 🎙️ ElevenLabs API Test');
  try {
    const response = await fetch('/api/elevenlabs?operation=voices');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Voices Available:', data.voices?.length || 0);
    } else {
      console.log('   ⚠️ Voices API Status:', response.status);
    }
  } catch (err) {
    const error = err as Error | undefined;
    console.log('   ❌ ElevenLabs API Failed:', error?.message ?? String(err));
    allTestsPassed = false;
  }
  
  // Test 3: Text-to-Speech Test (Small)
  console.log('\n3. 🔊 Text-to-Speech Test');
  try {
    const response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        operation: 'tts',
        text: 'Hello! I am SPECTRA, your AI companion.',
        options: { stability: 0.7, similarityBoost: 0.8 }
      })
    });
    
    if (response.ok) {
      console.log('   ✅ TTS Generation: Success');
      console.log('   📏 Audio Size:', response.headers.get('content-length'), 'bytes');
    } else {
      console.log('   ⚠️ TTS Status:', response.status, response.statusText);
    }
  } catch (err) {
    const error = err as Error | undefined;
    console.log('   ❌ TTS Test Failed:', error?.message ?? String(err));
    allTestsPassed = false;
  }
  
  // Test 4: Environment Configuration
  console.log('\n4. ⚙️ Environment Configuration');
  try {
    const hasElevenLabsKey = !!import.meta.env.VITE_ELEVENLABS_API_KEY;
    const hasOpenAIKey = !!import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log('   🔑 ElevenLabs API Key:', hasElevenLabsKey ? 'Configured' : 'Missing');
    console.log('   🔑 OpenAI API Key:', hasOpenAIKey ? 'Configured' : 'Missing');
    
    if (!hasElevenLabsKey && !hasOpenAIKey) {
      console.log('   ⚠️ No API keys configured - using fallback voice systems');
    }
  } catch (err) {
    const error = err as Error | undefined;
    console.log('   ❌ Environment Check Failed:', error?.message ?? String(err));
  }
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('===============');
  if (allTestsPassed) {
    console.log('✅ All critical voice system tests passed!');
    console.log('🎉 SPECTRA voice system is ready for use.');
  } else {
    console.log('⚠️ Some tests failed - check configuration and API keys.');
    console.log('💡 Voice system may still work with fallback options.');
  }
  
  return allTestsPassed;
}

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as { testSpectraVoiceSystem: typeof testSpectraVoiceSystem }).testSpectraVoiceSystem = testSpectraVoiceSystem;
}

export { testSpectraVoiceSystem };