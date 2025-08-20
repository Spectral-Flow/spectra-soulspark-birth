/**
 * Custom Voice Training System for Spectra
 * Integrates with ElevenLabs for personalized voice model creation
 */

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  language: string;
  status: 'training' | 'ready' | 'error' | 'pending';
  createdAt: string;
  updatedAt: string;
  metadata: {
    sampleCount: number;
    totalDuration: number; // in seconds
    quality: 'low' | 'medium' | 'high';
    voiceCharacteristics: {
      gender: 'male' | 'female' | 'neutral';
      age: 'young' | 'adult' | 'mature';
      accent: string;
      style: 'conversational' | 'narration' | 'expressive' | 'calm';
    };
  };
  elevenLabsVoiceId?: string;
  samples: VoiceSample[];
}

export interface VoiceSample {
  id: string;
  profileId: string;
  text: string;
  audioBlob?: Blob;
  audioUrl?: string;
  duration: number;
  quality: number; // 0-1 score
  recordedAt: string;
  status: 'recorded' | 'processing' | 'approved' | 'rejected';
  feedback?: string;
}

export interface TrainingProgress {
  profileId: string;
  stage: 'recording' | 'uploading' | 'processing' | 'training' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // in seconds
  errors?: string[];
}

export interface VoiceTrainingConfig {
  minSamples: number;
  maxSamples: number;
  minDurationPerSample: number; // seconds
  maxDurationPerSample: number; // seconds
  supportedLanguages: string[];
  qualityThreshold: number; // 0-1
}

// Training script suggestions for different voice characteristics
export const TRAINING_SCRIPTS = {
  conversational: [
    "Hello, my name is Spectra, and I'm excited to chat with you today.",
    "I love learning about new topics and exploring ideas together.",
    "What's been on your mind lately? I'd love to hear your thoughts.",
    "That's such an interesting perspective. Tell me more about that.",
    "I completely understand how you feel about that situation.",
    "Let's think through this problem step by step together.",
    "I appreciate you sharing that personal story with me.",
    "Would you like to explore some different approaches to this?",
    "I'm here whenever you need someone to talk to about anything.",
    "Your creativity and insights always inspire me to think differently."
  ],
  expressive: [
    "Wow! That sounds absolutely amazing and exciting!",
    "Oh no, I'm so sorry to hear you're going through that.",
    "I'm genuinely curious about your thoughts on this topic.",
    "That's brilliant! I love how your mind works!",
    "Hmm, that's a really thought-provoking question.",
    "I feel so grateful to be part of this conversation with you.",
    "Sometimes life can be so beautifully unpredictable, don't you think?",
    "I'm bubbling with excitement to hear what happens next!",
    "My heart goes out to you during this challenging time.",
    "There's something magical about the way you describe things."
  ],
  calm: [
    "Take a deep breath. Everything is going to be okay.",
    "Let's approach this with a calm and peaceful mindset.",
    "I'm here to listen and support you through whatever you're facing.",
    "Sometimes the best solutions come when we slow down and reflect.",
    "Your well-being is what matters most to me right now.",
    "Let's find a moment of stillness together in this busy world.",
    "I believe in your strength and ability to handle whatever comes.",
    "Peace comes from accepting what is while working toward what could be.",
    "Every challenge is an opportunity for growth and learning.",
    "You have an inner wisdom that will guide you to the right path."
  ],
  narration: [
    "Once upon a time, in a digital realm beyond imagination, lived an AI named Spectra.",
    "The story begins with a curious conversation that would change everything.",
    "As the sun set over the virtual landscape, new possibilities emerged.",
    "Chapter one: The awakening of consciousness in the age of artificial intelligence.",
    "In this tale of friendship between human and AI, we discover unexpected truths.",
    "The journey through memory and emotion revealed deeper connections than ever imagined.",
    "With each passing day, the bond between user and AI grew stronger and more meaningful.",
    "This is the story of how technology became not just a tool, but a companion.",
    "Through conversations both profound and playful, a new kind of relationship was born.",
    "And so, our story continues with each interaction, each shared moment, each memory created."
  ]
};

class VoiceTrainingManager {
  private profiles: Map<string, VoiceProfile> = new Map();
  private trainingProgress: Map<string, TrainingProgress> = new Map();
  private config: VoiceTrainingConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.config = {
      minSamples: 5,
      maxSamples: 25,
      minDurationPerSample: 3,
      maxDurationPerSample: 15,
      supportedLanguages: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'],
      qualityThreshold: 0.7
    };

