/**
 * ElevenLabs Conversational AI Integration for Spectra
 * Implements real-time voice conversations using ElevenLabs API
 */

// Import types for the Conversation from @elevenlabs/client
export interface ConversationEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onModeChange?: (mode: { mode: 'speaking' | 'listening' }) => void;
}

export interface ConversationConfig {
  agentId?: string;
  signedUrl?: string;
}

export interface ConversationSession {
  endSession(): Promise<void>;
}

/**
 * ElevenLabs Conversation wrapper
 * This provides a type-safe interface for the ElevenLabs client
 */
export class ElevenLabsConversation {
  private conversationModule: any = null;
  private currentSession: ConversationSession | null = null;

  constructor() {
    this.initializeElevenLabsClient();
  }

  private async initializeElevenLabsClient() {
    try {
      // Dynamic import to handle potential missing dependency gracefully
      const { Conversation } = await import('@elevenlabs/client');
      this.conversationModule = Conversation;
      console.log('✨ ElevenLabs Conversation client initialized');
    } catch (error) {
      console.warn('ElevenLabs client not available:', error);
      console.log('💡 Install @elevenlabs/client to enable conversational AI features');
    }
  }

  async startSession(config: ConversationConfig & ConversationEvents): Promise<ConversationSession | null> {
    if (!this.conversationModule) {
      throw new Error('ElevenLabs client not available. Please install @elevenlabs/client package.');
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation session
      const session = await this.conversationModule.startSession({
        agentId: config.agentId,
        signedUrl: config.signedUrl,
        onConnect: config.onConnect,
        onDisconnect: config.onDisconnect,
        onError: config.onError,
        onModeChange: config.onModeChange,
      });

      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (this.currentSession) {
      await this.currentSession.endSession();
      this.currentSession = null;
    }
  }

  isAvailable(): boolean {
    return this.conversationModule !== null;
  }

  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }
}

// Factory function for easy initialization
export function createElevenLabsConversation(): ElevenLabsConversation {
  return new ElevenLabsConversation();
}

// Helper function to get signed URL for private agents
export async function getSignedUrl(apiEndpoint: string = 'http://localhost:3001/api/get-signed-url'): Promise<string> {
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}