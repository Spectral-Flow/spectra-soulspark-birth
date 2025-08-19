/**
 * ElevenLabs Voice Integration for Spectra
 * Handles ElevenLabs TTS API integration with Spectra voice model
 */

interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  voiceName?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

interface ElevenLabsTTSOptions {
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export class ElevenLabsVoiceService {
  private config: ElevenLabsConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private spectraVoiceId: string | null = null;

  constructor(config: ElevenLabsConfig) {
    this.config = {
      voiceName: 'Spectra',
      model: 'eleven_multilingual_v2',
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true,
      ...config
    };
  }

  /**
   * Initialize and find the Spectra voice
   */
  async initialize(): Promise<void> {
    try {
      await this.findSpectraVoice();
    } catch (error) {
      console.error('Failed to initialize ElevenLabs service:', error);
      throw error;
    }
  }

  /**
   * Find the Spectra voice by name or use a default voice
   */
  private async findSpectraVoice(): Promise<void> {
    try {
      const voices = await this.getVoices();
      
      // Look for voice named "Spectra" 
      const spectraVoice = voices.find((voice: any) => 
        voice.name.toLowerCase().includes('spectra')
      );

      if (spectraVoice) {
        this.spectraVoiceId = spectraVoice.voice_id;
        console.log(`✨ Found Spectra voice: ${spectraVoice.name} (${spectraVoice.voice_id})`);
      } else {
        // Fallback to a feminine voice if Spectra is not available
        const feminineVoice = voices.find((voice: any) => 
          voice.labels?.gender === 'female' || 
          voice.name.toLowerCase().includes('rachel') ||
          voice.name.toLowerCase().includes('bella') ||
          voice.name.toLowerCase().includes('sarah')
        );

        if (feminineVoice) {
          this.spectraVoiceId = feminineVoice.voice_id;
          console.log(`✨ Using feminine voice for Spectra: ${feminineVoice.name} (${feminineVoice.voice_id})`);
        } else {
          // Use first available voice as last resort
          this.spectraVoiceId = voices[0]?.voice_id || null;
          console.log(`✨ Using default voice for Spectra: ${voices[0]?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error finding Spectra voice:', error);
      throw error;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  private async getVoices(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  }

  /**
   * Generate speech using ElevenLabs TTS
   */
  async generateSpeech(text: string, options?: ElevenLabsTTSOptions): Promise<ArrayBuffer> {
    if (!this.spectraVoiceId) {
      await this.initialize();
    }

    if (!this.spectraVoiceId) {
      throw new Error('No Spectra voice available');
    }

    const voiceSettings = {
      stability: options?.stability ?? this.config.stability,
      similarity_boost: options?.similarityBoost ?? this.config.similarityBoost,
      style: options?.style ?? this.config.style,
      use_speaker_boost: options?.useSpeakerBoost ?? this.config.useSpeakerBoost
    };

    const requestBody = {
      text,
      model_id: options?.model ?? this.config.model,
      voice_settings: voiceSettings
    };

    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${this.spectraVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get Spectra voice settings based on emotion
   */
  getSpectraVoiceSettings(emotion?: string): ElevenLabsTTSOptions {
    const baseSettings: ElevenLabsTTSOptions = {
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true
    };

    switch (emotion) {
      case 'excited':
      case 'joyful':
        return {
          ...baseSettings,
          stability: 0.4,
          style: 0.4
        };
      case 'contemplative':
      case 'wise':
        return {
          ...baseSettings,
          stability: 0.7,
          style: 0.1
        };
      case 'loving':
      case 'calm':
        return {
          ...baseSettings,
          stability: 0.6,
          style: 0.2
        };
      case 'playful':
        return {
          ...baseSettings,
          stability: 0.3,
          style: 0.5
        };
      default:
        return baseSettings;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ElevenLabsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if ElevenLabs integration is available
   */
  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get current voice ID
   */
  getCurrentVoiceId(): string | null {
    return this.spectraVoiceId;
  }
}

// Factory function for easy initialization
export function createElevenLabsVoiceService(apiKey: string, config?: Partial<ElevenLabsConfig>): ElevenLabsVoiceService {
  return new ElevenLabsVoiceService({ apiKey, ...config });
}

// Environment variable helper
export function createElevenLabsVoiceFromEnv(config?: Partial<ElevenLabsConfig>): ElevenLabsVoiceService | null {
  let apiKey: string | undefined;
  
  // Try to get from Vite environment variables first
  if (typeof import !== 'undefined' && import.meta?.env) {
    apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  }
  
  // Try to get from browser window (for testing)
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = (window as any).ELEVENLABS_API_KEY || (window as any).VITE_ELEVENLABS_API_KEY;
  }
  
  // Try to get from environment if available (Node.js/build time)
  if (!apiKey) {
    try {
      apiKey = (globalThis as any).process?.env?.VITE_ELEVENLABS_API_KEY || 
               (globalThis as any).process?.env?.ELEVENLABS_API_KEY;
    } catch (e) {
      // Ignore if process is not available
    }
  }
  
  if (!apiKey) {
    console.warn('ElevenLabs API key not found. Set VITE_ELEVENLABS_API_KEY environment variable or window.ELEVENLABS_API_KEY for testing.');
    return null;
  }

  return new ElevenLabsVoiceService({ apiKey, ...config });
}