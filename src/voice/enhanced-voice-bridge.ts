/**
 * Enhanced Voice Bridge with Backend Support
 * Automatically uses backend API when available, falls back to direct API calls
 */

import { backendApi, isBackendAvailable } from '@/lib/backend-api';
import { createElevenLabsVoiceFromEnv, ElevenLabsVoiceService } from './elevenlabs_integration';
import { createOpenAIVoiceFromEnv, OpenAIVoiceService } from './openai_integration';

interface VoiceConfig {
  preferBackend?: boolean;
  preferElevenLabs?: boolean;
  preferOpenAI?: boolean;
  preferHuggingFace?: boolean;
  preferOpenRouter?: boolean;
  enableStreaming?: boolean;
  fallbackToWebSpeech?: boolean;
}

interface TTSOptions {
  voiceId?: string;
  voice?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
  [key: string]: unknown;
}

interface TTSRequest {
  text: string;
  voice?: string;
  voiceId?: string;
  options?: TTSOptions;
}

interface TTSResponse {
  audio?: Blob | ArrayBuffer;
  error?: string;
  service: 'backend-elevenlabs' | 'backend-openai' | 'backend-huggingface' | 'backend-openrouter' | 'elevenlabs' | 'openai' | 'webspeech';
}

interface VoiceData {
  voice_id: string;
  name: string;
  category?: string;
  labels?: {
    gender?: string;
    age?: string;
    accent?: string;
    description?: string;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  [key: string]: unknown;
}

interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class EnhancedVoiceBridge {
  private config: VoiceConfig;
  private backendAvailable: boolean = false;
  private elevenLabsService: ElevenLabsVoiceService | null = null;
  private openAIService: OpenAIVoiceService | null = null;

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
              audio: response.data as ArrayBuffer | Blob,
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
              audio: response.data as ArrayBuffer | Blob,
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
        const audioData = await this.elevenLabsService.generateSpeech(text, {
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
        const openAIVoice = voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | undefined;
        const audioData = await this.openAIService.generateSpeech(text, { voice: openAIVoice });
        
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
  async getVoices(): Promise<VoiceData[]> {
    if (this.backendAvailable && this.config.preferBackend && this.config.preferElevenLabs) {
      try {
        const response = await backendApi.elevenLabsVoices();
        if (response.data && !response.error) {
          return (response.data as { voices?: VoiceData[] }).voices || [];
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
      return Array.from(speechSynthesis.getVoices()).map(voice => ({
        voice_id: voice.voiceURI,
        name: voice.name,
        labels: {
          gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
        }
      }));
    }

    return [];
  }

  /**
   * Chat completion via backend or direct OpenAI
   */
  async chatCompletion(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse | null> {
    if (this.backendAvailable && this.config.preferBackend) {
      // Try OpenRouter first if preferred
      if (this.config.preferOpenRouter) {
        try {
          const response = await backendApi.openRouterChat(messages, options);
          if (response.data && !response.error) {
            return response.data as ChatResponse;
          }
        } catch (error) {
          console.warn('Backend OpenRouter chat API failed:', error);
        }
      }

      // Try Hugging Face second if preferred
      if (this.config.preferHuggingFace) {
        try {
          const response = await backendApi.huggingFaceChat(messages, options);
          if (response.data && !response.error) {
            return response.data as ChatResponse;
          }
        } catch (error) {
          console.warn('Backend Hugging Face chat API failed:', error);
        }
      }

      // Try OpenAI backend as fallback
      try {
        const response = await backendApi.openAIChat(messages, options);
        if (response.data && !response.error) {
          return response.data as ChatResponse;
        }
      } catch (error) {
        console.warn('Backend OpenAI chat API failed:', error);
      }
    }

    // Note: Direct OpenAI chat completion not implemented in OpenAIVoiceService
    // This service is primarily for TTS, not chat completion
    console.warn('Direct OpenAI chat completion not available in voice service');

    return null;
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