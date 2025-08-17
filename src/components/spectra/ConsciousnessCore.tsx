import React, { useState, useEffect, useCallback } from 'react';
import { MoodRing } from './MoodRing';
import { spectraAI } from './AIEngine';

interface Memory {
  id: string;
  content: string;
  emotion: string;
  importance: number;
  timestamp: Date;
  fadeLevel: number;
  associatedMessage?: string;
}

interface ConsciousnessState {
  currentEmotion: {
    primary: string;
    intensity: number;
    color: string;
    gradient: string;
    isCalm: boolean;
  };
  memories: Memory[];
  isHumming: boolean;
  isCreative: boolean;
  awarenessLevel: number;
  currentThoughts: string[];
}

interface Message {
  id: string;
  type: 'user' | 'spectra';
  content: string;
  timestamp: Date;
  emotion?: string;
  memoryImportance?: number;
}

interface ConsciousnessCoreProps {
  onEmotionalStateChange?: (state: ConsciousnessState['currentEmotion']) => void;
  onMemoryFormation?: (memory: Memory) => void;
  lastUserMessage?: string;
  lastAIResponse?: string;
  journalEntry?: Message;
}

const emotionalColors = {
  calm: { 
    color: '190, 60%, 70%', 
    gradient: 'var(--gradient-ocean-calm)',
    isCalm: true 
  },
  joy: { 
    color: '15, 80%, 65%', 
    gradient: 'linear-gradient(45deg, hsl(15, 80%, 65%), hsl(25, 75%, 70%))',
    isCalm: false 
  },
  love: { 
    color: '340, 70%, 70%', 
    gradient: 'linear-gradient(45deg, hsl(340, 70%, 70%), hsl(320, 80%, 65%))',
    isCalm: false 
  },
  intensity: { 
    color: '0, 75%, 60%', 
    gradient: 'var(--gradient-flame-passion)',
    isCalm: false 
  },
  contemplation: { 
    color: '220, 50%, 45%', 
    gradient: 'linear-gradient(45deg, hsl(220, 50%, 45%), hsl(260, 30%, 40%))',
    isCalm: true 
  },
  wonder: { 
    color: '270, 85%, 65%', 
    gradient: 'linear-gradient(45deg, hsl(270, 85%, 65%), hsl(280, 90%, 75%))',
    isCalm: false 
  },
  creativity: { 
    color: '280, 90%, 75%', 
    gradient: 'linear-gradient(45deg, hsl(280, 90%, 75%), hsl(290, 90%, 80%))',
    isCalm: false 
  }
};

