import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SimpleConversation } from '@/components/tutorial-examples/SimpleConversation';
import { SignedUrlConversation } from '@/components/tutorial-examples/SignedUrlConversation';
import { Code, MessageCircle, Shield } from 'lucide-react';

const TutorialPage = () => {
  const [agentId, setAgentId] = useState(import.meta.env.VITE_ELEVENLABS_AGENT_ID || '');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            ElevenLabs Conversational AI Tutorial
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Learn how to create a web application that enables voice conversations with ElevenLabs AI agents
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-primary/10">
              🎙️ Real-time Voice
            </Badge>
            <Badge variant="outline" className="bg-accent/10">
              🤖 AI Agents
            </Badge>
            <Badge variant="outline" className="bg-secondary/10">
              ⚡ Low Latency
            </Badge>
          </div>
        </div>

        {/* Agent ID Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Configure your ElevenLabs agent ID for testing the examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="agentId" className="block text-sm font-medium mb-2">
                  Agent ID
                </label>
                <input
                  id="agentId"
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="Enter your ElevenLabs agent ID"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground">
                  {agentId ? 'Agent ID configured' : 'No agent ID set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Examples */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Basic Example
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Signed URL Authentication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Conversation Component</CardTitle>
                <CardDescription>
                  Simple conversation interface using agent ID directly. This example demonstrates
                  the basic setup for voice conversations with ElevenLabs AI agents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What this example shows:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Basic conversation setup with useConversation hook</li>
                    <li>• Microphone permission handling</li>
                    <li>• Simple start/stop conversation controls</li>
                    <li>• Connection status monitoring</li>
                    <li>• Voice activity indication (speaking/listening)</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Note:</h4>
                  <p className="text-sm text-yellow-700">
                    Direct agent ID usage requires conversation tokens in @elevenlabs/react v0.5.0+. 
                    This example demonstrates the API structure from the tutorial but may not work without proper tokens.
                    For production use, please use the "Signed URL Authentication" example below.
                  </p>
                </div>
                <SimpleConversation agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Signed URL Authentication</CardTitle>
                <CardDescription>
                  Advanced conversation interface using signed URLs for private agents. This example
                  demonstrates authentication with ElevenLabs private agents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What this example shows:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Signed URL generation for private agents</li>
                    <li>• Server-side API integration</li>
                    <li>• Secure authentication flow</li>
                    <li>• Error handling for authentication failures</li>
                    <li>• Production-ready conversation setup</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Requirements:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• VITE_ELEVENLABS_API_KEY environment variable must be set</li>
                    <li>• Valid agent ID must be configured</li>
                    <li>• Backend API endpoint for signed URL generation</li>
                  </ul>
                </div>
                <SignedUrlConversation agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
            <CardDescription>
              Key differences between Next.js tutorial and Vite React implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Next.js Tutorial Structure:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• app/components/conversation.tsx</li>
                  <li>• app/page.tsx</li>
                  <li>• app/api/get-signed-url/route.ts</li>
                  <li>• process.env for environment variables</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Vite React Implementation:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• src/components/tutorial-examples/</li>
                  <li>• src/pages/Tutorial.tsx</li>
                  <li>• api/elevenlabs/signed-url.ts</li>
                  <li>• import.meta.env for environment variables</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📝 Version Compatibility Note:</h4>
              <p className="text-sm text-blue-700">
                The @elevenlabs/react package (v0.5.0+) requires conversation tokens for direct agent ID usage.
                The original tutorial examples work with earlier versions or when tokens are properly configured.
                This implementation prioritizes the signed URL approach for better compatibility and security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorialPage;