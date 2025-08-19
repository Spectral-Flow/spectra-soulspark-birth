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

// Simple test export
export { testSpectraVoice } from './test';

// Streaming examples and tests
export { runStreamingExamples } from './streaming-examples';
export { testStreaming, testStreamingInBrowser } from './streaming-test';
