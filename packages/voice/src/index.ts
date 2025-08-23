// Mock ElevenLabs integration for Elysia demo
export interface VoiceConfig {
  apiKey?: string
  voiceId?: string
  model?: string
}

export class ElysiaVoiceService {
  private config: VoiceConfig
  private isEnabled: boolean = false

  constructor(config: VoiceConfig = {}) {
    this.config = config
  }

  async initialize(): Promise<boolean> {
    // Mock initialization - in real implementation this would connect to ElevenLabs
    console.log('Elysia Voice Service: Initializing...')
    
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.isEnabled = true
    console.log('Elysia Voice Service: Ready')
    return true
  }

  async speak(text: string): Promise<void> {
    if (!this.isEnabled) {
      console.warn('Voice service not enabled')
      return
    }

    console.log('Elysia Voice: Speaking -', text)
    
    // In demo mode, use Web Speech API as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      // Try to use a pleasant voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google US English')
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  async startListening(): Promise<void> {
    if (!this.isEnabled) {
      console.warn('Voice service not enabled')
      return
    }

    console.log('Elysia Voice: Starting to listen...')
    
    // Mock voice recognition - in real implementation this would use ElevenLabs
    // For demo purposes, we'll just log that listening started
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Elysia Voice: Listening active')
        resolve()
      }, 200)
    })
  }

  stopListening(): void {
    console.log('Elysia Voice: Stopped listening')
  }

  isReady(): boolean {
    return this.isEnabled
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      provider: 'ElevenLabs (Mock)',
      capabilities: ['text-to-speech', 'speech-to-text'],
      demo: true
    }
  }
}

// Export singleton instance
export const elysiaVoice = new ElysiaVoiceService()