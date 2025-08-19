/**
 * ElevenLabs API Service
 * Handles authentication and signed URL generation for private agents
 */

interface SignedUrlResponse {
  signed_url: string;
}

export class ElevenLabsApiService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a signed URL for private agent conversations
   */
  async getSignedUrl(agentId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data: SignedUrlResponse = await response.json();
    return data.signed_url;
  }
}

/**
 * Factory function to create ElevenLabs API service from environment
 */
export function createElevenLabsApiService(): ElevenLabsApiService | null {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn('VITE_ELEVENLABS_API_KEY not found. Private agent features will be unavailable.');
    return null;
  }

  return new ElevenLabsApiService(apiKey);
}