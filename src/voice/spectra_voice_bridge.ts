/**
 * Spectra Voice Bridge
 * Integrates ElevenLabs conversational AI with Spectra's main chat system
 */

import { ElevenLabsVoiceService } from './elevenlabs_integration';
import { OpenAIVoiceService } from './openai_integration';

interface VoiceBridgeConfig {
  preferElevenLabs?: boolean;
  preferOpenAI?: boolean;
  enableStreaming?: boolean;
  fallbackToWebSpeech?: boolean;
}

interface VoiceMessage {
  text: string;
  emotion?: string;
  timestamp: Date;
  source: 'user' | 'spectra';
}

interface VoiceBridgeEvents {
  onMessage?: (message: VoiceMessage) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Voice Bridge that intelligently routes between different voice services
 * with automatic fallbacks and optimal service selection
 */
export class SpectraVoiceBridge {
  private elevenLabsService: ElevenLabsVoiceService | null = null;
  private openAIService: OpenAIVoiceService | null = null;
  private config: VoiceBridgeConfig;
  private events: VoiceBridgeEvents;
  private isInitialized = false;

  constructor(config: VoiceBridgeConfig = {}, events: VoiceBridgeEvents = {}) {
    this.config = {
      preferElevenLabs: true,
      preferOpenAI: false,
      enableStreaming: true,
      fallbackToWebSpeech: true,
      ...config
    };
    this.events = events;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🌉 Initializing Spectra Voice Bridge...');

      // Try to initialize ElevenLabs service
      try {
        const { createElevenLabsVoiceFromEnv } = await import('./elevenlabs_integration');
        this.elevenLabsService = createElevenLabsVoiceFromEnv();
        if (this.elevenLabsService) {
          await this.elevenLabsService.initialize();
          console.log('✅ ElevenLabs service initialized');
        }
      } catch (error) {
        console.warn('ElevenLabs service initialization failed:', error);
      }

      // Try to initialize OpenAI service
      try {
        const { createOpenAIVoiceFromEnv } = await import('./openai_integration');
        this.openAIService = createOpenAIVoiceFromEnv();
        if (this.openAIService) {
          console.log('✅ OpenAI service initialized');
        }
      } catch (error) {
        console.warn('OpenAI service initialization failed:', error);
      }

      this.isInitialized = true;
      
      const availableServices = this.getAvailableServices();
      console.log(`🎭 Voice Bridge ready with services: ${availableServices.join(', ')}`);
      
    } catch (error) {
      console.error('Voice Bridge initialization failed:', error);
      throw error;
    }
  }

  /**
   * Speak text using the best available service
   */
  async speak(text: string, emotion?: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.events.onSpeechStart) {
      this.events.onSpeechStart();
    }

