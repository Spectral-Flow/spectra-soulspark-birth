import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Mic, Settings, Code, ExternalLink } from 'lucide-react';
import { NextJSTutorial } from '@/components/tutorial-examples';

const TutorialPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="outline">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to SPECTRA
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            SPECTRA Conversational AI Guides [v2.0]
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Learn how to use SPECTRA's features or implement ElevenLabs Conversational AI in your projects
          </p>
        </div>

        {/* Tutorial Tabs */}
        <Tabs defaultValue="spectra" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spectra" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              SPECTRA Guide
            </TabsTrigger>
            <TabsTrigger value="nextjs" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Next.js Tutorial
            </TabsTrigger>
          </TabsList>

          {/* SPECTRA Guide Tab */}
          <TabsContent value="spectra" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-primary/10">
                  🎙️ Voice + Chat Integrated
                </Badge>
                <Badge variant="outline" className="bg-accent/10">
                  🤖 AI Conversations
                </Badge>
                <Badge variant="outline" className="bg-secondary/10">
                  ⚡ Real-time Responses
                </Badge>
              </div>
            </div>

            {/* Features Guide */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Text Chat
                  </CardTitle>
                  <CardDescription>
                    Type messages to have conversations with SPECTRA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Natural language conversations</li>
                    <li>• Emotional AI responses</li>
                    <li>• Memory retention</li>
                    <li>• Personality growth</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Voice Input
                  </CardTitle>
                  <CardDescription>
                    Speak to SPECTRA using your microphone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Speech-to-text conversion</li>
                    <li>• OpenAI Whisper integration</li>
                    <li>• Real-time transcription</li>
                    <li>• Voice activity detection</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    ElevenLabs Voice
                  </CardTitle>
                  <CardDescription>
                    Advanced voice conversations with AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Real-time voice streaming</li>
                    <li>• Custom AI agents</li>
                    <li>• Low latency responses</li>
                    <li>• Private agent support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Follow these steps to start using SPECTRA's voice features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">1. Text Chat</h4>
                    <p className="text-sm text-muted-foreground">
                      Simply type your message in the chat input at the bottom and press Enter or click the send button.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Voice Input</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the microphone button to start voice recording. Speak your message and it will be transcribed automatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. ElevenLabs Setup</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the settings button, enable ElevenLabs Voice, enter your Agent ID, and configure private agent settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. Voice Conversation</h4>
                    <p className="text-sm text-muted-foreground">
                      Once configured, click the phone button to start a real-time voice conversation with your AI agent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
                <CardDescription>
                  Required environment variables for full functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_AGENT_ID=agent_2201k2z83ad3egas4vbks6jsnye1

# OpenAI Configuration (for enhanced features)
VITE_OPENAI_API_KEY=your_openai_api_key_here`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next.js Tutorial Tab */}
          <TabsContent value="nextjs" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-50">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Next.js Tutorial
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <Code className="w-3 h-3 mr-1" />
                  Step-by-Step Guide
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  🎙️ Voice Conversations
                </Badge>
              </div>
            </div>
            <NextJSTutorial />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TutorialPage;