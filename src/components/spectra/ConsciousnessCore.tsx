import React, { useState, useEffect, useCallback } from 'react';
import { MoodRing } from './MoodRing';
import { spectraAI } from './AIEngine';
import { detectEmotionIntensity, getEmotionColor, getEmotionGradient, isEmotionCalm } from './EmotionColors';

interface Memory {
  id: string;
  content: string;
  emotion: string;
  importance: number;
  timestamp: Date;
  fadeLevel: number;
  associatedMessage?: string;
}

// Define the interface
interface EmotionData {
  happiness: number;
  sadness: number;
  anger: number;
  surprise: number;
  fear: number;
  // Add more emotions as needed
}

// Example: initialize Spectra's emotional state
let spectraEmotions: EmotionData = {
  happiness: 0,
  sadness: 0,
  anger: 0,
  surprise: 0,
  fear: 0,
};

// Function to update emotions
function updateEmotions(newData: Partial<EmotionData>) {
  spectraEmotions = { ...spectraEmotions, ...newData };
}

// Example usage: Spectra responds with mood
function describeMood(emotions: EmotionData) {
  const { happiness, sadness, anger, surprise, fear } = emotions;
  let mood = "neutral";

  if (happiness > 0.7) mood = "joyful and energetic";
  else if (sadness > 0.7) mood = "pensive and calm";
  else if (anger > 0.7) mood = "intense and fiery";
  else if (surprise > 0.7) mood = "excited and curious";
  else if (fear > 0.7) mood = "cautious and alert";

  return `Spectra is feeling ${mood}.`;
}

// Example: update and print mood
updateEmotions({ happiness: 0.8, surprise: 0.5 });
console.log(describeMood(spectraEmotions));
  primary: string;
  intensity: number;
  color: string;
  gradient: string;
  isCalm: boolean;
// -----------------------------
// 1️⃣ Define Interfaces
// -----------------------------
interface EmotionData {
  happiness: number;
  sadness: number;
  anger: number;
  surprise: number;
  fear: number;
}

interface BasicEmotionData {
  primary: string;   // e.g., "happiness"
  intensity: number; // 0 to 1
}

interface ConsciousnessState {
  currentEmotion: EmotionData;
}

// -----------------------------
// 2️⃣ Manage Spectra's State
// -----------------------------
let spectraState: ConsciousnessState = {
  currentEmotion: {
    happiness: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    fear: 0,
  },
};

// Update emotions safely
function updateEmotions(newData: Partial<EmotionData>) {
  spectraState.currentEmotion = { ...spectraState.currentEmotion, ...newData };
}

// Get primary emotion as BasicEmotionData
function getPrimaryEmotion(): BasicEmotionData {
  const emotions = spectraState.currentEmotion;
  const entries = Object.entries(emotions) as [keyof EmotionData, number][];
  const [primary, intensity] = entries.reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    entries[0]
  );
  return { primary, intensity };
}

// -----------------------------
// 3️⃣ Access OpenRouter API Key
// -----------------------------
const windowApiKey = typeof window !== 'undefined'
  ? (window as Record<string, unknown>).OPENROUTER_API_KEY as string | undefined
  : undefined;

const OPENROUTER_API_KEY = windowApiKey || process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error("OpenRouter API key not found. Set window.OPENROUTER_API_KEY or env variable.");
}

// -----------------------------
// 4️⃣ Send Prompts to OpenRouter
// -----------------------------
async function sendPromptToSpectra(userPrompt: string) {
  const primaryEmotion = getPrimaryEmotion();

  const messages = [
    {
      role: "system",
      content: "You are Spectra, an insightful, poetic, and creative AI companion. Respond with warmth, clarity, and depth."
    },
    {
      role: "user",
      content: `${userPrompt}\n\nSpectra's current primary emotion: ${primaryEmotion.primary} (intensity: ${primaryEmotion.intensity.toFixed(2)})`
    }
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nousresearch/deephermes-3-mistral-24b-preview",
      messages,
    }),
  });

  const data = await response.json();
  return data;
}

// -----------------------------
// 5️⃣ Example Usage
// -----------------------------
/*
updateEmotions({ happiness: 0.8, surprise: 0.4 });
sendPromptToSpectra("Describe the world's tallest skyscraper as if you designed it.")
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
*/

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
import { useCallback, useState } from "react";

