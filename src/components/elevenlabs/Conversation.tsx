'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Mic, MicOff, Phone, PhoneOff, Settings } from 'lucide-react';
import { createElevenLabsApiService } from './api';

interface ConversationProps {
  agentId?: string;
  className?: string;
}

export function Conversation({ agentId: defaultAgentId = '', className }: ConversationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState(defaultAgentId);
  const [usePrivateAgent, setUsePrivateAgent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs Conversational AI');
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs Conversational AI');
      setIsConnecting(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs Conversation Error:', error);
      setError(error.message || 'An error occurred with the conversation');
      setIsConnecting(false);
    },
  });

  const getSignedUrl = async (agentId: string): Promise<string> => {
    const apiService = createElevenLabsApiService();
    
    if (!apiService) {
      throw new Error('ElevenLabs API key not configured. Please set VITE_ELEVENLABS_API_KEY environment variable.');
    }

    return await apiService.getSignedUrl(agentId);
  };

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!agentId.trim()) {
        throw new Error('Please enter an Agent ID');
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (usePrivateAgent) {
        // Use signed URL for private agents
        const signedUrl = await getSignedUrl(agentId);
        await conversation.startSession({
          signedUrl,
        });
      } else {
        // Use agent ID directly for public agents
        await conversation.startSession({
          agentId: agentId,
          // user_id: 'YOUR_CUSTOMER_USER_ID' // Optional field for tracking your end user IDs
        });
      }

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      setIsConnecting(false);
    }
  }, [conversation, agentId, usePrivateAgent]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setError(null);
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop conversation');
    }
  }, [conversation]);

  const getStatusBadgeVariant = () => {
    switch (conversation.status) {
      case 'connected':
        return 'default';
      case 'connecting':
        return 'secondary';
      case 'disconnected':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    switch (conversation.status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Ready';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              ElevenLabs Conversational AI
            </CardTitle>
            <CardDescription>
              Connect with an AI agent for real-time voice conversations
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="agent-id">Agent ID</Label>
              <Input
                id="agent-id"
                placeholder="Enter your ElevenLabs Agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your Agent ID from the ElevenLabs dashboard
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="private-agent"
                checked={usePrivateAgent}
                onCheckedChange={setUsePrivateAgent}
              />
              <Label htmlFor="private-agent">Private Agent (requires API key)</Label>
            </div>
            
            {usePrivateAgent && (
              <p className="text-xs text-muted-foreground">
                Private agents require VITE_ELEVENLABS_API_KEY environment variable
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant()}>
              {getStatusText()}
            </Badge>
            {conversation.status === 'connected' && (
              <Badge variant={conversation.isSpeaking ? 'default' : 'secondary'}>
                {conversation.isSpeaking ? (
                  <>
                    <Mic className="w-3 h-3 mr-1" />
                    Agent Speaking
                  </>
                ) : (
                  <>
                    <MicOff className="w-3 h-3 mr-1" />
                    Listening
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startConversation}
            disabled={conversation.status === 'connected' || isConnecting || !agentId.trim()}
            variant="default"
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Start Conversation'}
          </Button>
          
          <Button
            onClick={stopConversation}
            disabled={conversation.status !== 'connected'}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Stop Conversation
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Status: {conversation.status}</p>
          {conversation.status === 'connected' && (
            <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}