import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

interface SignedUrlConversationProps {
  agentId?: string;
}

export function SignedUrlConversation({ agentId = '' }: SignedUrlConversationProps) {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsConnecting(false);
    },
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection error';
      setError(errorMessage);
      setIsConnecting(false);
    },
  });

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/elevenlabs/signed-url", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        agentId: agentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Failed to get signed url: ${errorData.error || response.statusText}`);
    }
    
    const { signed_url } = await response.json();
    return signed_url;
  };

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const signedUrl = await getSignedUrl();

      // Start the conversation with your signed url
      await conversation.startSession({
        signedUrl,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setError(errorMessage);
      setIsConnecting(false);
    }
  }, [conversation, agentId]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setError(null);
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop conversation';
      setError(errorMessage);
    }
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-700 max-w-md text-center">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 flex items-center gap-2"
        >
          {isConnecting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isConnecting ? 'Connecting...' : 'Start Conversation'}
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        {conversation.status === 'connected' && (
          <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
        )}
      </div>
    </div>
  );
}