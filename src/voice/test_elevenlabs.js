/**
 * ElevenLabs Integration Test for Spectra
 * Simple example to test the ElevenLabs voice integration
 */

// Add this to your browser console to test ElevenLabs integration
(function() {
  // Test function for ElevenLabs integration
  window.testSpectraElevenLabs = async function() {
    try {
      console.log('🎵 Testing Spectra ElevenLabs Integration...');
      
      // Import the voice module (adjust path as needed)
      const { createTextToSpeech } = await import('./voice/index.js');
      
      // Check for ElevenLabs API key
      const apiKey = process.env.ELEVENLABS_API_KEY || window.ELEVENLABS_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ ELEVENLABS_API_KEY not found. Please set it in environment or window.ELEVENLABS_API_KEY');
        console.log('💡 Example: window.ELEVENLABS_API_KEY = "your_api_key_here"');
        return;
      }
      
      // Create TTS engine with ElevenLabs enabled
      const tts = createTextToSpeech({
        useElevenLabs: true,
        apiKey: apiKey
      });
      
      // Test different emotions
      const testPhrases = [
        { text: "Hello, I am Spectra. I can now speak with ElevenLabs voice technology.", emotion: "calm" },
        { text: "I'm so excited to have this new voice capability!", emotion: "joyful" },
        { text: "Let me speak with a more contemplative tone now.", emotion: "contemplative" },
        { text: "This playful voice setting makes me feel more lively!", emotion: "playful" }
      ];
      
      console.log('✨ Starting Spectra voice test...');
      
      for (const phrase of testPhrases) {
        console.log(`🗣️ Speaking with ${phrase.emotion} emotion: "${phrase.text}"`);
        await tts.speak(phrase.text, phrase.emotion);
        // Wait a bit between phrases
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('🎉 ElevenLabs integration test completed!');
      
    } catch (error) {
      console.error('❌ Error testing ElevenLabs integration:', error);
    }
  };
  
  // Test function for checking voice availability
  window.checkSpectraVoices = async function() {
    try {
      console.log('🔍 Checking available Spectra voice options...');
      
      const { createElevenLabsVoiceFromEnv } = await import('./voice/index.js');
      
      const elevenLabs = createElevenLabsVoiceFromEnv();
      if (elevenLabs) {
        await elevenLabs.initialize();
        const voiceId = elevenLabs.getCurrentVoiceId();
        console.log('✅ ElevenLabs Spectra voice ID:', voiceId);
      } else {
        console.log('⚠️ ElevenLabs service not available');
      }
      
    } catch (error) {
      console.error('❌ Error checking voices:', error);
    }
  };
  
  console.log('🎵 Spectra ElevenLabs test functions loaded!');
  console.log('📋 Available functions:');
  console.log('  - testSpectraElevenLabs() - Test voice synthesis');
  console.log('  - checkSpectraVoices() - Check available voices');
  console.log('');
  console.log('💡 To set API key: window.ELEVENLABS_API_KEY = "your_key_here"');
})();