import { OpenAIVoiceService, createOpenAIVoiceFromEnv } from './openai_integration';

/**
 * Speech-to-Text Module for Spectra
 * Handles voice input using OpenAI Realtime API or Whisper fallback
 */

// Speech Recognition interfaces for better typing
interface SpeechRecognitionResultItem {
  confidence: number;
  transcript: string;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

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
  private recognition: SpeechRecognitionInterface | null = null;
  private onResultCallback?: STTCallback;
  private onErrorCallback?: STTErrorCallback;
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;
  private mediaRecorder?: MediaRecorder;
  private openAIService: OpenAIVoiceService | null = null;

  constructor(config: STTConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      useRealtimeAPI: false,
      ...config
    };
    
    // Initialize OpenAI service if available
    this.openAIService = createOpenAIVoiceFromEnv();
    if (this.openAIService) {
      console.log('✨ OpenAI STT service initialized for Spectra');
    }
    
    this.initializeWebSpeechAPI();
  }

  private initializeWebSpeechAPI(): void {
    // Fallback to Web Speech API if OpenAI not available
    const SpeechRecognition = (window as unknown as {
      SpeechRecognition?: new() => SpeechRecognitionInterface;
      webkitSpeechRecognition?: new() => SpeechRecognitionInterface;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: new() => SpeechRecognitionInterface;
    }).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.config.continuous || true;
      this.recognition.interimResults = this.config.interimResults || true;
      this.recognition.lang = this.config.language || 'en-US';
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
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

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
      if (this.config.useRealtimeAPI && this.openAIService?.isAvailable()) {
        await this.startOpenAIListening();
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

  private async startOpenAIListening(): Promise<void> {
    if (!this.openAIService?.isAvailable()) {
      throw new Error('OpenAI service not available');
    }

    try {
      // Start recording for OpenAI Whisper
      this.mediaRecorder = await this.openAIService.startRecording();
      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        try {
          const transcript = await this.openAIService!.transcribeAudio(audioBlob);
          
          if (this.onResultCallback && transcript.trim()) {
            this.onResultCallback({
              transcript: transcript.trim(),
              confidence: 0.95, // OpenAI Whisper typically has high confidence
              isFinal: true,
              timestamp: new Date()
            });
          }
        } catch (error) {
          if (this.onErrorCallback) {
            this.onErrorCallback(error as Error);
          }
        }
      };

      this.mediaRecorder.start();
      console.log('🎤 Started OpenAI Whisper recording');
    } catch (error) {
      console.error('OpenAI recording error:', error);
      throw error;
    }
  }

  stopListening(): void {
    this.isListening = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
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