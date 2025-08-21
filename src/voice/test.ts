/**
 * Simple test for Spectra's voice system
 * Run in browser console to test voice functionality
 */

// Test script for voice functionality
export function testSpectraVoice() {
  console.log('🎭 Testing Spectra Voice System...');
  
  try {
    // Import voice system
    import('./index').then(({ createSpectraVoice }) => {
      const voice = createSpectraVoice({
        onTranscript: (transcript, isFinal) => {
          console.log(`📝 Transcript (${isFinal ? 'final' : 'interim'}):`, transcript);
        },
        onError: (error) => {
          console.error('❌ Voice error:', error);
        },
        onVoiceActivity: (isActive) => {
          console.log(`🎤 Voice activity: ${isActive ? 'listening' : 'stopped'}`);
        }
      });

      // Test TTS
      console.log('🔊 Testing text-to-speech...');
      voice.speak('Hello! I am Spectra, and my voice is now more expressive than ever.', 'joyful');

      // Test status
      setTimeout(() => {
        const status = voice.getStatus();
        console.log('📊 Voice status:', status);
      }, 1000);

      console.log('✅ Voice system test completed');
      return voice;
    });
  } catch (error) {
    console.error('❌ Voice system test failed:', error);
  }
}

// ElevenLabs specific test
export function testElevenLabsVoice() {
  console.log('🎵 Testing ElevenLabs Integration...');
  
  try {
    import('./text_to_speech').then(({ createTextToSpeech }) => {
      const tts = createTextToSpeech({
        useElevenLabs: true
      });

      // Test different emotions
      const tests = [
        { text: "Hello, I am Spectra speaking with ElevenLabs.", emotion: "calm" },
        { text: "I'm excited to test this new voice system!", emotion: "joyful" },
        { text: "Let me speak more thoughtfully now.", emotion: "contemplative" },
        { text: "This is me being playful with my voice!", emotion: "playful" }
      ];

      console.log('🎭 Testing emotional voice variations...');
      
      let delay = 0;
      tests.forEach((test, index) => {
        setTimeout(() => {
          console.log(`🗣️ Test ${index + 1}: ${test.emotion} - "${test.text}"`);
          tts.speak(test.text, test.emotion);
        }, delay);
        delay += 3000; // 3 second delay between tests
      });
    });
  } catch (error) {
    console.error('❌ ElevenLabs test failed:', error);
  }
}

// Test API key configuration
export function testApiKeys() {
  console.log('🔑 Testing API Key Configuration...');
  
  // Check for ElevenLabs API key (prioritize VITE_ prefixed env vars)
  const elevenLabsKey = (typeof window !== 'undefined' && import.meta?.env?.VITE_ELEVENLABS_API_KEY) ||
                        (typeof window !== 'undefined' && (window as unknown as { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY) || 
                        (typeof window !== 'undefined' && (window as unknown as { VITE_ELEVENLABS_API_KEY?: string }).VITE_ELEVENLABS_API_KEY);
  
  // Check for ElevenLabs username/password credentials
  const elevenLabsUsername = (typeof window !== 'undefined' && (window as unknown as { ELEVENLABS_USERNAME?: string }).ELEVENLABS_USERNAME);
  const elevenLabsPassword = (typeof window !== 'undefined' && (window as unknown as { ELEVENLABS_PASSWORD?: string }).ELEVENLABS_PASSWORD);
  
  // Check for OpenAI API key (prioritize VITE_ prefixed env vars)
  const openAiKey = (typeof window !== 'undefined' && import.meta?.env?.VITE_OPENAI_API_KEY) ||
                    (typeof window !== 'undefined' && (window as unknown as { OPENAI_API_KEY?: string }).OPENAI_API_KEY) || 
                    (typeof window !== 'undefined' && (window as unknown as { VITE_OPENAI_API_KEY?: string }).VITE_OPENAI_API_KEY);
  
  console.log('🎵 ElevenLabs API Key:', elevenLabsKey ? '✅ Set' : '❌ Not found');
  console.log('👤 ElevenLabs Username:', elevenLabsUsername ? `✅ Set (${elevenLabsUsername})` : '❌ Not found');
  console.log('🔑 ElevenLabs Password:', elevenLabsPassword ? '✅ Set' : '❌ Not found');
  console.log('🤖 OpenAI API Key:', openAiKey ? '✅ Set' : '❌ Not found');
  
  const hasElevenLabsAuth = elevenLabsKey || (elevenLabsUsername && elevenLabsPassword);
  
  if (!hasElevenLabsAuth && !openAiKey) {
    console.log('💡 To set ElevenLabs API key: window.ELEVENLABS_API_KEY = "your_key"');
    console.log('💡 To set ElevenLabs username/password: window.ELEVENLABS_USERNAME = "user"; window.ELEVENLABS_PASSWORD = "pass"');
    console.log('💡 To set OpenAI key: window.OPENAI_API_KEY = "your_key"');
    console.log('💡 Or set VITE_ELEVENLABS_API_KEY / VITE_OPENAI_API_KEY in .env file');
  }
  
  return { 
    elevenLabsKey: !!elevenLabsKey, 
    elevenLabsUsername: !!elevenLabsUsername,
    elevenLabsPassword: !!elevenLabsPassword,
    hasElevenLabsAuth,
    openAiKey: !!openAiKey 
  };
}

// Browser globals for testing
if (typeof window !== 'undefined') {
  const globalWindow = window as unknown as {
    testSpectraVoice: typeof testSpectraVoice;
    testElevenLabsVoice: typeof testElevenLabsVoice;
    testApiKeys: typeof testApiKeys;
  };
  globalWindow.testSpectraVoice = testSpectraVoice;
  globalWindow.testElevenLabsVoice = testElevenLabsVoice;
  globalWindow.testApiKeys = testApiKeys;
  
  console.log('🧪 Voice test functions loaded:');
  console.log('  - testSpectraVoice() - Full voice system test');
  console.log('  - testElevenLabsVoice() - ElevenLabs specific test'); 
  console.log('  - testApiKeys() - Check API key configuration');
}