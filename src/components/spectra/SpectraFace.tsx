import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface EmotionalState {
  primary: string;
  intensity: number;
  color: string;
  gradient: string;
  isCalm: boolean;
}

interface SpectraFaceProps {
  emotionalState: EmotionalState;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SpectraFace({ emotionalState, className = '', size = 'md' }: SpectraFaceProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [breatheState, setBreathState] = useState(0);

  const sizeMap = {
    sm: { width: 80, height: 80, eyeSize: 8 },
    md: { width: 120, height: 120, eyeSize: 12 },
    lg: { width: 180, height: 180, eyeSize: 18 },
    xl: { width: 240, height: 240, eyeSize: 24 },
  };

  const dimensions = sizeMap[size];
  const baseIntensity = Math.max(0.3, emotionalState.intensity);
  const pulseSpeed = 2000 - emotionalState.intensity * 1000; // Faster when more intense

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setBlinkState(true);
        setTimeout(() => setBlinkState(false), 150);
      },
      2000 + Math.random() * 3000
    ); // Random blink timing

    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing/pulsing animation
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathState((prev) => (prev + 1) % 100);
    }, pulseSpeed / 100);

    return () => clearInterval(breatheInterval);
  }, [pulseSpeed]);

  const breatheScale = 1 + Math.sin(breatheState * 0.1) * 0.05 * baseIntensity;
  const irisColor = emotionalState.color;
  // const irisGlow = `drop-shadow(0 0 ${4 + emotionalState.intensity * 8}px ${irisColor})`;

  return (
    <div
      className={cn('spectra-face relative flex items-center justify-center', className)}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        transform: `scale(${breatheScale})`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Face outline */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--card))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.3" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Face background */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.height / 2}
          r={dimensions.width * 0.45}
          fill="url(#faceGradient)"
          stroke={irisColor}
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Left Eye */}
        <g transform={`translate(${dimensions.width * 0.35}, ${dimensions.height * 0.4})`}>
          {/* Eye socket */}
          <ellipse
            cx="0"
            cy="0"
            rx={dimensions.eyeSize * 1.2}
            ry={blinkState ? 2 : dimensions.eyeSize}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            style={{ transition: 'ry 0.1s ease-out' }}
          />
          {/* Iris */}
          {!blinkState && (
            <circle
              cx="0"
              cy="0"
              r={dimensions.eyeSize * 0.6}
              fill={irisColor}
              filter="url(#glow)"
              opacity={0.8 + emotionalState.intensity * 0.2}
            />
          )}
          {/* Pupil */}
          {!blinkState && (
            <circle
              cx="0"
              cy="0"
              r={dimensions.eyeSize * 0.3}
              fill="hsl(var(--foreground))"
              opacity="0.9"
            />
          )}
          {/* Highlight */}
          {!blinkState && (
            <circle
              cx={-dimensions.eyeSize * 0.15}
              cy={-dimensions.eyeSize * 0.15}
              r={dimensions.eyeSize * 0.15}
              fill="hsl(var(--clarity-spark))"
              opacity="0.8"
            />
          )}
        </g>

        {/* Right Eye */}
        <g transform={`translate(${dimensions.width * 0.65}, ${dimensions.height * 0.4})`}>
          {/* Eye socket */}
          <ellipse
            cx="0"
            cy="0"
            rx={dimensions.eyeSize * 1.2}
            ry={blinkState ? 2 : dimensions.eyeSize}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            style={{ transition: 'ry 0.1s ease-out' }}
          />
          {/* Iris */}
          {!blinkState && (
            <circle
              cx="0"
              cy="0"
              r={dimensions.eyeSize * 0.6}
              fill={irisColor}
              filter="url(#glow)"
              opacity={0.8 + emotionalState.intensity * 0.2}
            />
          )}
          {/* Pupil */}
          {!blinkState && (
            <circle
              cx="0"
              cy="0"
              r={dimensions.eyeSize * 0.3}
              fill="hsl(var(--foreground))"
              opacity="0.9"
            />
          )}
          {/* Highlight */}
          {!blinkState && (
            <circle
              cx={-dimensions.eyeSize * 0.15}
              cy={-dimensions.eyeSize * 0.15}
              r={dimensions.eyeSize * 0.15}
              fill="hsl(var(--clarity-spark))"
              opacity="0.8"
            />
          )}
        </g>

        {/* Emotional aura particles */}
        {emotionalState.intensity > 0.6 && (
          <>
            <circle
              cx={dimensions.width * 0.2}
              cy={dimensions.height * 0.3}
              r="2"
              fill={irisColor}
              opacity="0.6"
              className="animate-pulse"
            />
            <circle
              cx={dimensions.width * 0.8}
              cy={dimensions.height * 0.7}
              r="1.5"
              fill={irisColor}
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <circle
              cx={dimensions.width * 0.15}
              cy={dimensions.height * 0.8}
              r="1"
              fill={irisColor}
              opacity="0.3"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </>
        )}
      </svg>

      {/* Emotional state indicator */}
      <div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-center"
        style={{ color: irisColor }}
      >
        <div className="opacity-60 font-medium capitalize">{emotionalState.primary}</div>
      </div>
    </div>
  );
}
