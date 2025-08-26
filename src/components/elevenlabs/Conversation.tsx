import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Mic, MicOff, Phone, PhoneOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createElevenLabsApiService } from './api';
import { memoryManager } from '@/lib/memory-manager';
import { logVoice, logError } from '@/lib/logger';

interface ConversationError {
  message?: string;
  type?: string;
  code?: string | number;
}

interface ConversationProps {
  agentId?: string;
  className?: string;
}

export function Conversation({ agentId: defaultAgentId = '', className }: ConversationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState(defaultAgentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID || '');
  const [usePrivateAgent, setUsePrivateAgent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const conversation = useConversation({
    onConnect: () => {
      logVoice('Connected to ElevenLabs Conversational AI');
      setIsConnecting(false);
      setError(null);
      setRetryCount(0); // Reset retry count on successful connection
    },
    onDisconnect: () => {
      logVoice('Disconnected from ElevenLabs Conversational AI');
      setIsConnecting(false);
    },
    onMessage: async (message: any) => {
      logVoice('ElevenLabs Message received', message);
      
      // Integrate with Spectra's conversation history
      try {
        // Store the conversation exchange in memory
        // The message structure from ElevenLabs may vary, so we handle it generically
        const messageText = message.message || message.text || JSON.stringify(message);
        const source = message.source || 'agent';
        
        if (source === 'user') {
          // User message - store for processing when we get AI response
          // For now, just log it
          logVoice('User message captured', messageText);
        } else if (source === 'agent') {
          // AI response - create a memory entry
          await memoryManager.processConversationExchange(
            'ElevenLabs conversation', // user message placeholder
            messageText, // AI response
            'neutral', // emotion placeholder
            0.7 // importance score
          );
        }
      } catch (error) {
        logError('ElevenLabs', 'Failed to save conversation to memory', error);
      }
    },
    onError: (error) => {
      logError('ElevenLabs', 'Conversation Error', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error as ConversationError)?.message || 'An error occurred with the conversation';
      setError(errorMessage);
      setIsConnecting(false);
      
      // Implement automatic retry for certain types of errors
      if (retryCount < maxRetries && shouldRetry(error)) {
        setTimeout(() => {
          console.log(`Retrying connection (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          startConversation();
        }, retryDelay);
      }
    },
  });

  const shouldRetry = (error: unknown): boolean => {
    // Retry on network errors or temporary server issues
    const retryableErrors = [
      'network error',
      'connection failed',
      'timeout',
      'temporary unavailable',
      'rate limit'
    ];
    
    const errorMessage = typeof error === 'string' 
      ? error.toLowerCase()
      : ((error as ConversationError)?.message || '').toLowerCase();
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    );
  };

  const getSignedUrl = async (agentId: string): Promise<string> => {
    const apiService = createElevenLabsApiService();
    
    if (!apiService) {
      throw new Error('ElevenLabs API key not configured. Please set VITE_ELEVENLABS_API_KEY environment variable.');
    }

    return await apiService.getSignedUrl(agentId);
  };

  const startConversation = useCallback(async () => {
    try {
      // Prevent rapid retry attempts
      const now = Date.now();
      if (now - lastConnectionAttempt < retryDelay && retryCount > 0) {
        console.log('Preventing rapid retry attempt');
        return;
      }
      
      setLastConnectionAttempt(now);
      setIsConnecting(true);
      setError(null);
      
      if (!agentId.trim()) {
        throw new Error('Please enter an Agent ID');
      }

      // Request microphone permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error('Microphone permission required for voice conversation');
      }

      if (usePrivateAgent) {
        // Use signed URL for private agents
        const signedUrl = await getSignedUrl(agentId);
        await conversation.startSession({
          signedUrl,
        });
      } else {
        // Use agent ID directly for public agents - requires conversation token for @elevenlabs/react
        throw new Error('Public agent support requires conversation token. Please use private agent mode with signed URL.');
      }

    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setError(errorMessage);
      setIsConnecting(false);
      
      // Don't auto-retry user input errors
      if (errorMessage.includes('Agent ID') || errorMessage.includes('Microphone')) {
        setRetryCount(maxRetries); // Prevent auto-retry
      }
    }
  }, [conversation, agentId, usePrivateAgent, retryCount, lastConnectionAttempt]);

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
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Private agents require VITE_ELEVENLABS_API_KEY environment variable
                </p>
                {!import.meta.env.VITE_ELEVENLABS_API_KEY && (
                  <div className="p-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
                    ⚠️ API key not configured. Private agent features will be unavailable.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
            {retryCount > 0 && retryCount < maxRetries && (
              <div className="p-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
                🔄 Retrying connection... (attempt {retryCount}/{maxRetries})
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant()} 
                   className={isConnecting ? 'animate-pulse' : ''}>
              {getStatusText()}
            </Badge>
            {conversation.status === 'connected' && (
              <Badge variant={conversation.isSpeaking ? 'default' : 'secondary'}
                     className={conversation.isSpeaking ? 'animate-pulse' : ''}>
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
            {isConnecting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
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

        {!agentId.trim() && !showSettings && (
          <div className="p-3 text-sm text-muted-foreground bg-muted/30 border border-muted rounded-md">
            <p className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Click the settings button above to configure your ElevenLabs Agent ID
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <span>Status:</span>
            <span className={cn(
              "font-medium",
              conversation.status === 'connected' && "text-green-600",
              conversation.status === 'connecting' && "text-yellow-600",
              conversation.status === 'disconnected' && "text-gray-600"
            )}>
              {conversation.status}
            </span>
            {(isConnecting || conversation.status === 'connecting') && (
              <LoadingSpinner size="sm" />
            )}
          </p>
          {conversation.status === 'connected' && (
            <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}