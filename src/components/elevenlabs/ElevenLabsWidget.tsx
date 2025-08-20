import React from 'react';
import { useConversation } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: string;
  content: string;
  mood?: string;
}

interface ElevenLabsWidgetProps {
  messages: Message[];
  mood: string;
  streaming?: boolean;
  agentId?: string;
  className?: string;
}

export function ElevenLabsWidget({ 
  messages, 
  mood, 
  streaming = true, 
  agentId,
  className 
}: ElevenLabsWidgetProps) {
  const conversation = useConversation({
    onConnect: () => {
      console.log('🎭 ElevenLabs connected');
    },
    onDisconnect: () => {
      console.log('🎭 ElevenLabs disconnected');
    },
    onMessage: (message) => {
      console.log('🎭 ElevenLabs message:', message);
    },
    onError: (error) => {
      console.error('🎭 ElevenLabs error:', error);
    },
  });

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  const handleToggleConnection = async () => {
    if (isConnected) {
      await conversation.endSession();
    } else {
      // For now, we'll need the agent ID to connect
      if (!agentId) {
        console.warn('No agent ID provided for ElevenLabs connection');
        return;
      }
      
      try {
        await conversation.startSession({
          agentId: agentId,
          connectionType: 'websocket' as any, // Type will be properly inferred
        });
      } catch (error) {
        console.error('Failed to start ElevenLabs session:', error);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Connection toggle */}
      <Button
        variant={isConnected ? "default" : "outline"}
        size="icon"
        onClick={handleToggleConnection}
        disabled={conversation.status === 'connecting'}
        className={cn(
          "transition-all duration-300",
          isConnected && "bg-green-600 hover:bg-green-700"
        )}
        title={isConnected ? "Disconnect ElevenLabs" : "Connect ElevenLabs"}
      >
        {isConnected ? (
          <PhoneOff className="w-4 h-4" />
        ) : (
          <Phone className="w-4 h-4" />
        )}
      </Button>

      {/* Speaking indicator */}
      {isConnected && (
        <div className={cn(
          "flex items-center gap-1 text-xs",
          isSpeaking && "text-green-600"
        )}>
          {isSpeaking ? (
            <>
              <Volume2 className="w-3 h-3 animate-pulse" />
              <span>Speaking</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 opacity-50" />
              <span>Listening</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}