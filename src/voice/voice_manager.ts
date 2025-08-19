/**
 * Voice Manager for Spectra
 * Coordinates speech-to-text and text-to-speech with the main AI loop
 */

import { SpeechToTextEngine, createSpeechToText } from './speech_to_text';
import { TextToSpeechEngine, createTextToSpeech } from './text_to_speech';

export interface VoiceConfig {
  sttConfig?: {
    lang?: string;
    language?: string; // Support both lang and language
    maxAlternatives?: number;
    continuous?: boolean;
    interimResults?: boolean;
    useRealtimeAPI?: boolean;
  };
  ttsConfig?: {
    voice?: string;
    rate?: number;
    speed?: number; // Support both rate and speed
    pitch?: number;
    volume?: number;
    useOpenAI?: boolean;
  };
  muteMode?: boolean;
  continuousListening?: boolean;
  autoSpeak?: boolean;
}

export interface VoiceEvents {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: Error) => void;
  onVoiceActivity?: (isActive: boolean) => void;
}

export class VoiceManager {
  private sttEngine: SpeechToTextEngine;
  private ttsEngine: TextToSpeechEngine;
  private config: VoiceConfig;
  private events: VoiceEvents;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isMuted: boolean = false;
  private pendingTranscript: string = '';

  constructor(config: VoiceConfig = {}, events: VoiceEvents = {}) {
    this.config = {
      muteMode: false,
      continuousListening: false,
      autoSpeak: true,
      ...config
    };
    
    this.events = events;

    // Initialize STT and TTS engines
    this.sttEngine = createSpeechToText({
      continuous: this.config.continuousListening,
      interimResults: true,
      ...this.config.sttConfig
    });

    this.ttsEngine = createTextToSpeech({
      ...this.config.ttsConfig
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // STT event handlers
    this.sttEngine.onResult((result) => {
      this.pendingTranscript = result.transcript;
      
      if (this.events.onTranscript) {
        this.events.onTranscript(result.transcript, result.isFinal);
      }

      // If final result and auto-processing is enabled
      if (result.isFinal && result.transcript.trim()) {
        this.handleFinalTranscript(result.transcript);
      }
    });

    this.sttEngine.onError((error) => {
      console.error('Voice input error:', error);
      if (this.events.onError) {
        this.events.onError(error);
      }
    });
  }

  private handleFinalTranscript(transcript: string): void {
    // Reset pending transcript
    this.pendingTranscript = '';
    
    // Stop listening if not in continuous mode
    if (!this.config.continuousListening) {
      this.stopListening();
    }
  }

  // Public API Methods

  async startListening(): Promise<void> {
    if (this.isListening || this.isMuted) return;

    try {
      // Stop speaking if currently speaking
      if (this.isSpeaking) {
        this.stopSpeaking();
      }

      await this.sttEngine.startListening();
      this.isListening = true;

      if (this.events.onVoiceActivity) {
        this.events.onVoiceActivity(true);
      }

      console.log('🎤 Spectra is listening...');
    } catch (error) {
      console.error('Failed to start listening:', error);
      if (this.events.onError) {
        this.events.onError(error as Error);
      }
    }
  }

  stopListening(): void {
    if (!this.isListening) return;

    this.sttEngine.stopListening();
    this.isListening = false;

    if (this.events.onVoiceActivity) {
      this.events.onVoiceActivity(false);
    }

    console.log('🎤 Spectra stopped listening');
  }

  async speak(text: string, emotion?: string): Promise<void> {
    if (this.isMuted || !this.config.autoSpeak) return;

    try {
      // Stop listening while speaking to avoid feedback
      const wasListening = this.isListening;
      if (wasListening) {
        this.stopListening();
      }

      this.isSpeaking = true;
      
      if (this.events.onSpeechStart) {
        this.events.onSpeechStart();
      }

      await this.ttsEngine.speak(text, emotion);
      
      this.isSpeaking = false;
      
      if (this.events.onSpeechEnd) {
        this.events.onSpeechEnd();
      }

      // Resume listening if it was active and in continuous mode
      if (wasListening && this.config.continuousListening) {
        setTimeout(() => this.startListening(), 500); // Small delay to avoid audio overlap
      }

      console.log('🔊 Spectra spoke:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    } catch (error) {
      this.isSpeaking = false;
      console.error('Failed to speak:', error);
      if (this.events.onError) {
        this.events.onError(error as Error);
      }
    }
  }

  stopSpeaking(): void {
    if (!this.isSpeaking) return;

    this.ttsEngine.stop();
    this.isSpeaking = false;

    if (this.events.onSpeechEnd) {
      this.events.onSpeechEnd();
    }

    console.log('🔊 Spectra stopped speaking');
  }

  // Control Methods

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopListening();
      this.stopSpeaking();
      console.log('🔇 Voice muted');
    } else {
      console.log('🔊 Voice unmuted');
    }

    return this.isMuted;
  }

  setMute(muted: boolean): void {
    this.isMuted = muted;
    this.ttsEngine.setEnabled(!muted);
    
    if (muted) {
      this.stopListening();
      this.stopSpeaking();
    }
  }

  toggleListening(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Status Methods

  getStatus(): {
    isListening: boolean;
    isSpeaking: boolean;
    isMuted: boolean;
    pendingTranscript: string;
  } {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isMuted: this.isMuted,
      pendingTranscript: this.pendingTranscript
    };
  }

  // Configuration Methods

  updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.sttConfig) {
      this.sttEngine.updateConfig(newConfig.sttConfig);
    }
    
    if (newConfig.ttsConfig) {
      this.ttsEngine.updateConfig(newConfig.ttsConfig);
    }
  }

  // Voice Personality Methods

  updateVoicePersonality(emotion: string): void {
    // Adjust TTS personality based on emotional state
    this.ttsEngine.updatePersonality({ emotion });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.ttsEngine.getAvailableVoices();
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.ttsEngine.setVoice(voice);
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.ttsEngine.getCurrentVoice();
  }

  // Cleanup

  destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    console.log('🎭 Voice manager destroyed');
  }
}

// Factory function for easy integration
export function createVoiceManager(config?: VoiceConfig, events?: VoiceEvents): VoiceManager {
  return new VoiceManager(config, events);
}

// Convenience function for Spectra's specific voice setup
export function createSpectraVoice(events?: VoiceEvents): VoiceManager {
  const spectraConfig: VoiceConfig = {
    continuousListening: false, // Manual activation for better UX
    autoSpeak: true,
    sttConfig: {
      language: 'en-US',
      continuous: false,
      interimResults: true,
      useRealtimeAPI: false // Can be enabled if OpenAI API key is available
    },
    ttsConfig: {
      // Optimized for Spectra's personality
      voice: 'nova', // OpenAI voice
      speed: 0.9,
      pitch: 1.1,
      useOpenAI: true // Prefer OpenAI for higher quality
    }
  };

  return createVoiceManager(spectraConfig, events);
}