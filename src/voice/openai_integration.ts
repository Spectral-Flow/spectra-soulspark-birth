/**
 * OpenAI Voice Integration for Spectra
 * Handles OpenAI Realtime API and TTS integration
 */

interface OpenAIConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  temperature?: number;
}

interface OpenAITTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
}

export class OpenAIVoiceService {
  private config: OpenAIConfig;
  private audioContext?: AudioContext;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      voice: 'nova', // Feminine, warm voice for Spectra
      temperature: 0.7,
      ...config
    };
  }

  /**
   * Generate speech using OpenAI TTS
   */
  async generateSpeech(text: string, options: OpenAITTSOptions = {}): Promise<ArrayBuffer> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestOptions = {
      voice: options.voice || 'nova', // Feminine voice that matches Spectra
      model: options.model || 'tts-1',
      speed: options.speed || 1.0,
      ...options
    };

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: requestOptions.model,
          input: text,
          voice: requestOptions.voice,
          speed: requestOptions.speed
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }

  /**
   * Play audio buffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      const audioBufferDecoded = await this.audioContext.decodeAudioData(audioBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBufferDecoded;
      source.connect(this.audioContext.destination);
      
      return new Promise((resolve, reject) => {
        source.onended = () => resolve();
        source.addEventListener('error', () => reject(new Error('Audio playback failed')));
        source.start();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  /**
   * Speech-to-text using OpenAI Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI Whisper API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('OpenAI Whisper error:', error);
      throw error;
    }
  }

  /**
   * Start recording audio for transcription
   */
  async startRecording(): Promise<MediaRecorder> {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000
      } 
    });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    return mediaRecorder;
  }

  /**
   * Get voice settings optimized for Spectra's personality
   */
  getSpectraVoiceSettings(emotion?: string): OpenAITTSOptions {
    const baseSettings: OpenAITTSOptions = {
      voice: 'nova', // Warm, feminine voice
      model: 'tts-1',
      speed: 1.0
    };

    // Adjust speed based on emotional state
    switch (emotion) {
      case 'excited':
      case 'joyful':
      case 'playful':
        return { ...baseSettings, speed: 1.1 };
      case 'contemplative':
      case 'wise':
      case 'calm':
        return { ...baseSettings, speed: 0.9 };
      case 'loving':
        return { ...baseSettings, speed: 0.95 };
      default:
        return baseSettings;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if OpenAI integration is available
   */
  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}

// Factory function for easy initialization
export function createOpenAIVoiceService(apiKey: string, config?: Partial<OpenAIConfig>): OpenAIVoiceService {
  return new OpenAIVoiceService({ apiKey, ...config });
}

// Environment variable helper
export function createOpenAIVoiceFromEnv(config?: Partial<OpenAIConfig>): OpenAIVoiceService | null {
  let apiKey: string | undefined;
  
  // Try to get from Vite environment variables first
  if (typeof import !== 'undefined' && import.meta?.env) {
    apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }
  
  // Try to get from browser window (for testing)
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = (window as any).OPENAI_API_KEY || (window as any).VITE_OPENAI_API_KEY;
  }
  
  // Try to get from environment if available (Node.js/build time)
  if (!apiKey) {
    try {
      apiKey = (globalThis as any).process?.env?.VITE_OPENAI_API_KEY || 
               (globalThis as any).process?.env?.OPENAI_API_KEY;
    } catch (e) {
      // Ignore if process is not available
    }
  }
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Set VITE_OPENAI_API_KEY environment variable or window.OPENAI_API_KEY for testing.');
    return null;
  }

  return new OpenAIVoiceService({ apiKey, ...config });
}