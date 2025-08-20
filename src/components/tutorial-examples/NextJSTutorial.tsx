import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Code, ExternalLink, Play, Settings } from 'lucide-react';
import { SimpleConversation } from './SimpleConversation';
import { SignedUrlConversation } from './SignedUrlConversation';

export function NextJSTutorial() {
  const [agentId, setAgentId] = useState(import.meta.env.VITE_ELEVENLABS_AGENT_ID || '');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Next.js ElevenLabs Conversational AI Tutorial
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to create a web application that enables voice conversations with ElevenLabs AI agents
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-blue-50">
            <ExternalLink className="w-3 h-3 mr-1" />
            Next.js Compatible
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Production Ready
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            <Play className="w-3 h-3 mr-1" />
            Live Examples
          </Badge>
        </div>
      </div>

      {/* Tutorial Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="basic">Basic Example</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  What You'll Need
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>An ElevenLabs agent created following the guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span><code>npm</code> installed on your local system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>TypeScript knowledge (optional)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Tutorial Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🎙️</Badge>
                  <span>Real-time voice conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🔒</Badge>
                  <span>Signed URL authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">⚡</Badge>
                  <span>Low latency responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🎯</Badge>
                  <span>Production ready code</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Looking for a complete example?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Check out our Next.js demo on GitHub for a full implementation.
              </p>
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/elevenlabs/elevenlabs-examples/tree/main/examples/conversational-ai/nextjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Setup</CardTitle>
              <CardDescription>
                Follow these steps to create a new Next.js project with ElevenLabs integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Create a new Next.js project</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`npm create next-app my-conversational-agent`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Follow the default suggestions for this tutorial.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Navigate to project directory</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`cd my-conversational-agent`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Install the ElevenLabs dependency</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`npm install @elevenlabs/react`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Test the setup</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`npm run dev`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Open the provided URL in your browser to verify the setup.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Create a <code>.env.local</code> file in your project root
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`ELEVENLABS_API_KEY=your-api-key-here
NEXT_PUBLIC_AGENT_ID=your-agent-id-here`}</code>
                </pre>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800">Important Security Notes:</p>
                    <ul className="mt-2 space-y-1 text-amber-700">
                      <li>• Add <code>.env.local</code> to your <code>.gitignore</code> file</li>
                      <li>• Never expose your API key in client-side code</li>
                      <li>• Keep API keys secure on the server</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Basic Example Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create the Conversation Component</CardTitle>
              <CardDescription>
                Create a new file <code>app/components/conversation.tsx</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

export function Conversation() {
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

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'YOUR_AGENT_ID', // Replace with your agent ID
        userId: 'YOUR_CUSTOMER_USER_ID' // Optional field for tracking your end user IDs
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

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
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update the Main Page</CardTitle>
              <CardDescription>
                Replace the contents of <code>app/page.tsx</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`import { Conversation } from './components/conversation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ElevenLabs Conversational AI
        </h1>
        <Conversation />
      </div>
    </main>
  );
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="auth" className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Optional: Authenticate with Signed URLs
              </CardTitle>
              <CardDescription>
                This authentication step is only required for private agents. If you're using a public agent, you can skip this section.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create an API Route</CardTitle>
              <CardDescription>
                Create a new file <code>app/api/get-signed-url/route.ts</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      \`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=\${process.env.NEXT_PUBLIC_AGENT_ID}\`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update the Conversation Component</CardTitle>
              <CardDescription>
                Modify your conversation component to fetch and use the signed URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`const getSignedUrl = async (): Promise<string> => {
  const response = await fetch("/api/get-signed-url");
  if (!response.ok) {
    throw new Error(\`Failed to get signed url: \${response.statusText}\`);
  }
  const { signedUrl } = await response.json();
  return signedUrl;
};

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
}, [conversation]);`}</code>
                </pre>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-semibold">Note:</p>
                    <p>Signed URLs expire after a short period. In production, implement proper error handling and URL refresh logic.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Agent ID</CardTitle>
              <CardDescription>
                Enter your ElevenLabs agent ID to test the examples below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-id">Agent ID</Label>
                <Input
                  id="agent-id"
                  placeholder="Enter your ElevenLabs agent ID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your ElevenLabs dashboard under Conversational AI
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Conversation</CardTitle>
                <CardDescription>
                  Simple agent ID-based conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleConversation agentId={agentId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signed URL Conversation</CardTitle>
                <CardDescription>
                  Authenticated conversation for private agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignedUrlConversation agentId={agentId} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Now that you have a basic implementation, you can:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">UI Enhancements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Add visual feedback for voice activity</li>
                    <li>• Implement error handling and retry logic</li>
                    <li>• Add a chat history display</li>
                    <li>• Customize the UI to match your brand</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Advanced Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Integration with user authentication</li>
                    <li>• Conversation analytics and logging</li>
                    <li>• Multi-agent support</li>
                    <li>• Custom voice processing pipelines</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a
                    href="https://www.npmjs.com/package/@elevenlabs/react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    @elevenlabs/react Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}