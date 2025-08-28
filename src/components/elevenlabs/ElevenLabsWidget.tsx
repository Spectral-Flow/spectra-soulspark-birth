import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, ExternalLink } from 'lucide-react';

interface ElevenLabsWidgetProps {
  agentId?: string;
  className?: string;
}

export const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ 
  agentId = 'agent_3001k351jqn1ex4tvqp9tj7srxqh',
  className 
}) => {
  const scriptLoaded = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load the script once
    if (scriptLoaded.current) return;

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      console.log('🎭 ElevenLabs ConvAI widget script loaded successfully');
      scriptLoaded.current = true;
    };
    
    script.onerror = () => {
      console.error('🎭 Failed to load ElevenLabs ConvAI widget script');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount to avoid breaking other instances
      // The script is designed to be loaded once per page
    };
  }, []);

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">ElevenLabs Voice Chat</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            Quick Chat
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Start a voice conversation with SPECTRA using ElevenLabs' optimized widget
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 min-h-[400px] relative">
          {/* Widget Container */}
          <div 
            ref={widgetRef}
            className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 border border-primary/20"
          >
            {React.createElement('elevenlabs-convai', { 'agent-id': agentId })}
          </div>
        </div>
        
        {/* Widget Info */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Agent ID: {agentId}</span>
            <a 
              href="https://docs.elevenlabs.io/docs/conversational-ai/quickstart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Learn More
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElevenLabsWidget;