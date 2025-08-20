'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

interface SignedUrlConversationProps {
  agentId?: string;
}

export function SignedUrlConversation({ agentId = '' }: SignedUrlConversationProps) {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const response = await fetch("/api/elevenlabs/signed-url", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId: agentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    
    const { signed_url } = await response.json();
    return signed_url;
  }, [agentId]);

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const signedUrl = await getSignedUrl();

      // Start the conversation with your signed url
      await conversation.startSession({
        signedUrl,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, getSignedUrl]);

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