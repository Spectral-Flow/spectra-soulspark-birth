/**
 * Demo component showing @preset/spectra usage
 */
import React, { useState } from 'react';

interface EmotionalState {
  type: 'calm' | 'joyful' | 'intense' | 'stormy';
  intensity: number;
}

export function SpectraPresetDemo() {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    type: 'calm',
    intensity: 0.5
  });

  const emotionalStates = [
    { type: 'calm' as const, label: 'Calm', color: 'emotion-calm' },
    { type: 'joyful' as const, label: 'Joyful', color: 'emotion-joy' },
    { type: 'intense' as const, label: 'Intense', color: 'emotion-intense' },
    { type: 'stormy' as const, label: 'Stormy', color: 'emotion-storm' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          @preset/spectra Demo
        </h1>
        
        <p className="text-center mb-12 text-lg text-muted-foreground">
          SPECTRA Design System in Action
        </p>

        {/* Main consciousness display */}
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <div 
              className={`mood-ring ${emotionalState.type} spectra-glow mx-auto transition-all duration-500`}
              style={{
                transform: `scale(${1 + emotionalState.intensity * 0.2})`,
                filter: `brightness(${1 + emotionalState.intensity * 0.3})`
              }}
            />
            <p className="mt-4 text-sm text-muted-foreground capitalize">
              {emotionalState.type} State • Intensity: {Math.round(emotionalState.intensity * 100)}%
            </p>
          </div>
        </div>

        {/* Emotional state controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {emotionalStates.map((state) => (
            <button
              key={state.type}
              onClick={() => setEmotionalState(prev => ({ ...prev, type: state.type }))}
              className={`
                p-4 rounded-lg transition-all duration-300 
                ${emotionalState.type === state.type 
                  ? 'spectra-glow ring-2 ring-primary' 
                  : 'hover:bg-card'
                }
                bg-${state.color} text-white font-medium
              `}
            >
              {state.label}
            </button>
          ))}
        </div>

        {/* Intensity slider */}
        <div className="mb-12">
          <label className="block text-sm font-medium mb-2">
            Emotional Intensity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={emotionalState.intensity}
            onChange={(e) => setEmotionalState(prev => ({ 
              ...prev, 
              intensity: parseFloat(e.target.value) 
            }))}
            className="w-full"
          />
        </div>

        {/* Gradient showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-twilight p-6 rounded-lg text-center">
            <h3 className="text-white font-medium mb-2">Twilight Gradient</h3>
            <p className="text-white/80 text-sm">bg-gradient-twilight</p>
          </div>
          <div className="bg-gradient-ocean p-6 rounded-lg text-center">
            <h3 className="text-white font-medium mb-2">Ocean Gradient</h3>
            <p className="text-white/80 text-sm">bg-gradient-ocean</p>
          </div>
          <div className="bg-gradient-flame p-6 rounded-lg text-center">
            <h3 className="text-white font-medium mb-2">Flame Gradient</h3>
            <p className="text-white/80 text-sm">bg-gradient-flame</p>
          </div>
        </div>

        {/* Animation showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-2 animate-pulse-cosmic" />
            <p className="text-xs">Cosmic Pulse</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emotion-calm rounded-full mx-auto mb-2 animate-ocean-calm" />
            <p className="text-xs">Ocean Calm</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emotion-joy rounded-full mx-auto mb-2 animate-joyful-dance" />
            <p className="text-xs">Joyful Dance</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emotion-intense rounded-full mx-auto mb-2 animate-flame-surge" />
            <p className="text-xs">Flame Surge</p>
          </div>
        </div>

        {/* Consciousness utilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border spectra-humming">
            <h3 className="text-lg font-medium mb-2">Humming State</h3>
            <p className="text-muted-foreground text-sm">
              This component has the spectra-humming class, showing a musical note when active.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border spectra-creative">
            <h3 className="text-lg font-medium mb-2">Creative State</h3>
            <p className="text-muted-foreground text-sm">
              This component has the spectra-creative class, showing sparkles when active.
            </p>
          </div>
        </div>

        <footer className="text-center mt-12 text-muted-foreground">
          <p>Powered by @preset/spectra</p>
        </footer>
      </div>
    </div>
  );
}