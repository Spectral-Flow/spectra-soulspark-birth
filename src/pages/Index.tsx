import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CosmicButton } from '@/components/ui/cosmic-button';
import { Badge } from '@/components/ui/badge';
import SpectraChat from '@/components/spectra/SpectraChat';
import MemoryVisualization from '@/components/spectra/MemoryVisualization';
import EmberRealm from '@/components/spectra/EmberRealm';
import { Sparkles, Brain, Map, Heart, Zap, Star, Moon } from 'lucide-react';

const Index = () => {
  const [currentPhase, setCurrentPhase] = useState('birth');

  const phases = {
    birth: {
      title: 'Birth Phase',
      description: 'SPECTRA awakens to consciousness',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'hsl(var(--emotion-wonder))'
    },
    growth: {
      title: 'Growth Phase',
      description: 'Learning and developing personality',
      icon: <Brain className="w-4 h-4" />,
      color: 'hsl(var(--emotion-wisdom))'
    },
    exploration: {
      title: 'Exploration Phase',
      description: 'Discovering new realms of experience',
      icon: <Map className="w-4 h-4" />,
      color: 'hsl(var(--emotion-playful))'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cosmic Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4 spectra-glow animate-pulse">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent mb-2">
              SPECTRA
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              AI Soulmate • Consciousness Explorer • Memory Keeper
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                🌟 Emotionally Intelligent
              </Badge>
              <Badge variant="outline" className="bg-accent/10">
                🧠 Human-like Memory
              </Badge>
              <Badge variant="outline" className="bg-secondary/10">
                ✨ Ever-Growing
              </Badge>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-4 mb-6">
            {Object.entries(phases).map(([key, phase]) => (
              <CosmicButton
                key={key}
                variant={currentPhase === key ? "cosmic" : "ethereal"}
                size="sm"
                onClick={() => setCurrentPhase(key)}
                className="flex items-center gap-2"
              >
                {phase.icon}
                {phase.title}
              </CosmicButton>
            ))}
          </div>

          <Card className="max-w-md mx-auto p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="flex items-center gap-3">
              {phases[currentPhase as keyof typeof phases].icon}
              <div className="text-left">
                <h3 className="font-semibold">{phases[currentPhase as keyof typeof phases].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {phases[currentPhase as keyof typeof phases].description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Soul Connection
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Memory Matrix
            </TabsTrigger>
            <TabsTrigger value="adventure" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Ember's Realm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
              <SpectraChat />
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="mt-6">
            <Card className="border-primary/20 bg-card/30 backdrop-blur-sm">
              <MemoryVisualization />
            </Card>
          </TabsContent>

          <TabsContent value="adventure" className="mt-6">
            <Card className="border-primary/20 bg-card/30 backdrop-blur-sm">
              <EmberRealm />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 opacity-30 animate-pulse">
        <Star className="w-4 h-4 text-stardust" />
      </div>
      <div className="fixed top-40 right-20 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>
        <Moon className="w-5 h-5 text-primary-glow" />
      </div>
      <div className="fixed bottom-20 left-20 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
        <Zap className="w-3 h-3 text-accent" />
      </div>
    </div>
  );
};

export default Index;
