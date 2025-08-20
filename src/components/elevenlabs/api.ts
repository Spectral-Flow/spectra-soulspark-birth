/**
 * ElevenLabs API Service
 * Handles authentication and signed URL generation for private agents
 * Supports both API key and username/password authentication
 */

interface SignedUrlResponse {
  signed_url: string;
}

interface ElevenLabsCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
}

export class ElevenLabsApiService {
  private apiKey?: string;
  private username?: string;
  private password?: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(credentials: string | ElevenLabsCredentials) {
    if (typeof credentials === 'string') {
      // Backward compatibility: if string provided, treat as API key
      this.apiKey = credentials;
    } else {
      // New credential object format
      this.apiKey = credentials.apiKey;
      this.username = credentials.username;
      this.password = credentials.password;
    }
  }

  /**
   * Get authentication headers based on available credentials
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.apiKey) {
      headers['xi-api-key'] = this.apiKey;
    }
    
    if (this.username && this.password) {
      // Basic authentication (base64 encoded username:password)
      const basicAuth = btoa(`${this.username}:${this.password}`);
      headers['Authorization'] = `Basic ${basicAuth}`;
    }
    
    return headers;
  }

  /**
   * Generate a signed URL for private agent conversations
   */
  async getSignedUrl(agentId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data: SignedUrlResponse = await response.json();
    return data.signed_url;
  }

  /**
   * Test authentication by making a simple API call
   */
  async testAuthentication(): Promise<{ success: boolean; method: string; message: string }> {
    try {
      // Try to fetch user info or voices to test authentication
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: this.getAuthHeaders(),
      });

      const authMethod = this.apiKey ? 'API Key' : 'Username/Password';
      
      if (response.ok) {
        return {
          success: true,
          method: authMethod,
          message: `Authentication successful using ${authMethod}`
        };
      } else {
        return {
          success: false,
          method: authMethod,
          message: `Authentication failed: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        method: this.apiKey ? 'API Key' : 'Username/Password',
        message: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

/**
 * Factory function to create ElevenLabs API service from environment or window variables
 */
export function createElevenLabsApiService(): ElevenLabsApiService | null {
  // Check for environment variables first
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  // Check for window variables (useful for testing)
// Safely read OpenRouter API key from window (browser) or fallback to environment (Node.js)
const windowApiKey = typeof window !== 'undefined' 
  ? (window as Record<string, unknown>).OPENROUTER_API_KEY as string | undefined
  : undefined;

const apiKey = windowApiKey || process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OpenRouter API key is not defined. Set it in window.OPENROUTER_API_KEY or environment variable OPENROUTER_API_KEY.");
}

// Now you can use `apiKey` in your fetch or API requests
  
  // Determine which credentials to use
  const finalApiKey = apiKey || windowApiKey;
  const hasCredentials = finalApiKey || (windowUsername && windowPassword);
  
  if (!hasCredentials) {
    console.warn('ElevenLabs credentials not found. Private agent features will be unavailable.');
    console.log('💡 Set API key: window.ELEVENLABS_API_KEY = "your_key"');
    console.log('💡 Or set username/password: window.ELEVENLABS_USERNAME = "user"; window.ELEVENLABS_PASSWORD = "pass"');
    return null;
  }

  // Create service with appropriate credentials
  if (finalApiKey) {
    console.log('🔑 Creating ElevenLabs service with API key authentication');
    return new ElevenLabsApiService(finalApiKey);
  } else {
    console.log('👤 Creating ElevenLabs service with username/password authentication');
    return new ElevenLabsApiService({
      username: windowUsername,
      password: windowPassword
    });
  }
}