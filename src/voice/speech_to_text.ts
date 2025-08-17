/**
 * Speech-to-Text Module for Spectra
 * Handles voice input using OpenAI Realtime API or Whisper fallback
 */

interface STTConfig {
  apiKey?: string;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  useRealtimeAPI?: boolean;
}

interface STTResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

type STTCallback = (result: STTResult) => void;
type STTErrorCallback = (error: Error) => void;

export class SpeechToTextEngine {
  private config: STTConfig;
  private isListening: boolean = false;
  private recognition: SpeechRecognition | null = null;
  private onResultCallback?: STTCallback;
  private onErrorCallback?: STTErrorCallback;
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;

  constructor(config: STTConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      useRealtimeAPI: false,
      ...config
    };
    
    this.initializeWebSpeechAPI();
  }

  private initializeWebSpeechAPI(): void {
    // Fallback to Web Speech API if OpenAI not available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.config.continuous || true;
      this.recognition.interimResults = this.config.interimResults || true;
      this.recognition.lang = this.config.language || 'en-US';
      
      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (this.onResultCallback) {
            this.onResultCallback({
              transcript: transcript.trim(),
              confidence: result[0].confidence || 0.9,
              isFinal: result.isFinal,
              timestamp: new Date()
            });
          }
        }
      };

      this.recognition.onerror = (event) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if in continuous mode
        if (this.config.continuous && this.isListening) {
          this.startListening();
        }
      };
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      if (this.config.useRealtimeAPI && this.config.apiKey) {
        await this.startRealtimeAPIListening();
      } else {
        await this.startWebSpeechListening();
      }
      
      this.isListening = true;
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private async startWebSpeechListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available in this browser');
    }

    this.recognition.start();
  }

  private async startRealtimeAPIListening(): Promise<void> {
    // TODO: Implement OpenAI Realtime API integration
    // For now, fallback to Web Speech API
    console.log('OpenAI Realtime API not yet implemented, falling back to Web Speech API');
    await this.startWebSpeechListening();
  }

  stopListening(): void {
    this.isListening = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  onResult(callback: STTCallback): void {
    this.onResultCallback = callback;
  }

  onError(callback: STTErrorCallback): void {
    this.onErrorCallback = callback;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  updateConfig(newConfig: Partial<STTConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.recognition) {
      this.recognition.lang = this.config.language || 'en-US';
      this.recognition.continuous = this.config.continuous || true;
      this.recognition.interimResults = this.config.interimResults || true;
    }
  }
}

// Factory function for easy initialization
export function createSpeechToText(config?: STTConfig): SpeechToTextEngine {
  return new SpeechToTextEngine(config);
}