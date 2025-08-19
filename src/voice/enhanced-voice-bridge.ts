/**
 * Enhanced Voice Bridge with Backend Support
 * Automatically uses backend API when available, falls back to direct API calls
 */

import { backendApi, isBackendAvailable } from '@/lib/backend-api';
import { createElevenLabsVoiceFromEnv } from './elevenlabs_integration';
import { createOpenAIVoiceFromEnv } from './openai_integration';

interface VoiceConfig {
  preferBackend?: boolean;
  preferElevenLabs?: boolean;
  preferOpenAI?: boolean;
  enableStreaming?: boolean;
  fallbackToWebSpeech?: boolean;
}

interface TTSRequest {
  text: string;
  voice?: string;
  voiceId?: string;
  options?: any;
}

interface TTSResponse {
  audio?: Blob | ArrayBuffer;
  error?: string;
  service: 'backend-elevenlabs' | 'backend-openai' | 'elevenlabs' | 'openai' | 'webspeech';
}

export class EnhancedVoiceBridge {
  private config: VoiceConfig;
  private backendAvailable: boolean = false;
  private elevenLabsService: any = null;
  private openAIService: any = null;

  constructor(config: VoiceConfig = {}) {
    this.config = {
      preferBackend: true,
      preferElevenLabs: true,
      preferOpenAI: false,
      enableStreaming: true,
      fallbackToWebSpeech: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize() {
    // Check if backend is available
    this.backendAvailable = await isBackendAvailable();
    
    if (!this.backendAvailable) {
      console.info('Backend not available, initializing direct API services...');
      
      // Initialize direct API services as fallback
      this.elevenLabsService = createElevenLabsVoiceFromEnv();
      this.openAIService = createOpenAIVoiceFromEnv();
    } else {
      console.info('Backend available, will use secure API proxy');
    }
  }

  /**
   * Text-to-Speech with automatic service selection
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { text, voice, voiceId, options } = request;

    // Try backend services first (more secure)
    if (this.backendAvailable && this.config.preferBackend) {
      // Try ElevenLabs via backend
      if (this.config.preferElevenLabs) {
        try {
          const response = await backendApi.elevenLabsTTS(text, voiceId, options);
          if (response.data && !response.error) {
            return {
              audio: response.data,
              service: 'backend-elevenlabs',
            };
          }
        } catch (error) {
          console.warn('Backend ElevenLabs TTS failed:', error);
        }
      }

      // Try OpenAI via backend
      if (this.config.preferOpenAI) {
        try {
          const response = await backendApi.openAITTS(text, voice);
          if (response.data && !response.error) {
            return {
              audio: response.data,
              service: 'backend-openai',
            };
          }
        } catch (error) {
          console.warn('Backend OpenAI TTS failed:', error);
        }
      }
    }

    // Fallback to direct API services
    if (this.elevenLabsService && this.config.preferElevenLabs) {
      try {
        const audioData = await this.elevenLabsService.textToSpeech(text, {
          voiceId,
          ...options,
        });
        
        return {
          audio: audioData,
          service: 'elevenlabs',
        };
      } catch (error) {
        console.warn('Direct ElevenLabs TTS failed:', error);
      }
    }

    if (this.openAIService && this.config.preferOpenAI) {
      try {
        const audioData = await this.openAIService.textToSpeech(text, { voice });
        
        return {
          audio: audioData,
          service: 'openai',
        };
      } catch (error) {
        console.warn('Direct OpenAI TTS failed:', error);
      }
    }

    // Final fallback to Web Speech API
    if (this.config.fallbackToWebSpeech && 'speechSynthesis' in window) {
      try {
        const audioData = await this.webSpeechTTS(text, voice);
        return {
          audio: audioData,
          service: 'webspeech',
        };
      } catch (error) {
        console.warn('Web Speech TTS failed:', error);
      }
    }

    return {
      error: 'No available TTS service',
      service: 'webspeech',
    };
  }

  /**
   * Get available voices from backend or direct services
   */
  async getVoices(): Promise<any[]> {
    if (this.backendAvailable && this.config.preferBackend && this.config.preferElevenLabs) {
      try {
        const response = await backendApi.elevenLabsVoices();
        if (response.data && !response.error) {
          return response.data.voices || [];
        }
      } catch (error) {
        console.warn('Backend voices API failed:', error);
      }
    }

    if (this.elevenLabsService) {
      try {
        return await this.elevenLabsService.getVoices();
      } catch (error) {
        console.warn('Direct voices API failed:', error);
      }
    }

    // Fallback to Web Speech API voices
    if ('speechSynthesis' in window) {
      return Array.from(speechSynthesis.getVoices());
    }

    return [];
  }

  /**
   * Chat completion via backend or direct OpenAI
   */
  async chatCompletion(messages: any[], options: any = {}): Promise<any> {
    if (this.backendAvailable && this.config.preferBackend) {
      try {
        const response = await backendApi.openAIChat(messages, options);
        if (response.data && !response.error) {
          return response.data;
        }
      } catch (error) {
        console.warn('Backend chat API failed:', error);
      }
    }

    if (this.openAIService) {
      try {
        return await this.openAIService.chatCompletion(messages, options);
      } catch (error) {
        console.warn('Direct chat API failed:', error);
        throw error;
      }
    }

    throw new Error('No chat completion service available');
  }

  /**
   * Web Speech API TTS fallback
   */
  private webSpeechTTS(text: string, voice?: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes(voice.toLowerCase()) ||
          v.lang.toLowerCase().includes(voice.toLowerCase())
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Create a minimal audio blob (Web Speech API doesn't provide audio data)
      utterance.onend = () => {
        // Create empty blob as placeholder
        const blob = new Blob([''], { type: 'audio/wav' });
        resolve(blob);
      };

      utterance.onerror = (error) => {
        reject(new Error(`Speech synthesis error: ${error.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Get current service status
   */
  async getServiceStatus() {
    return {
      backendAvailable: this.backendAvailable,
      services: {
        elevenlabs: this.backendAvailable || !!this.elevenLabsService,
        openai: this.backendAvailable || !!this.openAIService,
        webspeech: 'speechSynthesis' in window,
      },
      config: this.config,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create default instance
export const enhancedVoiceBridge = new EnhancedVoiceBridge();

// Factory function for custom configurations
export function createEnhancedVoiceBridge(config?: VoiceConfig): EnhancedVoiceBridge {
  return new EnhancedVoiceBridge(config);
}