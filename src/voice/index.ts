/**
 * Spectra Voice Module
 * Main entry point for voice input/output functionality
 */

export { SpeechToTextEngine, createSpeechToText } from './speech_to_text';
export { TextToSpeechEngine, createTextToSpeech } from './text_to_speech';
export { VoiceManager, createVoiceManager, createSpectraVoice } from './voice_manager';
export { OpenAIVoiceService, createOpenAIVoiceService, createOpenAIVoiceFromEnv } from './openai_integration';
export { ElevenLabsVoiceService, createElevenLabsVoiceService, createElevenLabsVoiceFromEnv } from './elevenlabs_integration';
export { SpectraVoiceBridge, createSpectraVoiceBridge } from './spectra_voice_bridge';