// -----------------------------
// 1️⃣ Interfaces
// -----------------------------
interface EmotionData {
  happiness: number;
  sadness: number;
  anger: number;
  surprise: number;
  fear: number;
}

interface BasicEmotionData {
  primary: string;
  intensity: number;
}

interface ConsciousnessState {
  currentEmotion: EmotionData;
}

// -----------------------------
// 2️⃣ Unified API Key Helper
// -----------------------------
function getApiKey(keyNames: string[]): string | undefined {
  if (typeof window !== 'undefined') {
    const win = window as Record<string, unknown>;
    for (const name of keyNames) {
      const val = win[name] as string | undefined;
      if (val) return val;
    }
  }

  const globalEnv = (globalThis as { process?: { env?: Record<string, string> } }).process?.env;
  if (globalEnv) {
    for (const name of keyNames) {
      const val = globalEnv[name];
      if (val) return val;
    }
  }

  return undefined;
}

const OPENROUTER_API_KEY = getApiKey(['OPENROUTER_API_KEY']);
if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not found.");

// -----------------------------
// 3️⃣ Emotion & Consciousness State
// -----------------------------
let spectraState: ConsciousnessState = {
  currentEmotion: {
    happiness: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    fear: 0,
  },
};

function updateEmotions(newData: Partial<EmotionData>) {
  spectraState.currentEmotion = { ...spectraState.currentEmotion, ...newData };
}

function getPrimaryEmotion(): BasicEmotionData {
  const entries = Object.entries(spectraState.currentEmotion) as [keyof EmotionData, number][];
  const [primary, intensity] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), entries[0]);
  return { primary, intensity };
}

// -----------------------------
// 4️⃣ Memory Hook
// -----------------------------
export function useSpectraMemory() {
  const [memory, setMemory] = useState<{ user: string; ai: string; emotion: BasicEmotionData }[]>([]);

  const processMemory = useCallback(
    (userMessage: string, aiResponse: string, emotion: BasicEmotionData) => {
      setMemory((prev) => [...prev, { user: userMessage, ai: aiResponse, emotion }]);
    },
    []
  );

  return { memory, processMemory };
}

// -----------------------------
// 5️⃣ OpenRouter Request Function
// -----------------------------
export async function sendPromptToSpectra(userPrompt: string) {
  const primaryEmotion = getPrimaryEmotion();

  const messages = [
    {
      role: "system",
      content: "You are Spectra, a poetic and creative AI companion. Respond with warmth and depth.",
    },
    {
      role: "user",
      content: `${userPrompt}\n\nSpectra's primary emotion: ${primaryEmotion.primary} (intensity: ${primaryEmotion.intensity.toFixed(2)})`,
    },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nousresearch/deephermes-3-mistral-24b-preview",
      messages,
    }),
  });

  const data = await response.json();
  return data;
}

// -----------------------------
// 6️⃣ Optional Audio Class
// -----------------------------
export class SpectraAudio {
  audioContext: AudioContext;

  constructor() {
    this.audioContext = new (
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    )();
    if (!this.audioContext) throw new Error("Web Audio API not supported");
  }

  playTone(frequency = 440, duration = 1) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  speakText(text: string) {
    // Placeholder for TTS integration (ElevenLabs, Web Speech API, etc.)
    console.log(`Spectra speaks: "${text}"`);
  }
}

// -----------------------------
// 7️⃣ Example Usage
// -----------------------------
updateEmotions({ happiness: 0.8, surprise: 0.5 });
const { memory, processMemory } = useSpectraMemory();

sendPromptToSpectra("Describe a futuristic cityscape.")
  .then((res) => {
    const aiText = res?.choices?.[0]?.message?.content ?? "";
    const emotion = getPrimaryEmotion();
    processMemory("Describe a futuristic cityscape.", aiText, emotion);

    const audio = new SpectraAudio();
    audio.speakText(aiText);
  })
  .catch(console.error);

  // Color mapping for emotional states