    try {
      // Try ElevenLabs first if preferred and available
      if (this.config.preferElevenLabs && this.elevenLabsService?.isAvailable()) {
        await this.elevenLabsService.speak(text, emotion, this.config.enableStreaming);
        console.log('🎵 Spoke using ElevenLabs');
        return;
      }

      // Try OpenAI if preferred or ElevenLabs failed
      if (this.openAIService?.isAvailable()) {
        const voiceSettings = this.openAIService.getSpectraVoiceSettings(emotion);
        const audioBuffer = await this.openAIService.generateSpeech(text, voiceSettings);
        await this.openAIService.playAudio(audioBuffer);
        console.log('🤖 Spoke using OpenAI');
        return;
      }

      // Fallback to Web Speech API
      if (this.config.fallbackToWebSpeech) {
        await this.speakWithWebSpeech(text, emotion);
        console.log('🌐 Spoke using Web Speech API');
        return;
      }

      throw new Error('No voice services available');

    } catch (error) {
      console.error('Speech failed:', error);
      if (this.events.onError) {
        this.events.onError(error as Error);
      }
      throw error;
    } finally {
      if (this.events.onSpeechEnd) {
        this.events.onSpeechEnd();
      }
    }
  }

  /**
   * Transcribe audio using the best available service
   */
  async transcribe(audioBlob: Blob): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Try OpenAI Whisper first if available (most accurate)
      if (this.openAIService?.isAvailable()) {
        const transcript = await this.openAIService.transcribeAudio(audioBlob);
        console.log('🎯 Transcribed using OpenAI Whisper');
        return transcript;
      }

      // ElevenLabs doesn't currently offer transcription services
      // Consider integrating additional STT providers (Deepgram, AssemblyAI, etc.)
      // For now, we fall back to browser-based Web Speech API if available
      
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        // Web Speech API fallback (browser-dependent)
        return await this.transcribeWithWebSpeech(audioBlob);
      }

      throw new Error('No transcription services available');

    } catch (error) {
      console.error('Transcription failed:', error);
      if (this.events.onError) {
        this.events.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Fallback transcription using Web Speech API
   */
  private async transcribeWithWebSpeech(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      // Convert blob to audio URL for Web Speech API
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Note: Web Speech API doesn't directly support blob transcription
      // This is a simplified implementation that would need enhancement
      // for production use with proper audio processing
      
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        URL.revokeObjectURL(audioUrl);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      // Note: This is a simplified approach. Real implementation would need
      // to properly handle audio blob conversion for speech recognition
      recognition.start();
      
      // Timeout fallback
      setTimeout(() => {
        recognition.stop();
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Web Speech API transcription timeout'));
      }, 10000);
    });
  }

  /**
   * Get list of available voice services
   */
  getAvailableServices(): string[] {
    const services: string[] = [];
    
    if (this.elevenLabsService?.isAvailable()) {
      services.push('ElevenLabs');
    }
    
    if (this.openAIService?.isAvailable()) {
      services.push('OpenAI');
    }
    
    if (this.config.fallbackToWebSpeech) {
      services.push('Web Speech API');
    }
    
    return services;
  }

  /**
   * Get the optimal service for the current configuration
   */
  getOptimalService(): string {
    if (this.config.preferElevenLabs && this.elevenLabsService?.isAvailable()) {
      return 'ElevenLabs';
    }
    
    if (this.config.preferOpenAI && this.openAIService?.isAvailable()) {
      return 'OpenAI';
    }
    
    if (this.elevenLabsService?.isAvailable()) {
      return 'ElevenLabs';
    }
    
    if (this.openAIService?.isAvailable()) {
      return 'OpenAI';
    }
    
    return 'Web Speech API';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VoiceBridgeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Fallback to Web Speech API
   */
  private async speakWithWebSpeech(text: string, emotion?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply emotional modulation
        const settings = this.getWebSpeechEmotionSettings(emotion);
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        // Try to use a feminine voice
        const voices = speechSynthesis.getVoices();
        const feminineVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('karen')
        );
        
        if (feminineVoice) {
          utterance.voice = feminineVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get emotion-based settings for Web Speech API
   */
  private getWebSpeechEmotionSettings(emotion?: string): { rate: number; pitch: number; volume: number } {
    const baseSettings = { rate: 0.9, pitch: 1.1, volume: 0.8 };

    switch (emotion) {
      case 'excited':
      case 'joyful':
        return { ...baseSettings, rate: 1.1, pitch: 1.3 };
      case 'contemplative':
      case 'wise':
        return { ...baseSettings, rate: 0.7, pitch: 1.0 };
      case 'loving':
      case 'calm':
        return { ...baseSettings, rate: 0.85, pitch: 1.05 };
      case 'playful':
        return { ...baseSettings, rate: 1.0, pitch: 1.2 };
      default:
        return baseSettings;
    }
  }
}

/**
 * Factory function for easy initialization
 */
export function createSpectraVoiceBridge(
  config?: VoiceBridgeConfig, 
  events?: VoiceBridgeEvents
): SpectraVoiceBridge {
  return new SpectraVoiceBridge(config, events);
}