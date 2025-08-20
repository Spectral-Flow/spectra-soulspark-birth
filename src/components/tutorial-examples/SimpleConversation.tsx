'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

interface SimpleConversationProps {
  agentId?: string;
}

export function SimpleConversation({ agentId: _agentId = '' }: SimpleConversationProps) {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Note: Direct agent ID usage requires a conversation token from your backend
      // For this example, we'll show the structure but recommend using signed URLs
      console.warn('Note: This example shows the tutorial structure. For actual implementation, consider using signed URLs for private agents.');
      
      // This would require a conversation token from your backend:
      // await conversation.startSession({
      //   agentId: agentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID',
      //   userId: 'YOUR_CUSTOMER_USER_ID'
      // });
      
      alert('This is a tutorial example. Please configure your agent ID and use the Signed URL example for a working implementation.');

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, []);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4">
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
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}