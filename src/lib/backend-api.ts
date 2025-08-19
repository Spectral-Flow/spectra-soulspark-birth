/**
 * Backend API Client
 * Utility for making requests to the backend API routes
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class BackendApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = '') {
    // In production, this will be the deployed domain
    // In development, it will use the current origin
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          message: errorData.message,
        };
      }

      // Handle audio responses
      if (response.headers.get('content-type')?.includes('audio/')) {
        const audioBlob = await response.blob();
        return { data: audioBlob as T };
      }

      // Handle JSON responses
      const data = await response.json();
      return { data };

    } catch (error) {
      return {
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async health() {
    return this.makeRequest('/health');
  }

  // Authentication
  async register(username: string, email?: string) {
    return this.makeRequest('/auth/user', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', username, email }),
    });
  }

  async login(username: string) {
    return this.makeRequest('/auth/user', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username }),
    });
  }

  async verifyToken(token: string) {
    return this.makeRequest('/auth/user', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', token }),
    });
  }

  // ElevenLabs API
  async elevenLabsTTS(text: string, voiceId?: string, options?: any) {
    return this.makeRequest('/elevenlabs/tts', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId, options }),
    });
  }

  async elevenLabsVoices() {
    return this.makeRequest('/elevenlabs/voices');
  }

  async elevenLabsSignedUrl(agentId: string) {
    return this.makeRequest('/elevenlabs/signed-url', {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  }

  // OpenAI API
  async openAITTS(text: string, voice?: string, model?: string) {
    return this.makeRequest('/openai/tts', {
      method: 'POST',
      body: JSON.stringify({ text, voice, model }),
    });
  }

  async openAIChat(messages: any[], options?: any) {
    return this.makeRequest('/openai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, ...options }),
    });
  }

  // Session Management
  async createSession(userId?: string, metadata?: any) {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, metadata }),
    });
  }

  async getSession(sessionId: string) {
    return this.makeRequest(`/sessions?sessionId=${sessionId}`);
  }

  async updateSession(sessionId: string, data: any) {
    return this.makeRequest(`/sessions?sessionId=${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(sessionId: string) {
    return this.makeRequest(`/sessions?sessionId=${sessionId}`, {
      method: 'DELETE',
    });
  }

  async listSessions() {
    return this.makeRequest('/sessions');
  }
}

// Default instance
export const backendApi = new BackendApiClient();

// Check if backend is available
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await backendApi.health();
    return !response.error;
  } catch {
    return false;
  }
}