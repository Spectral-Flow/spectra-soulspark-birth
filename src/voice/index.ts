/**
 * Spectra Voice System - Entry Point
 * Unified interface for voice input/output with graceful fallbacks
 */

export { createSpectraVoice, VoiceManager, createVoiceManager } from './voice_manager';
export { TextToSpeechEngine, createTextToSpeech } from './text_to_speech';

export { OpenAIVoiceService, createOpenAIVoiceService, createOpenAIVoiceFromEnv } from './openai_integration';

export { ElevenLabsVoiceService, createElevenLabsVoiceService, createElevenLabsVoiceFromEnv, stream } from './elevenlabs_integration';

export { SpectraVoiceBridge, createSpectraVoiceBridge } from './spectra_voice_bridge';

export { SpeechToTextEngine, createSpeechToText } from './speech_to_text';

// Audio Processing with AudioWorklet and fallback
export { SpectraAudioProcessor, createAudioProcessor, getBrowserAudioSupport } from './audio-processor';

// Re-export types for compatibility
export type { VoiceConfig, VoiceEvents } from './voice_manager';
export type { AudioProcessorConfig } from './audio-processor';

// Test functions only available in development
if (import.meta.env.DEV) {
  // Simple test export - development only
  try {
    import('./test').then(({ testSpectraVoice }) => {
      (window as any).testSpectraVoice = testSpectraVoice;
      console.log('🧪 Voice test functions loaded:', 
        '\n  - testSpectraVoice() - Full voice system test');
    }).catch(error => {
      console.warn('Voice test functions not available');
    });
  } catch (error) {
    // Silent fail in production
  }
  
  // Streaming examples and tests - development only
  try {
    Promise.all([
      import('./streaming-examples'),
      import('./streaming-test')
    ]).then(([{ runStreamingExamples }, { testStreaming, testStreamingInBrowser }]) => {
      (window as any).runStreamingExamples = runStreamingExamples;
      (window as any).testStreaming = testStreaming;
      (window as any).testStreamingInBrowser = testStreamingInBrowser;
      console.log('🧪 Voice streaming test functions loaded:',
        '\n  - runStreamingExamples() - Streaming examples',
        '\n  - testStreaming() - Streaming test',
        '\n  - testStreamingInBrowser() - Browser streaming test');
    }).catch(error => {
      console.warn('Voice streaming test functions not available');
    });
  } catch (error) {
    // Silent fail in production
  }
}
