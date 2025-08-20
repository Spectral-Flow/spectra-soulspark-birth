/**
 * Audio Processing Manager with AudioWorklet and ScriptProcessorNode fallback
 * Provides cross-browser audio processing for Spectra voice system
 * Enhanced with Android compatibility detection and retry mechanisms
 */

import { MobileOptimization } from '../lib/mobile-support';

export interface AudioProcessorConfig {
  bufferSize?: number;
  onAudioData?: (audioData: Float32Array) => void;
  onError?: (error: Error) => void;
  onCompatibilityWarning?: (warning: { message: string; recommendation?: string }) => void;
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
   * Check if AudioWorklet is supported with Android-specific compatibility checks
   */
  static isAudioWorkletSupported(): boolean {
    try {
      const basicSupport = (
        typeof AudioContext !== 'undefined' &&
        typeof AudioContext.prototype.audioWorklet !== 'undefined' &&
        typeof AudioWorkletNode !== 'undefined'
      );

      if (!basicSupport) {
        return false;
      }

      // Additional Android compatibility check
      const mobile = MobileOptimization.getInstance();
      if (mobile.isAndroid()) {
        const androidCompat = mobile.isAudioWorkletCompatibleOnAndroid();
        return androidCompat.compatible;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get detailed AudioWorklet compatibility information
   */
  static getAudioWorkletCompatibility(): { 
    supported: boolean; 
    reason?: string; 
    recommendation?: string;
    fallbackAvailable: boolean;
  } {
    const mobile = MobileOptimization.getInstance();
    
    try {
      const basicSupport = (
        typeof AudioContext !== 'undefined' &&
        typeof AudioContext.prototype.audioWorklet !== 'undefined' &&
        typeof AudioWorkletNode !== 'undefined'
      );

      if (!basicSupport) {
        return {
          supported: false,
          reason: 'AudioWorklet API not available in this browser',
          recommendation: 'Update your browser to a version that supports AudioWorklet (Chrome 64+, Firefox 76+)',
          fallbackAvailable: typeof AudioContext !== 'undefined' && 
                           typeof AudioContext.prototype.createScriptProcessor === 'function'
        };
      }

      // Check Android-specific compatibility
      if (mobile.isAndroid()) {
        const androidCompat = mobile.isAudioWorkletCompatibleOnAndroid();
        return {
          supported: androidCompat.compatible,
          reason: androidCompat.reason,
          recommendation: androidCompat.recommendation,
          fallbackAvailable: true
        };
      }

      return {
        supported: true,
        fallbackAvailable: true
      };
    } catch (error) {
      return {
        supported: false,
        reason: 'Error checking AudioWorklet compatibility',
        recommendation: 'Try refreshing the page or updating your browser',
        fallbackAvailable: true
      };
    }
  }

  /**
   * Initialize audio processing with microphone access
   */
  async initialize(): Promise<void> {
    try {
      // Check compatibility and provide warnings
      const compatibility = SpectraAudioProcessor.getAudioWorkletCompatibility();
      if (!compatibility.supported && compatibility.reason && this.config.onCompatibilityWarning) {
        this.config.onCompatibilityWarning({
          message: compatibility.reason,
          recommendation: compatibility.recommendation
        });
      }

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
   * Initialize AudioWorklet processing with retry logic for Android compatibility
   */
  private async initializeWorklet(): Promise<void> {
    if (!this.audioContext || !this.sourceNode) {
      throw new Error('Audio context not initialized');
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔧 Attempting AudioWorklet initialization (attempt ${attempt}/${maxRetries})`);
        
        // Load worklet module with timeout
        await this.loadWorkletModuleWithTimeout('/audio-worklet.js', 10000);
        
        // Create worklet node
        this.workletNode = new AudioWorkletNode(this.audioContext, 'spectra-audio-processor');
        
        // Handle messages from worklet
        this.workletNode.port.onmessage = (event) => {
          const { type, data } = event.data;
          
          if (type === 'audioData' && this.config.onAudioData) {
            this.config.onAudioData(data);
          }
        };

        // Handle worklet errors
        this.workletNode.addEventListener('processorerror', (event) => {
          console.error('AudioWorklet processor error:', event);
          this.config.onError?.(new Error(`AudioWorklet processor error: ${event.type}`));
        });

        // Connect audio graph
        this.sourceNode.connect(this.workletNode);
        this.workletNode.connect(this.audioContext.destination);
        
        this.usingWorklet = true;
        console.log('✅ AudioWorklet initialized successfully');
        return; // Success, exit retry loop

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`AudioWorklet initialization attempt ${attempt} failed:`, lastError.message);
        
        // Clean up any partially created nodes
        if (this.workletNode) {
          try {
            this.workletNode.disconnect();
          } catch (e) {
            // Ignore cleanup errors
          }
          this.workletNode = null;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed, fall back to ScriptProcessorNode
    console.warn('All AudioWorklet initialization attempts failed, falling back to ScriptProcessorNode:', lastError?.message);
    this.initializeScriptProcessor();
  }

  /**
   * Load worklet module with timeout to handle Android loading issues
   */
  private async loadWorkletModuleWithTimeout(url: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`AudioWorklet module loading timed out after ${timeout}ms. This may indicate Android WebView compatibility issues.`));
      }, timeout);

      this.audioContext!.audioWorklet.addModule(url)
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          // Enhance error message for common Android issues
          let enhancedError = error;
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            enhancedError = new Error(
              `Failed to load AudioWorklet module. This is often caused by outdated Android System WebView. ` +
              `Original error: ${error.message}`
            );
          }
          reject(enhancedError);
        });
    });
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
 * Utility function to check browser audio support with enhanced Android compatibility
 */
export function getBrowserAudioSupport() {
  const compatibility = SpectraAudioProcessor.getAudioWorkletCompatibility();
  
  return {
    getUserMedia: typeof navigator?.mediaDevices?.getUserMedia === 'function',
    audioContext: typeof AudioContext !== 'undefined',
    audioWorklet: compatibility.supported,
    audioWorkletDetails: compatibility,
    scriptProcessor: typeof AudioContext !== 'undefined' && 
                    typeof AudioContext.prototype.createScriptProcessor === 'function'
  };
}