/**
 * Text-to-Speech Module for Spectra
 * Handles voice output with Spectra's personality configuration
 */

interface TTSConfig {
  apiKey?: string;
  voice?: string;
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
  pitch?: number;
  useOpenAI?: boolean;
  useElevenLabs?: boolean;
}

interface SpectraVoicePersonality {
  // Spectra's voice characteristics
  rate: number;        // Speaking rate (0.1 to 10)
  pitch: number;       // Voice pitch (0 to 2)
  volume: number;      // Volume level (0 to 1)
  voice: string;       // Preferred voice name
  emotion: string;     // Current emotional state
}

export class TextToSpeechEngine {
  private config: TTSConfig;
  private speechSynth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voiceEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private personality: SpectraVoicePersonality;

  constructor(config: TTSConfig = {}) {
    this.config = {
      voice: 'alloy', // OpenAI's female voice
      model: 'tts-1',
      speed: 1.0,
      pitch: 1.1,
      useOpenAI: false, // Start with Web Speech API
      useElevenLabs: false,
      ...config
    };

    this.speechSynth = window.speechSynthesis;
    
    // Spectra's voice personality - feminine, warm, graceful
    this.personality = {
      rate: 0.9,        // Slightly slower, more graceful
      pitch: 1.2,       // Higher pitch for feminine quality
      volume: 0.8,      // Gentle volume
      voice: 'female',  // Preference for female voices
      emotion: 'calm'   // Default emotional state
    };

    this.initializeVoices();
  }

  private initializeVoices(): void {
    const loadVoices = () => {
      this.voices = this.speechSynth.getVoices();
      this.selectSpectraVoice();
    };

    // Load voices when available
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  private selectSpectraVoice(): void {
    if (this.voices.length === 0) return;

    // Look for feminine, warm voices that match Spectra's personality
    const preferredVoices = [
      'Google UK English Female',
      'Microsoft Zira - English (United States)',
      'Samantha',
      'Karen',
      'Moira',
      'Tessa',
      'Microsoft Hazel - English (Great Britain)',
      'Google US English Female'
    ];

    // Try to find preferred voices
    for (const preferredName of preferredVoices) {
      const voice = this.voices.find(v => 
        v.name.toLowerCase().includes(preferredName.toLowerCase())
      );
      if (voice) {
        this.selectedVoice = voice;
        console.log(`✨ Selected Spectra voice: ${voice.name}`);
        return;
      }
    }

    // Fallback: look for any female voice
    const femaleVoice = this.voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.voiceURI.toLowerCase().includes('female')
    );

    if (femaleVoice) {
      this.selectedVoice = femaleVoice;
      console.log(`✨ Selected fallback female voice: ${femaleVoice.name}`);
      return;
    }

    // Last resort: use first available voice
    this.selectedVoice = this.voices[0];
    console.log(`✨ Selected default voice: ${this.voices[0].name}`);
  }

  async speak(text: string, emotion?: string): Promise<void> {
    if (!this.voiceEnabled || !text.trim()) return;

    try {
      if (this.config.useOpenAI && this.config.apiKey) {
        await this.speakWithOpenAI(text);
      } else if (this.config.useElevenLabs && this.config.apiKey) {
        await this.speakWithElevenLabs(text);
      } else {
        await this.speakWithWebSpeech(text, emotion);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Fallback to Web Speech API
      await this.speakWithWebSpeech(text, emotion);
    }
  }

  private async speakWithWebSpeech(text: string, emotion?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.selectedVoice) {
        reject(new Error('No voice available'));
        return;
      }

      // Cancel any current speech
      this.speechSynth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.selectedVoice;
      
      // Apply Spectra's personality
      utterance.rate = this.getEmotionalRate(emotion);
      utterance.pitch = this.getEmotionalPitch(emotion);
      utterance.volume = this.personality.volume;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.speechSynth.speak(utterance);
    });
  }

  private async speakWithOpenAI(text: string): Promise<void> {
    // TODO: Implement OpenAI TTS API integration
    console.log('OpenAI TTS not yet implemented, falling back to Web Speech');
    await this.speakWithWebSpeech(text);
  }

  private async speakWithElevenLabs(text: string): Promise<void> {
    // TODO: Implement ElevenLabs API integration for high-quality voice
    console.log('ElevenLabs TTS not yet implemented, falling back to Web Speech');
    await this.speakWithWebSpeech(text);
  }

  private getEmotionalRate(emotion?: string): number {
    const baseRate = this.personality.rate;
    
    switch (emotion) {
      case 'excited':
      case 'joyful':
        return Math.min(baseRate * 1.2, 2.0);
      case 'contemplative':
      case 'wise':
        return Math.max(baseRate * 0.8, 0.5);
      case 'loving':
      case 'calm':
        return baseRate * 0.9;
      case 'playful':
        return baseRate * 1.1;
      default:
        return baseRate;
    }
  }

  private getEmotionalPitch(emotion?: string): number {
    const basePitch = this.personality.pitch;
    
    switch (emotion) {
      case 'excited':
      case 'joyful':
      case 'playful':
        return Math.min(basePitch * 1.1, 2.0);
      case 'contemplative':
      case 'wise':
        return Math.max(basePitch * 0.9, 0.5);
      case 'loving':
        return basePitch * 1.05;
      case 'calm':
        return basePitch * 0.95;
      default:
        return basePitch;
    }
  }

  stop(): void {
    this.speechSynth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.speechSynth.speaking || this.currentUtterance !== null;
  }

  setEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  updatePersonality(personality: Partial<SpectraVoicePersonality>): void {
    this.personality = { ...this.personality, ...personality };
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.selectedVoice = voice;
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Factory function for easy initialization
export function createTextToSpeech(config?: TTSConfig): TextToSpeechEngine {
  return new TextToSpeechEngine(config);
}