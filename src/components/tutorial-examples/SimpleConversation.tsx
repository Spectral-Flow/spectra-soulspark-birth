import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

interface SimpleConversationProps {
  agentId?: string;
}

export function SimpleConversation({ agentId = '' }: SimpleConversationProps) {
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // NOTE: Direct agent ID usage requires conversation tokens in @elevenlabs/react v0.5.0
      // This tutorial example demonstrates the API structure but may not work without tokens
      // For production use, please use the SignedUrl version with private agents
      await conversation.startSession({
        agentId: agentId || 'YOUR_AGENT_ID', // Replace with your agent ID
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setError(errorMessage);
    }
  }, [conversation, agentId]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setError(null);
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-700 max-w-md text-center">
          <strong>Error:</strong> {error}
          <br />
          <span className="text-xs mt-1 block">
            Note: Direct agent ID usage may require conversation tokens. Try the SignedUrl example instead.
          </span>
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
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