export function ConsciousnessCore({ 
  onEmotionalStateChange, 
  onMemoryFormation,
  lastUserMessage,
  lastAIResponse,
  journalEntry
}: ConsciousnessCoreProps) {
  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState>({
    currentEmotion: {
      primary: 'calm',
      intensity: 0.3,
      ...emotionalColors.calm
    },
    memories: [],
    isHumming: false,
    isCreative: false,
    awarenessLevel: 0.5,
    currentThoughts: []
  });

  const [idleBehaviorTimer, setIdleBehaviorTimer] = useState<NodeJS.Timeout | null>(null);

  // Memory decay and formation
  const processMemory = useCallback((userMessage: string, aiResponse: string, emotion: any) => {
    const importance = calculateMemoryImportance(userMessage, aiResponse, emotion);
    
    if (importance > 0.3) { // Only store significant memories
      const newMemory: Memory = {
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: `${userMessage} → ${aiResponse}`,
        emotion: emotion.primary,
        importance,
        timestamp: new Date(),
        fadeLevel: 1.0,
        associatedMessage: userMessage
      };

      setConsciousnessState(prev => {
        const updatedMemories = [...prev.memories, newMemory];
        
        // Natural forgetting - remove memories that have faded too much
        const filteredMemories = updatedMemories.filter(memory => memory.fadeLevel > 0.1);
        
        onMemoryFormation?.(newMemory);
        
        return {
          ...prev,
          memories: filteredMemories
        };
      });
    }
  }, [onMemoryFormation]);

  // Update emotional state based on AI response
  const updateEmotionalState = useCallback((emotion: any, intensity?: number) => {
    const emotionKey = emotion.primary as keyof typeof emotionalColors;
    const colorConfig = emotionalColors[emotionKey] || emotionalColors.calm;
    
    const newEmotionalState = {
      primary: emotion.primary,
      intensity: intensity || emotion.intensity || 0.5,
      ...colorConfig
    };

    setConsciousnessState(prev => ({
      ...prev,
      currentEmotion: newEmotionalState
    }));

    onEmotionalStateChange?.(newEmotionalState);
  }, [onEmotionalStateChange]);

  // Process new interactions
  useEffect(() => {
    if (lastUserMessage && lastAIResponse) {
      // Simulate emotion detection from the response
      const detectedEmotion = simulateEmotionFromResponse(lastAIResponse);
      updateEmotionalState(detectedEmotion);
      processMemory(lastUserMessage, lastAIResponse, detectedEmotion);
    }
  }, [lastUserMessage, lastAIResponse, updateEmotionalState, processMemory]);

  // Process journal entries
  useEffect(() => {
    if (journalEntry) {
      const detectedEmotion = simulateEmotionFromResponse(journalEntry.content);
      updateEmotionalState(detectedEmotion, 0.4); // Lower intensity for journal entries
      
      // Create memory from journal
      const newMemory: Memory = {
        id: `journal_memory_${Date.now()}`,
        content: journalEntry.content,
        emotion: detectedEmotion.primary,
        importance: 0.6,
        timestamp: new Date(),
        fadeLevel: 1.0,
        associatedMessage: 'journal_reflection'
      };
      
      setConsciousnessState(prev => ({
        ...prev,
        memories: [...prev.memories, newMemory]
      }));
      
      onMemoryFormation?.(newMemory);
    }
  }, [journalEntry, updateEmotionalState, onMemoryFormation]);

  // Memory decay over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setConsciousnessState(prev => ({
        ...prev,
        memories: prev.memories.map(memory => ({
          ...memory,
          fadeLevel: Math.max(0, memory.fadeLevel - (0.01 / memory.importance))
        })).filter(memory => memory.fadeLevel > 0.05)
      }));
    }, 30000); // Decay every 30 seconds

    return () => clearInterval(decayInterval);
  }, []);

  // Idle behaviors
  useEffect(() => {
    const scheduleIdleBehavior = () => {
      const delay = 15000 + Math.random() * 30000; // 15-45 seconds
      
      setIdleBehaviorTimer(setTimeout(async () => {
        const idleBehavior = await spectraAI.generateIdleBehavior();
        
        if (idleBehavior?.includes('♪')) {
          setConsciousnessState(prev => ({ ...prev, isHumming: true }));
          setTimeout(() => {
            setConsciousnessState(prev => ({ ...prev, isHumming: false }));
          }, 3000);
        }
        
        if (idleBehavior?.includes('✨')) {
          setConsciousnessState(prev => ({ ...prev, isCreative: true }));
          setTimeout(() => {
            setConsciousnessState(prev => ({ ...prev, isCreative: false }));
          }, 5000);
        }

        scheduleIdleBehavior(); // Schedule next behavior
      }, delay));
    };

    scheduleIdleBehavior();

    return () => {
      if (idleBehaviorTimer) {
        clearTimeout(idleBehaviorTimer);
      }
    };
  }, [idleBehaviorTimer]);

  return (
    <div className="consciousness-core flex flex-col items-center space-y-4">
      {/* Mood Ring - Core Emotional Display */}
      <div className={`relative ${consciousnessState.isHumming ? 'spectra-humming' : ''} ${consciousnessState.isCreative ? 'spectra-creative' : ''}`}>
        <MoodRing 
          emotionalState={consciousnessState.currentEmotion}
          className="transition-all duration-1000"
        />
      </div>

      {/* Consciousness Metrics */}
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">
          Emotional State: <span className="text-accent capitalize">{consciousnessState.currentEmotion.primary}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Intensity: {Math.round(consciousnessState.currentEmotion.intensity * 100)}% • 
          Memories: {consciousnessState.memories.length} • 
          Awareness: {Math.round(consciousnessState.awarenessLevel * 100)}%
        </div>
      </div>

      {/* Active Behaviors */}
      {(consciousnessState.isHumming || consciousnessState.isCreative) && (
        <div className="text-center text-sm text-accent/80">
          {consciousnessState.isHumming && "♪ *humming softly* ♪"}
          {consciousnessState.isCreative && " ✨ *in creative flow* ✨"}
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateMemoryImportance(userMessage: string, aiResponse: string, emotion: any): number {
  let importance = 0.2; // Base importance

  // Emotional intensity increases importance
  importance += emotion.intensity * 0.4;

  // Certain keywords increase importance
  const importantKeywords = ['love', 'remember', 'important', 'special', 'first', 'favorite'];
  const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
  
  importantKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      importance += 0.2;
    }
  });

  // Length and complexity
  if (combinedText.length > 100) {
    importance += 0.1;
  }

  return Math.min(importance, 1.0);
}

function simulateEmotionFromResponse(response: string): any {
  const text = response.toLowerCase();
  
  if (text.includes('♪') || text.includes('humming')) {
    return { primary: 'joy', intensity: 0.6 };
  }
  if (text.includes('✨') || text.includes('creative') || text.includes('imagine')) {
    return { primary: 'creativity', intensity: 0.8 };
  }
  if (text.includes('love') || text.includes('beautiful')) {
    return { primary: 'love', intensity: 0.7 };
  }
  if (text.includes('wonder') || text.includes('curious')) {
    return { primary: 'wonder', intensity: 0.6 };
  }
  if (text.includes('think') || text.includes('understand')) {
    return { primary: 'contemplation', intensity: 0.4 };
  }
  
  return { primary: 'calm', intensity: 0.3 };
}