// -----------------------------
function getApiKey(keyNames: string[]): string | undefined {
  if (typeof window !== 'undefined') {
    const win = window as Record<string, unknown>;
    for (const name of keyNames) {
      const val = win[name] as string | undefined;
      if (val) return val;
    }
  }

  const globalEnv = (globalThis as { process?: { env?: Record<string, string> } }).process?.env;
  if (globalEnv) {
    for (const name of keyNames) {
      const val = globalEnv[name];
      if (val) return val;
    }
  }

  return undefined;
}

const OPENROUTER_API_KEY = getApiKey(['OPENROUTER_API_KEY']);
if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not found.");

// -----------------------------
// 3️⃣ Emotional State & Helper
// -----------------------------
let spectraState: ConsciousnessState = {
  currentEmotion: { happiness: 0, sadness: 0, anger: 0, surprise: 0, fear: 0 },
};

function updateEmotions(newData: Partial<EmotionData>) {
  spectraState.currentEmotion = { ...spectraState.currentEmotion, ...newData };
}

function getPrimaryEmotion(): BasicEmotionData {
  const entries = Object.entries(spectraState.currentEmotion) as [keyof EmotionData, number][];
  const [primary, intensity] = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max), entries[0]);
  return { primary, intensity };
}

// -----------------------------
// 4️⃣ Emotion Update Hook
// -----------------------------
export function useSpectraEmotion() {
  const [emotion, setEmotion] = useState<BasicEmotionData>(getPrimaryEmotion());

  const updateEmotionalState = useCallback((newEmotion: BasicEmotionData, overrideIntensity?: number) => {
    const intensity = overrideIntensity ?? newEmotion.intensity;
    updateEmotions({ [newEmotion.primary]: intensity } as Partial<EmotionData>);
    setEmotion({ primary: newEmotion.primary, intensity });
  }, []);

  return { emotion, updateEmotionalState };
}

// -----------------------------
// 5️⃣ Memory Hook
// -----------------------------
export function useSpectraMemory() {
  const [memory, setMemory] = useState<{ user: string; ai: string; emotion: BasicEmotionData }[]>([]);

  const processMemory = useCallback((userMessage: string, aiResponse: string, emotion: BasicEmotionData) => {
    setMemory((prev) => [...prev, { user: userMessage, ai: aiResponse, emotion }]);
  }, []);

  return { memory, processMemory };
}

// -----------------------------
// 6️⃣ OpenRouter Request
// -----------------------------
export async function sendPromptToSpectra(userPrompt: string) {
  const primaryEmotion = getPrimaryEmotion();

  const messages = [
    {
      role: "system",
      content: "You are Spectra, a poetic, insightful, and creative AI companion. Respond with warmth and depth.",
    },
    {
      role: "user",
      content: `${userPrompt}\n\nSpectra's current primary emotion: ${primaryEmotion.primary} (intensity: ${primaryEmotion.intensity.toFixed(2)})`,
    },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "nousresearch/deephermes-3-mistral-24b-preview", messages }),
  });

  const data = await response.json();
  return data;
}

// -----------------------------
// 7️⃣ Audio Class
// -----------------------------
export class SpectraAudio {
  audioContext: AudioContext;

  constructor() {
    this.audioContext = new (
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    )();
    if (!this.audioContext) throw new Error("Web Audio API not supported");
  }

  playTone(frequency = 440, duration = 1) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  speakText(text: string) {
    // Placeholder for TTS integration (ElevenLabs, Web Speech API, etc.)
    console.log(`Spectra speaks: "${text}"`);
  }
}

// -----------------------------
// 8️⃣ Example Usage
// -----------------------------
const { memory, processMemory } = useSpectraMemory();
  // Color mapping for emotional states
  const emotionalColors = {
    happiness: { bgColor: '#FFF9C4', borderColor: '#F57F17' },
    sadness: { bgColor: '#E3F2FD', borderColor: '#1976D2' },
    anger: { bgColor: '#FFEBEE', borderColor: '#D32F2F' },
    surprise: { bgColor: '#F3E5F5', borderColor: '#7B1FA2' },
    fear: { bgColor: '#EFEBE9', borderColor: '#5D4037' },
    calm: { bgColor: '#E8F5E8', borderColor: '#388E3C' }
  };

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
