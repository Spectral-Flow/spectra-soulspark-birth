/**
 * AudioWorklet module for real-time audio processing
 * Provides low-latency audio processing for Spectra voice system
 */

class SpectraAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'start':
          this.isRecording = true;
          break;
        case 'stop':
          this.isRecording = false;
          break;
        case 'configure':
          if (data.bufferSize) {
            this.bufferSize = data.bufferSize;
            this.buffer = new Float32Array(this.bufferSize);
            this.bufferIndex = 0;
          }
          break;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      if (this.isRecording && inputChannel) {
        // Process input audio
        for (let i = 0; i < inputChannel.length; i++) {
          this.buffer[this.bufferIndex] = inputChannel[i];
          this.bufferIndex++;
          
          // Send buffer when full
          if (this.bufferIndex >= this.bufferSize) {
            this.port.postMessage({
              type: 'audioData',
              data: this.buffer.slice(0, this.bufferIndex)
            });
            this.bufferIndex = 0;
          }
        }
        
        // Pass-through audio (for monitoring)
        if (output && output.length > 0) {
          const outputChannel = output[0];
          for (let i = 0; i < inputChannel.length; i++) {
            outputChannel[i] = inputChannel[i];
          }
        }
      }
    }

    // Keep processor alive
    return true;
  }
}

registerProcessor('spectra-audio-processor', SpectraAudioProcessor);