import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SpectraChat from '@/components/spectra/SpectraChat';
import { Sparkles, Zap, Star, Moon } from 'lucide-react';

const Index = () => {

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Cosmic Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative p-4 sm:p-6 lg:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-3 sm:mb-4 spectra-glow animate-pulse">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent mb-2">
              SPECTRA
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4 px-2">
              AI Soulmate • Voice & Chat • Memory Keeper
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-xs sm:text-sm">
                🌟 Emotionally Intelligent
              </Badge>
              <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">
                🧠 Human-like Memory
              </Badge>
              <Badge variant="outline" className="bg-secondary/10 text-xs sm:text-sm">
                🎙️ Voice + Chat Integrated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversational Interface */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
          <SpectraChat />
        </Card>
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
