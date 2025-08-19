/**
 * Audio Processing Manager with AudioWorklet and ScriptProcessorNode fallback
 * Provides cross-browser audio processing for Spectra voice system
 */

export interface AudioProcessorConfig {
  bufferSize?: number;
  onAudioData?: (audioData: Float32Array) => void;
  onError?: (error: Error) => void;
}

export class SpectraAudioProcessor {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isRecording = false;
  private config: AudioProcessorConfig;
  private usingWorklet = false;

  constructor(config: AudioProcessorConfig = {}) {
    this.config = {
      bufferSize: 4096,
      ...config
    };
  }

  /**
   * Check if AudioWorklet is supported
   */
  static isAudioWorkletSupported(): boolean {
    try {
      return (
        typeof AudioContext !== 'undefined' &&
        typeof AudioContext.prototype.audioWorklet !== 'undefined' &&
        typeof AudioWorkletNode !== 'undefined'
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize audio processing with microphone access
   */
  async initialize(): Promise<void> {
    try {
      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Create audio context
      this.audioContext = new AudioContext();
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Try to use AudioWorklet first
      if (SpectraAudioProcessor.isAudioWorkletSupported()) {
        await this.initializeWorklet();
      } else {
        console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode');
        this.initializeScriptProcessor();
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const audioError = new Error(`Failed to initialize audio processor: ${errorMsg}`);
      this.config.onError?.(audioError);
      throw audioError;
    }
  }

  /**
   * Initialize AudioWorklet processing
   */
  private async initializeWorklet(): Promise<void> {
    if (!this.audioContext || !this.sourceNode) {
      throw new Error('Audio context not initialized');
    }

    try {
      // Load worklet module
      await this.audioContext.audioWorklet.addModule('/audio-worklet.js');
      
      // Create worklet node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'spectra-audio-processor');
      
      // Handle messages from worklet
      this.workletNode.port.onmessage = (event) => {
        const { type, data } = event.data;
        
        if (type === 'audioData' && this.config.onAudioData) {
          this.config.onAudioData(data);
        }
      };

      // Connect audio graph
      this.sourceNode.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
      
      this.usingWorklet = true;
      console.log('✅ AudioWorklet initialized successfully');

    } catch (error) {
      console.warn('AudioWorklet initialization failed, falling back to ScriptProcessorNode:', error);
      this.initializeScriptProcessor();
    }
  }

  /**
   * Initialize ScriptProcessorNode fallback
   */
  private initializeScriptProcessor(): void {
    if (!this.audioContext || !this.sourceNode) {
      throw new Error('Audio context not initialized');
    }

    // Create script processor node
    const bufferSize = this.config.bufferSize || 4096;
    this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    // Handle audio processing
    this.scriptNode.onaudioprocess = (event) => {
      if (this.isRecording && this.config.onAudioData) {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        // Create a copy of the audio data
        const audioData = new Float32Array(inputBuffer);
        this.config.onAudioData(audioData);
      }
    };

    // Connect audio graph
    this.sourceNode.connect(this.scriptNode);
    this.scriptNode.connect(this.audioContext.destination);
    
    this.usingWorklet = false;
    console.log('✅ ScriptProcessorNode initialized successfully');
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio processor not initialized');
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isRecording = true;

    if (this.usingWorklet && this.workletNode) {
      // Send start message to worklet
      this.workletNode.port.postMessage({ type: 'start' });
    }

    console.log(`🎤 Recording started using ${this.usingWorklet ? 'AudioWorklet' : 'ScriptProcessorNode'}`);
  }

  /**
   * Stop audio recording
   */
  stopRecording(): void {
    this.isRecording = false;

    if (this.usingWorklet && this.workletNode) {
      // Send stop message to worklet
      this.workletNode.port.postMessage({ type: 'stop' });
    }

    console.log('⏹️ Recording stopped');
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopRecording();

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.usingWorklet = false;
    console.log('🧹 Audio processor cleaned up');
  }

  /**
   * Get current audio processing method
   */
  getProcessingMethod(): 'AudioWorklet' | 'ScriptProcessorNode' | 'Not initialized' {
    if (!this.audioContext) return 'Not initialized';
    return this.usingWorklet ? 'AudioWorklet' : 'ScriptProcessorNode';
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get audio context sample rate
   */
  getSampleRate(): number | null {
    return this.audioContext?.sampleRate || null;
  }
}

/**
 * Factory function to create audio processor
 */
export function createAudioProcessor(config?: AudioProcessorConfig): SpectraAudioProcessor {
  return new SpectraAudioProcessor(config);
}

/**
 * Utility function to check browser audio support
 */
export function getBrowserAudioSupport() {
  return {
    getUserMedia: typeof navigator?.mediaDevices?.getUserMedia === 'function',
    audioContext: typeof AudioContext !== 'undefined',
    audioWorklet: SpectraAudioProcessor.isAudioWorkletSupported(),
    scriptProcessor: typeof AudioContext !== 'undefined' && 
                    typeof AudioContext.prototype.createScriptProcessor === 'function'
  };
}