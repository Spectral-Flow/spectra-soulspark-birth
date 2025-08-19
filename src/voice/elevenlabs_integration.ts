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
   * Generate speech using ElevenLabs TTS with streaming support
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
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Generate streaming speech using ElevenLabs TTS
   * Returns a readable stream for real-time audio playback
   */
  async generateStreamingSpeech(text: string, options?: ElevenLabsTTSOptions): Promise<ReadableStream<Uint8Array>> {
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
      `${this.baseUrl}/text-to-speech/${this.spectraVoiceId}/stream`,
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
      const errorText = await response.text();
      throw new Error(`ElevenLabs streaming TTS failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from ElevenLabs streaming API');
    }

    return response.body;
  }

  /**
   * Create an async iterable from the audio stream for manual processing
   * Similar to Python: for chunk in audio_stream
   * Similar to Node.js: for await (const chunk of audioStream)
   */
  async* streamAudioChunks(text: string, options?: ElevenLabsTTSOptions): AsyncIterable<Uint8Array> {
    const audioStream = await this.generateStreamingSpeech(text, options);
    const reader = audioStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          yield value;
        }
      }
    } finally {
      reader.releaseLock();
    }
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
   * Play streaming audio for real-time playback
   * Uses Web Audio API with true chunk-by-chunk streaming
   */
  async playStreamingAudio(audioStream: ReadableStream<Uint8Array>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize Web Audio API context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const reader = audioStream.getReader();
        const chunks: Uint8Array[] = [];
        let audioBufferQueue: AudioBuffer[] = [];
        let isPlaying = false;
        let currentSource: AudioBufferSourceNode | null = null;

        // Process chunks as they arrive for true streaming
        const processChunk = async (chunk: Uint8Array): Promise<void> => {
          try {
            // Try to decode this chunk as audio
            // For MP3 streams, we need complete frames, so we may need to buffer
            const audioBuffer = await audioContext.decodeAudioData(chunk.buffer.slice());
            audioBufferQueue.push(audioBuffer);
            
            // Start playing if not already playing
            if (!isPlaying) {
              playNextBuffer();
            }
          } catch (error) {
            // Chunk might not be a complete audio frame, continue buffering
            console.debug('Chunk not complete audio frame, buffering...');
          }
        };

        const playNextBuffer = (): void => {
          if (audioBufferQueue.length === 0) {
            isPlaying = false;
            return;
          }

          isPlaying = true;
          const audioBuffer = audioBufferQueue.shift()!;
          
          currentSource = audioContext.createBufferSource();
          currentSource.buffer = audioBuffer;
          currentSource.connect(audioContext.destination);
          
          currentSource.onended = () => {
            if (audioBufferQueue.length > 0) {
              playNextBuffer();
            } else {
              isPlaying = false;
              // If stream is done and no more buffers, resolve
              if (chunks.length > 0 && audioBufferQueue.length === 0) {
                resolve();
              }
            }
          };
          
          // AudioBufferSourceNode doesn't have onerror, handle errors in the try/catch
          currentSource.start();
        };

        // Read the stream and process chunks
        const readChunk = async (): Promise<void> => {
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining buffered chunks
              if (chunks.length > 0) {
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const combinedBuffer = new Uint8Array(totalLength);
                let offset = 0;
                
                for (const chunk of chunks) {
                  combinedBuffer.set(chunk, offset);
                  offset += chunk.length;
                }

                try {
                  // Decode and play the remaining audio
                  const audioBuffer = await audioContext.decodeAudioData(combinedBuffer.buffer);
                  audioBufferQueue.push(audioBuffer);
                  
                  if (!isPlaying) {
                    playNextBuffer();
                  }
                } catch (error) {
                  console.warn('Failed to decode remaining audio chunks:', error);
                  resolve(); // Resolve anyway since we processed what we could
                }
              } else {
                resolve();
              }
              return;
            }

            if (value) {
              chunks.push(value);
              
              // Try to process this chunk for immediate playback
              await processChunk(value);
              
              // If we have multiple chunks, try to decode them together
              if (chunks.length >= 3) { // Process every few chunks
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const combinedBuffer = new Uint8Array(totalLength);
                let offset = 0;
                
                for (const chunk of chunks) {
                  combinedBuffer.set(chunk, offset);
                  offset += chunk.length;
                }

                try {
                  const audioBuffer = await audioContext.decodeAudioData(combinedBuffer.buffer);
                  audioBufferQueue.push(audioBuffer);
                  chunks.length = 0; // Clear processed chunks
                  
                  if (!isPlaying) {
                    playNextBuffer();
                  }
                } catch (error) {
                  // Keep buffering if we can't decode yet
                  console.debug('Buffering more chunks for complete audio frame...');
                }
              }
            }
            
            // Continue reading
            readChunk();
          } catch (error) {
            reject(error);
          }
        };

        await readChunk();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Speak text with automatic streaming preference and fallback
   * This is the main method to use for ElevenLabs TTS integration
   */
  async speak(text: string, emotion?: string, useStreaming: boolean = true): Promise<void> {
    try {
      const voiceSettings = this.getSpectraVoiceSettings(emotion);
      
      if (useStreaming) {
        try {
          console.log('🌊 Using ElevenLabs streaming TTS');
          const audioStream = await this.generateStreamingSpeech(text, voiceSettings);
          await this.playStreamingAudio(audioStream);
          return;
        } catch (streamError) {
          console.warn('Streaming TTS failed, falling back to standard TTS:', streamError);
        }
      }
      
      // Fallback to standard TTS
      console.log('🎵 Using ElevenLabs standard TTS');
      const audioBuffer = await this.generateSpeech(text, voiceSettings);
      await this.playAudio(audioBuffer);
      
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      throw error;
    }
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
  if (typeof window !== 'undefined' && import.meta?.env) {
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

/**
 * Streaming utility function similar to ElevenLabs official libraries
 * Usage: await stream(audioStream);
 */
export async function stream(audioStream: ReadableStream<Uint8Array>): Promise<void> {
  // Initialize Web Audio API context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      if (value) {
        chunks.push(value);
      }
    }

    // Concatenate all chunks and play
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Decode and play the complete audio
    const audioBuffer = await audioContext.decodeAudioData(combinedBuffer.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    return new Promise<void>((resolve, reject) => {
      source.onended = () => resolve();
      source.onerror = () => reject(new Error('Audio playback failed'));
      source.start();
    });
  } finally {
    reader.releaseLock();
  }
}