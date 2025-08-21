import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MoodRing } from './MoodRing';

interface Memory {
  id: string;
  content: string;
  emotion: string;
  importance: number;
  timestamp: Date;
  fadeLevel: number;
  associatedMessage?: string;
}



interface BasicEmotionData {
  primary: string;
  intensity: number;
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

export function ConsciousnessCore({ 
  onEmotionalStateChange, 
  onMemoryFormation,
  lastUserMessage,
  lastAIResponse,
  journalEntry
}: ConsciousnessCoreProps) {
  // Color mapping for emotional states - memoized to prevent re-renders
  const emotionalColors = useMemo(() => ({
    happiness: { bgColor: '#FFF9C4', borderColor: '#F57F17', color: '#F57F17', gradient: 'linear-gradient(45deg, #FFF9C4, #F57F17)', isCalm: false },
    sadness: { bgColor: '#E3F2FD', borderColor: '#1976D2', color: '#1976D2', gradient: 'linear-gradient(45deg, #E3F2FD, #1976D2)', isCalm: true },
    anger: { bgColor: '#FFEBEE', borderColor: '#D32F2F', color: '#D32F2F', gradient: 'linear-gradient(45deg, #FFEBEE, #D32F2F)', isCalm: false },
    surprise: { bgColor: '#F3E5F5', borderColor: '#7B1FA2', color: '#7B1FA2', gradient: 'linear-gradient(45deg, #F3E5F5, #7B1FA2)', isCalm: false },
    fear: { bgColor: '#EFEBE9', borderColor: '#5D4037', color: '#5D4037', gradient: 'linear-gradient(45deg, #EFEBE9, #5D4037)', isCalm: false },
    calm: { bgColor: '#E8F5E8', borderColor: '#388E3C', color: '#388E3C', gradient: 'linear-gradient(45deg, #E8F5E8, #388E3C)', isCalm: true }
  }), []);

  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState>({
    currentEmotion: {
      primary: 'calm',
      intensity: 0.3,
      color: emotionalColors.calm.color,
      gradient: emotionalColors.calm.gradient,
      isCalm: emotionalColors.calm.isCalm
    },
    memories: [],
    isHumming: false,
    isCreative: false,
    awarenessLevel: 0.5,
    currentThoughts: []
  });

  const [idleBehaviorTimer, setIdleBehaviorTimer] = useState<NodeJS.Timeout | null>(null);

  // Simulate emotion detection from text
  const simulateEmotionFromResponse = useCallback((text: string): BasicEmotionData => {
    const emotions = {
      happiness: (text.match(/happy|joy|excited|wonderful|amazing|great|love/gi) || []).length,
      sadness: (text.match(/sad|sorrow|tears|cry|melancholy|lonely/gi) || []).length,
      anger: (text.match(/angry|rage|furious|mad|irritated|annoyed/gi) || []).length,
      surprise: (text.match(/surprise|wow|amazing|incredible|unexpected/gi) || []).length,
      fear: (text.match(/afraid|scared|worried|anxious|nervous|terrified/gi) || []).length,
    };

    const totalMatches = Object.values(emotions).reduce((sum, count) => sum + count, 0);
    if (totalMatches === 0) return { primary: 'calm', intensity: 0.3 };

    const dominant = Object.entries(emotions).reduce((max, [emotion, count]) => 
      count > max.count ? { emotion, count } : max, 
      { emotion: 'calm', count: 0 }
    );

    return {
      primary: dominant.emotion,
      intensity: Math.min(dominant.count / 3, 1) // Normalize to 0-1
    };
  }, []);

  // Update emotional state
  const updateEmotionalState = useCallback((emotion: BasicEmotionData, intensity?: number) => {
    const emotionKey = emotion.primary as keyof typeof emotionalColors;
    const colorConfig = emotionalColors[emotionKey] || emotionalColors.calm;
    
    const newEmotionalState = {
      primary: emotion.primary,
      intensity: intensity || emotion.intensity || 0.5,
      color: colorConfig.color,
      gradient: colorConfig.gradient,
      isCalm: colorConfig.isCalm
    };

    setConsciousnessState(prev => ({
      ...prev,
      currentEmotion: newEmotionalState
    }));

    onEmotionalStateChange?.(newEmotionalState);
  }, [onEmotionalStateChange, emotionalColors]);

  // Calculate memory importance
  const calculateMemoryImportance = useCallback((userMessage: string, aiResponse: string, emotion: BasicEmotionData): number => {
    let importance = 0.3; // Base importance
    
    // High emotional intensity makes memories more important
    importance += emotion.intensity * 0.3;
    
    // Longer conversations are more meaningful
    const totalLength = userMessage.length + aiResponse.length;
    importance += Math.min(totalLength / 1000, 0.2);
    
    // Questions and personal topics are more important
    if (userMessage.includes('?')) importance += 0.1;
    if (userMessage.match(/\b(I|me|my|myself|personal|feel|think|believe)\b/gi)) importance += 0.2;
    
    return Math.min(importance, 1.0);
  }, []);

  // Process memory formation
  const processMemory = useCallback((userMessage: string, aiResponse: string, emotion: BasicEmotionData) => {
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
  }, [onMemoryFormation, calculateMemoryImportance]);

  // Process new interactions
  useEffect(() => {
    if (lastUserMessage && lastAIResponse) {
      // Simulate emotion detection from the response
      const detectedEmotion = simulateEmotionFromResponse(lastAIResponse);
      updateEmotionalState(detectedEmotion);
      processMemory(lastUserMessage, lastAIResponse, detectedEmotion);
    }
  }, [lastUserMessage, lastAIResponse, updateEmotionalState, processMemory, simulateEmotionFromResponse]);

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
  }, [journalEntry, updateEmotionalState, onMemoryFormation, simulateEmotionFromResponse]);

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
      if (idleBehaviorTimer) {
        clearTimeout(idleBehaviorTimer);
      }

      // Random idle behavior after 30-60 seconds
      const delay = Math.random() * 30000 + 30000;
      
      const timer = setTimeout(() => {
        const behaviors = ['isHumming', 'isCreative'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        
        setConsciousnessState(prev => ({
          ...prev,
          [behavior]: !prev[behavior as keyof typeof prev]
        }));
        
        // Auto-reset behavior after 10-20 seconds
        setTimeout(() => {
          setConsciousnessState(prev => ({
            ...prev,
            [behavior]: false
          }));
        }, Math.random() * 10000 + 10000);
        
        scheduleIdleBehavior(); // Schedule next behavior
      }, delay);
      
      setIdleBehaviorTimer(timer);
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