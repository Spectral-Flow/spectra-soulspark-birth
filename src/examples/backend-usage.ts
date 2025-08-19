/**
 * Example: Using the Enhanced Voice Bridge with Backend Support
 * This demonstrates how the frontend automatically uses backend APIs when available
 */

import { enhancedVoiceBridge } from '@/voice/enhanced-voice-bridge';
import { backendApi } from '@/lib/backend-api';
import { useCallback, useEffect, useState } from 'react';

// Example 1: Simple TTS with automatic service selection
async function speakText(text: string) {
  try {
    const response = await enhancedVoiceBridge.textToSpeech({
      text,
      voice: 'nova', // OpenAI voice name
      voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs voice ID
    });

    if (response.audio) {
      // Play the audio
      const audioBlob = response.audio as Blob;
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      
      console.log(`TTS completed using: ${response.service}`);
    } else {
      console.error('TTS failed:', response.error);
    }
  } catch (error) {
    console.error('Speech synthesis error:', error);
  }
}

// Example 2: Chat with AI using backend proxy
async function chatWithAI(message: string) {
  try {
    const messages = [
      { role: 'system', content: 'You are Spectra, an AI companion.' },
      { role: 'user', content: message }
    ];

    const response = await enhancedVoiceBridge.chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = response.choices?.[0]?.message?.content;
    
    if (aiResponse) {
      console.log('AI Response:', aiResponse);
      
      // Speak the response
      await speakText(aiResponse);
    }

    return aiResponse;
  } catch (error) {
    console.error('Chat error:', error);
    return 'Sorry, I encountered an error.';
  }
}

// Example 3: User session management
async function createUserSession() {
  try {
    // Register or login user
    const userResponse = await backendApi.register('demo-user', 'demo@example.com');
    
    if (userResponse.data && !userResponse.error) {
      const { user, token } = userResponse.data;
      
      // Set auth token for future requests
      backendApi.setAuthToken(token);
      
      // Create a conversation session
      const sessionResponse = await backendApi.createSession(user.id, {
        voiceService: 'elevenlabs',
        mood: 'friendly',
        topics: ['ai', 'consciousness'],
      });

      if (sessionResponse.data) {
        console.log('Session created:', sessionResponse.data.id);
        return sessionResponse.data;
      }
    }
  } catch (error) {
    console.error('Session creation error:', error);
  }
}

// Example 4: Persistent conversation
async function continuePersistentConversation(sessionId: string, message: string) {
  try {
    // Get existing session
    const sessionResponse = await backendApi.getSession(sessionId);
    
    if (sessionResponse.data) {
      const session = sessionResponse.data;
      
      // Add user message
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });

      // Get AI response
      const aiResponse = await chatWithAI(message);
      
      if (aiResponse) {
        // Add AI response
        session.messages.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        });

        // Update session in backend
        await backendApi.updateSession(sessionId, {
          messages: session.messages,
          metadata: {
            ...session.metadata,
            lastInteraction: new Date().toISOString(),
          },
        });

        console.log('Conversation updated in session:', sessionId);
      }

      return aiResponse;
    }
  } catch (error) {
    console.error('Persistent conversation error:', error);
  }
}

// Example 5: Check service status and capabilities
async function checkServiceStatus() {
  const status = await enhancedVoiceBridge.getServiceStatus();
  
  console.log('Voice Bridge Status:', {
    backendAvailable: status.backendAvailable,
    services: status.services,
    config: status.config,
  });

  // Also check backend health
  const health = await backendApi.health();
  console.log('Backend Health:', health.data);

  return status;
}

// Example usage in a React component:
export function useSpectraVoice() {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    // Initialize and check backend availability
    checkServiceStatus().then(status => {
      setIsBackendAvailable(status.backendAvailable);
    });

    // Create user session if backend is available
    if (isBackendAvailable) {
      createUserSession().then(session => {
        if (session) {
          setCurrentSession(session.id);
        }
      });
    }
  }, [isBackendAvailable]);

  const speak = useCallback(async (text: string) => {
    return await speakText(text);
  }, []);

  const chat = useCallback(async (message: string) => {
    if (currentSession) {
      return await continuePersistentConversation(currentSession, message);
    } else {
      return await chatWithAI(message);
    }
  }, [currentSession]);

  return {
    speak,
    chat,
    isBackendAvailable,
    currentSession,
  };
}

// Export for use in components
export {
  speakText,
  chatWithAI,
  createUserSession,
  continuePersistentConversation,
  checkServiceStatus,
};