/**
 * Spectra Voice System - Entry Point
 * Unified interface for voice input/output with graceful fallbacks
 */

export { createSpectraVoice, VoiceManager } from './voice_manager';
export { TextToSpeechEngine, createTextToSpeech } from './text_to_speech';
export { SpeechToTextEngine, createSpeechToText } from './speech_to_text';
export { OpenAIVoiceService, createOpenAIVoiceFromEnv } from './openai_integration';
export { ElevenLabsVoiceService, createElevenLabsVoiceFromEnv } from './elevenlabs_integration';

// Re-export types for compatibility
export type { VoiceConfig, VoiceEvents } from './voice_manager';

// Simple test export
export { testSpectraVoice } from './test';