/**
 * Simple test for Spectra's voice system
 * Run in browser console to test voice functionality
 */

// Test script for voice functionality
export function testSpectraVoice() {
  console.log('🎭 Testing Spectra Voice System...');
  
  try {
    // Import voice system
    import('./voice').then(({ createSpectraVoice }) => {
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

// Browser globals for testing
if (typeof window !== 'undefined') {
  (window as any).testSpectraVoice = testSpectraVoice;
  console.log('🧪 Voice test function available as window.testSpectraVoice()');
}