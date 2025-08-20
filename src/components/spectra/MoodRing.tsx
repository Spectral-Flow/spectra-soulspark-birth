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
    // Enhanced dynamic pulsing based on emotional intensity and type
    const emotion = emotionalState.primary;
    
    if (emotionalState.intensity > 0.8) {
      setPulseClass('intense');
    } else if (emotionalState.intensity < 0.3) {
      setPulseClass('calm');
    } else if (['joy', 'love', 'warmth'].includes(emotion)) {
      setPulseClass('joyful');
    } else if (['anxiety', 'contemplation', 'storm'].includes(emotion)) {
      setPulseClass('stormy');
    } else {
      setPulseClass('');
    }
  }, [emotionalState.intensity, emotionalState.primary]);

  const sanitizeColorString = (color: string): string => {
    // Only allow HSL values and CSS variables
    if (color.includes('hsl(') || color.includes('var(--')) {
      return color;
    }
    return 'hsl(var(--primary))'; // Safe fallback
  };

  // Enhanced animation timing based on emotional flow
  const getAnimationDuration = () => {
    const baseSpeed = emotionalState.isCalm ? 4 : 2;
    return `${baseSpeed - (emotionalState.intensity * 1.2)}s`;
  };

  const ringStyle = {
    background: emotionalState.gradient || sanitizeColorString(emotionalState.color),
    '--ring-color': sanitizeColorString(emotionalState.color),
    animationDuration: getAnimationDuration(),
    filter: `brightness(${1 + (emotionalState.intensity * 0.3)}) saturate(${1 + (emotionalState.intensity * 0.5)})`,
    transform: `scale(${1 + (emotionalState.intensity * 0.05)})`
  } as React.CSSProperties;

  return (
    <div 
      className={`mood-ring ${pulseClass} ${className}`}
      style={ringStyle}
      title={`SPECTRA feels ${emotionalState.primary} (${Math.round(emotionalState.intensity * 100)}% intensity)`}
    >
      {/* Enhanced depth layer with emotional resonance */}
      <div 
        className="absolute inset-2 rounded-full bg-gradient-to-br from-black/30 to-transparent"
        style={{
          opacity: 0.2 + (emotionalState.intensity * 0.2),
          animation: `depth-pulse ${6 + (2 * emotionalState.intensity)}s ease-in-out infinite`
        }}
      />
      
      {/* Dynamic emotional ripples */}
      <div 
        className="absolute inset-3 rounded-full border border-white/40 animate-pulse"
        style={{ 
          animationDuration: `${1.5 + (1 - emotionalState.intensity)}s`,
          borderColor: `hsl(var(--clarity-shimmer) / ${0.3 + (emotionalState.intensity * 0.2)})`
        }}
      />
      
      {/* Secondary ripple for intense emotions */}
      {emotionalState.intensity > 0.6 && (
        <div 
          className="absolute inset-1 rounded-full border border-white/20 animate-pulse"
          style={{ 
            animationDuration: `${1 + (1 - emotionalState.intensity)}s`,
            animationDelay: '0.3s'
          }}
        />
      )}
      
      {/* Enhanced center clarity point */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
        style={{
          width: `${6 + (emotionalState.intensity * 4)}px`,
          height: `${6 + (emotionalState.intensity * 4)}px`,
          background: `hsl(var(--clarity-spark))`,
          opacity: 0.7 + (emotionalState.intensity * 0.3),
          boxShadow: `0 0 ${5 + (emotionalState.intensity * 10)}px hsl(var(--clarity-spark) / 0.6)`,
          animationDuration: `${2 - (emotionalState.intensity * 0.5)}s`
        }}
      />
    </div>
  );
}