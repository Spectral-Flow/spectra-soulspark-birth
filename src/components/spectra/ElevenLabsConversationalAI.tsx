import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Phone, PhoneOff, Settings } from 'lucide-react';
import { createElevenLabsConversation, ConversationSession, getSignedUrl } from '@/voice/elevenlabs_conversation';

interface ElevenLabsConversationalAIProps {
  className?: string;
}

const ElevenLabsConversationalAI: React.FC<ElevenLabsConversationalAIProps> = ({ className }) => {
  const [conversation, setConversation] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [agentStatus, setAgentStatus] = useState<'listening' | 'speaking'>('listening');
  const [error, setError] = useState<string | null>(null);
  
  // Configuration states
  const [agentId, setAgentId] = useState<string>('YOUR_AGENT_ID');
  const [useSignedUrl, setUseSignedUrl] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>('http://localhost:3001/api/get-signed-url');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    const initConversation = async () => {
      const conv = createElevenLabsConversation();
      setConversation(conv);
      
      // Check if ElevenLabs client is available
      setTimeout(() => {
        setIsAvailable(conv.isAvailable());
      }, 1000);
    };

    initConversation();
  }, []);

  const startConversation = async () => {
    if (!conversation) {
      setError('Conversation client not initialized');
      return;
    }

    try {
      setError(null);
      setConnectionStatus('connecting');

      let sessionConfig: any = {
        onConnect: () => {
          console.log('✨ Connected to ElevenLabs agent');
          setConnectionStatus('connected');
          setError(null);
        },
        onDisconnect: () => {
          console.log('📱 Disconnected from ElevenLabs agent');
          setConnectionStatus('disconnected');
          setCurrentSession(null);
        },
        onError: (error: any) => {
          console.error('ElevenLabs conversation error:', error);
          setError(`Conversation error: ${error.message || error}`);
          setConnectionStatus('disconnected');
        },
        onModeChange: (mode: { mode: 'speaking' | 'listening' }) => {
          setAgentStatus(mode.mode);
        },
      };

      if (useSignedUrl) {
        try {
          const signedUrl = await getSignedUrl(apiEndpoint);
          sessionConfig.signedUrl = signedUrl;
        } catch (urlError) {
          setError(`Failed to get signed URL: ${urlError}`);
          setConnectionStatus('disconnected');
          return;
        }
      } else {
        sessionConfig.agentId = agentId;
      }

      const session = await conversation.startSession(sessionConfig);
      setCurrentSession(session);
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setError(`Failed to start conversation: ${error.message || error}`);
      setConnectionStatus('disconnected');
    }
  };

  const stopConversation = async () => {
    if (currentSession) {
      try {
        await currentSession.endSession();
        setCurrentSession(null);
        setConnectionStatus('disconnected');
        setError(null);
      } catch (error: any) {
        console.error('Error stopping conversation:', error);
        setError(`Error stopping conversation: ${error.message || error}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'speaking': return 'bg-blue-500';
      case 'listening': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            ElevenLabs Conversational AI
          </CardTitle>
          <CardDescription>
            Real-time voice conversations with AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              ElevenLabs client not available. To enable conversational AI features, install the ElevenLabs client:
              <br />
              <code className="mt-2 block bg-muted p-2 rounded text-sm">
                npm install @elevenlabs/client
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          ElevenLabs Conversational AI
          <Badge variant="outline" className="ml-auto">
            Voice Chat
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time voice conversations with ElevenLabs AI agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="conversation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation" className="space-y-4">
            {/* Status Display */}
            <div className="flex justify-center gap-8 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)}`} />
                  <span className="text-sm font-medium">Connection</span>
                </div>
                <p className="text-lg capitalize">{connectionStatus}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agentStatus)}`} />
                  <span className="text-sm font-medium">Agent</span>
                </div>
                <p className="text-lg capitalize">{agentStatus}</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={startConversation}
                disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                size="lg"
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Conversation
              </Button>
              <Button
                onClick={stopConversation}
                disabled={connectionStatus === 'disconnected'}
                variant="destructive"
                size="lg"
                className="flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                Stop Conversation
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Usage Instructions */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How to use:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Configure your agent ID in the Settings tab</li>
                <li>Click "Start Conversation" to begin</li>
                <li>Allow microphone access when prompted</li>
                <li>Speak naturally - the AI will listen and respond</li>
                <li>Click "Stop Conversation" when finished</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent ID</Label>
                <Input
                  id="agentId"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="Enter your ElevenLabs agent ID"
                  disabled={connectionStatus !== 'disconnected'}
                />
                <p className="text-xs text-muted-foreground">
                  Replace with your actual agent ID from ElevenLabs
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useSignedUrl}
                    onChange={(e) => setUseSignedUrl(e.target.checked)}
                    disabled={connectionStatus !== 'disconnected'}
                  />
                  Use Signed URL (for private agents)
                </Label>
                {useSignedUrl && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="apiEndpoint">API Endpoint</Label>
                    <Input
                      id="apiEndpoint"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      placeholder="http://localhost:3001/api/get-signed-url"
                      disabled={connectionStatus !== 'disconnected'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Backend endpoint that provides signed URLs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ElevenLabsConversationalAI;