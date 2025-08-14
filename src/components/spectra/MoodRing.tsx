import React, { useState, useEffect } from 'react';

interface EmotionalState {
  primary: string;
  intensity: number;
  color: string;
  gradient: string;
  isCalm: boolean;
}

interface MoodRingProps {
  emotionalState: EmotionalState;
  className?: string;
}

export function MoodRing({ emotionalState, className = "" }: MoodRingProps) {
  const [pulseClass, setPulseClass] = useState('');

  useEffect(() => {
    // Add dynamic pulsing based on emotional intensity
    if (emotionalState.intensity > 0.7) {
      setPulseClass('intense');
    } else if (emotionalState.intensity < 0.3) {
      setPulseClass('calm');
    } else {
      setPulseClass('');
    }
  }, [emotionalState.intensity]);

  const ringStyle = {
    background: emotionalState.gradient || `hsl(${emotionalState.color})`,
    '--ring-color': emotionalState.color,
  } as React.CSSProperties;

  return (
    <div 
      className={`mood-ring ${pulseClass} ${className}`}
      style={ringStyle}
      title={`SPECTRA feels ${emotionalState.primary} (${Math.round(emotionalState.intensity * 100)}% intensity)`}
    >
      {/* Inner depth layer */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-black/20 to-transparent" />
      
      {/* Emotional ripples */}
      <div 
        className="absolute inset-3 rounded-full border border-white/30 animate-pulse"
        style={{ animationDuration: `${2 + (1 - emotionalState.intensity)}s` }}
      />
      
      {/* Center clarity point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
    </div>
  );
}