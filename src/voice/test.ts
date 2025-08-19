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
  
  const elevenLabsKey = (typeof window !== 'undefined' && (window as any).ELEVENLABS_API_KEY) || 
                        (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.ELEVENLABS_API_KEY);
  
  const openAiKey = (typeof window !== 'undefined' && (window as any).OPENAI_API_KEY) || 
                    (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.OPENAI_API_KEY);
  
  console.log('🎵 ElevenLabs API Key:', elevenLabsKey ? '✅ Set' : '❌ Not found');
  console.log('🤖 OpenAI API Key:', openAiKey ? '✅ Set' : '❌ Not found');
  
  if (!elevenLabsKey && !openAiKey) {
    console.log('💡 To set ElevenLabs key: window.ELEVENLABS_API_KEY = "your_key"');
    console.log('💡 To set OpenAI key: window.OPENAI_API_KEY = "your_key"');
  }
  
  return { elevenLabsKey: !!elevenLabsKey, openAiKey: !!openAiKey };
}

// Browser globals for testing
if (typeof window !== 'undefined') {
  (window as any).testSpectraVoice = testSpectraVoice;
  (window as any).testElevenLabsVoice = testElevenLabsVoice;
  (window as any).testApiKeys = testApiKeys;
  
  console.log('🧪 Voice test functions loaded:');
  console.log('  - testSpectraVoice() - Full voice system test');
  console.log('  - testElevenLabsVoice() - ElevenLabs specific test'); 
  console.log('  - testApiKeys() - Check API key configuration');
}