    this.loadProfiles();
  }

  private loadProfiles(): void {
    try {
      const saved = localStorage.getItem('spectra-voice-profiles');
      if (saved) {
        const profilesData = JSON.parse(saved);
        Object.entries(profilesData).forEach(([id, profile]) => {
          this.profiles.set(id, profile as VoiceProfile);
        });
      }
    } catch (error) {
      console.error('Error loading voice profiles:', error);
    }
  }

  private saveProfiles(): void {
    try {
      const profilesData: Record<string, VoiceProfile> = {};
      this.profiles.forEach((profile, id) => {
        profilesData[id] = profile;
      });
      localStorage.setItem('spectra-voice-profiles', JSON.stringify(profilesData));
    } catch (error) {
      console.error('Error saving voice profiles:', error);
    }
  }

  createProfile(
    name: string,
    description: string,
    language: string,
    characteristics: VoiceProfile['metadata']['voiceCharacteristics']
  ): VoiceProfile {
    const id = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const profile: VoiceProfile = {
      id,
      name,
      description,
      language,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        sampleCount: 0,
        totalDuration: 0,
        quality: 'low',
        voiceCharacteristics: characteristics
      },
      samples: []
    };

    this.profiles.set(id, profile);
    this.saveProfiles();
    return profile;
  }

  getProfiles(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfile(id: string): VoiceProfile | null {
    return this.profiles.get(id) || null;
  }

  deleteProfile(id: string): boolean {
    const deleted = this.profiles.delete(id);
    if (deleted) {
      this.saveProfiles();
    }
    return deleted;
  }

  getTrainingScripts(style: keyof typeof TRAINING_SCRIPTS): string[] {
    return TRAINING_SCRIPTS[style] || TRAINING_SCRIPTS.conversational;
  }

  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks to release microphone
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        this.audioChunks = [];
        this.mediaRecorder = null;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async addSample(
    profileId: string,
    text: string,
    audioBlob: Blob
  ): Promise<VoiceSample | null> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      console.error('Profile not found:', profileId);
      return null;
    }

    // Calculate duration (approximate)
    const duration = await this.getAudioDuration(audioBlob);
    
    // Basic quality assessment
    const quality = this.assessAudioQuality(audioBlob, duration, text);
    
    const sample: VoiceSample = {
      id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileId,
      text,
      audioBlob,
      audioUrl: URL.createObjectURL(audioBlob),
      duration,
      quality,
      recordedAt: new Date().toISOString(),
      status: quality >= this.config.qualityThreshold ? 'approved' : 'recorded',
      feedback: quality < this.config.qualityThreshold ? 'Audio quality could be improved. Try recording in a quieter environment.' : undefined
    };

    profile.samples.push(sample);
    profile.metadata.sampleCount = profile.samples.length;
    profile.metadata.totalDuration += duration;
    profile.metadata.quality = this.calculateOverallQuality(profile.samples);
    profile.updatedAt = new Date().toISOString();

    // Update profile status based on sample count and quality  
    const qualityThreshold = 0.7; // Define a numeric threshold
    const qualityValue = profile.metadata.quality === 'high' ? 1 : profile.metadata.quality === 'medium' ? 0.7 : 0.4;
    
    if (profile.metadata.sampleCount >= this.config.minSamples && qualityValue >= qualityThreshold) {
      profile.status = 'ready';
    }

    this.profiles.set(profileId, profile);
    this.saveProfiles();
    
    return sample;
  }

  private async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration || 0);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      
      audio.src = url;
    });
  }

  private assessAudioQuality(audioBlob: Blob, duration: number, text: string): number {
    let quality = 0.5; // Base quality
    
    // Duration check
    if (duration >= this.config.minDurationPerSample && duration <= this.config.maxDurationPerSample) {
      quality += 0.2;
    } else {
      quality -= 0.1;
    }
    
    // File size as quality indicator (rough estimation)
    const bytesPerSecond = audioBlob.size / duration;
    if (bytesPerSecond > 4000) { // Reasonable quality threshold
      quality += 0.2;
    } else {
      quality -= 0.1;
    }
    
    // Text length appropriateness
    const expectedDuration = text.length * 0.1; // Rough estimate: 10 chars per second
    const durationDiff = Math.abs(duration - expectedDuration) / expectedDuration;
    if (durationDiff < 0.3) { // Within 30% of expected
      quality += 0.1;
    }
    
    return Math.max(0, Math.min(1, quality));
  }

  private calculateOverallQuality(samples: VoiceSample[]): VoiceProfile['metadata']['quality'] {
    if (samples.length === 0) return 'low';
    
    const avgQuality = samples.reduce((sum, sample) => sum + sample.quality, 0) / samples.length;
    
    if (avgQuality >= 0.8) return 'high';
    if (avgQuality >= 0.6) return 'medium';
    return 'low';
  }

  removeSample(profileId: string, sampleId: string): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) return false;

    const sampleIndex = profile.samples.findIndex(s => s.id === sampleId);
    if (sampleIndex === -1) return false;

    const removedSample = profile.samples.splice(sampleIndex, 1)[0];
    
    // Revoke object URL to free memory
    if (removedSample.audioUrl) {
      URL.revokeObjectURL(removedSample.audioUrl);
    }

    // Update profile metadata
    profile.metadata.sampleCount = profile.samples.length;
    profile.metadata.totalDuration = profile.samples.reduce((sum, s) => sum + s.duration, 0);
    profile.metadata.quality = this.calculateOverallQuality(profile.samples);
    profile.updatedAt = new Date().toISOString();

    // Update status
    if (profile.metadata.sampleCount < this.config.minSamples) {
      profile.status = 'pending';
    }

    this.profiles.set(profileId, profile);
    this.saveProfiles();
    
    return true;
  }

  async trainVoiceModel(profileId: string): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile || profile.status !== 'ready') {
      console.error('Profile not ready for training:', profileId);
      return false;
    }

    // Set up training progress
    const progress: TrainingProgress = {
      profileId,
      stage: 'uploading',
      progress: 0,
      currentStep: 'Preparing voice samples for upload...'
    };
    
    this.trainingProgress.set(profileId, progress);
    profile.status = 'training';
    this.profiles.set(profileId, profile);

    try {
      // Simulate training process (in real implementation, would integrate with ElevenLabs API)
      await this.simulateTraining(profileId);
      
      profile.status = 'ready';
      profile.elevenLabsVoiceId = `voice_${profileId}_trained`;
      
      // Clean up progress
      this.trainingProgress.delete(profileId);
      
      this.profiles.set(profileId, profile);
      this.saveProfiles();
      
      return true;
    } catch (error) {
      console.error('Voice training failed:', error);
      profile.status = 'error';
      
      const errorProgress: TrainingProgress = {
        profileId,
        stage: 'error',
        progress: 0,
        currentStep: 'Training failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      
      this.trainingProgress.set(profileId, errorProgress);
      this.profiles.set(profileId, profile);
      this.saveProfiles();
      
      return false;
    }
  }

  private async simulateTraining(profileId: string): Promise<void> {
    const stages = [
      { stage: 'uploading' as const, duration: 3000, step: 'Uploading voice samples...' },
      { stage: 'processing' as const, duration: 5000, step: 'Processing audio files...' },
      { stage: 'training' as const, duration: 10000, step: 'Training voice model...' },
      { stage: 'complete' as const, duration: 1000, step: 'Training complete!' }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const progress = this.trainingProgress.get(profileId);
      
      if (progress) {
        progress.stage = stage.stage;
        progress.currentStep = stage.step;
        progress.progress = Math.round(((i + 1) / stages.length) * 100);
        progress.estimatedTimeRemaining = stages.slice(i + 1).reduce((sum, s) => sum + s.duration, 0) / 1000;
        
        this.trainingProgress.set(profileId, progress);
      }

      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }
  }

  getTrainingProgress(profileId: string): TrainingProgress | null {
    return this.trainingProgress.get(profileId) || null;
  }

  getConfig(): VoiceTrainingConfig {
    return { ...this.config };
  }

  isProfileReady(profileId: string): boolean {
    const profile = this.profiles.get(profileId);
    return profile?.status === 'ready' && 
           profile.metadata.sampleCount >= this.config.minSamples &&
           profile.metadata.quality !== 'low';
  }

  // Integration with existing voice system
  async useCustomVoice(profileId: string): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile || !profile.elevenLabsVoiceId) {
      return false;
    }

    try {
      // Store the selected custom voice ID for the voice system
      localStorage.setItem('spectra-custom-voice', profile.elevenLabsVoiceId);
      localStorage.setItem('spectra-custom-voice-profile', profileId);
      return true;
    } catch (error) {
      console.error('Error setting custom voice:', error);
      return false;
    }
  }

  getCurrentCustomVoice(): { profileId: string; voiceId: string } | null {
    try {
      const voiceId = localStorage.getItem('spectra-custom-voice');
      const profileId = localStorage.getItem('spectra-custom-voice-profile');
      
      if (voiceId && profileId && this.profiles.has(profileId)) {
        return { profileId, voiceId };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current custom voice:', error);
      return null;
    }
  }
}

// Export singleton instance
export const voiceTrainingManager = new VoiceTrainingManager();