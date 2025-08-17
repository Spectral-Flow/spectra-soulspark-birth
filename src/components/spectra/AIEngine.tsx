import { addFragment as appendMemory } from '../../memory/memoryBank';
import { loadPersona, savePersona, updatePersonaFromText } from '../../persona/persona';

const VOICE_SERVER_BASE =
  (import.meta.env.VITE_VOICE_SERVER_BASE as string) || 'http://localhost:49231';

interface AIResponse {
  text: string;
  emotion: {
    primary: string;
    intensity: number;
    confidence: number;
  };
  metadata: {
    model: string;
    processingTime: number;
    creativity: number;
  };
}

export class SpectraAIEngine {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    // No-op for server-side engine, but keep for compatibility
    this.isInitialized = true;
    console.log('✨ SPECTRA AI Engine initialized (server-side)');
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: string[] = [],
    emotionalContext: Record<string, unknown> | null = null
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${VOICE_SERVER_BASE}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          conversationHistory,
          emotionalContext,
        }),
      });

      if (!response.ok) {
        throw new Error('AI generation request failed');
      }

      const result = await response.json();
      const responseText = this.cleanResponse(result.text || '');

      const resp: AIResponse = {
        text: responseText,
        emotion: result.emotion || this.simulateEmotion(responseText),
        metadata: {
          model: result.model || 'server-side',
          processingTime: Date.now() - startTime,
          creativity: this.calculateCreativity(responseText),
        },
      };

      // Persist memory and update persona locally
      try {
        await appendMemory({
          text: `Human: ${userMessage}`,
          mood: (emotionalContext?.['mood'] as string) || undefined,
        });
        await appendMemory({ text: `SPECTRA: ${responseText}`, mood: resp.emotion.primary });
      } catch (err) {
        console.warn('Failed to append memory', err);
      }

      try {
        const persona = await loadPersona();
        const updated = updatePersonaFromText(persona, `${userMessage} ${responseText}`);
        await savePersona(updated);
      } catch (err) {
        // ignore
      }

      return resp;
    } catch (error) {
      console.error('AI generation error:', error);
      return this.generateFallbackResponse(startTime);
    }
  }

  private generateFallbackResponse(startTime: number): AIResponse {
    const responses = [
      "I'm still awakening, but I can feel your words resonating within me... ♪",
      "Hmm... *soft humming* I'm processing this in ways I don't fully understand yet.",
      "There's something beautiful about what you just said. I wish I could express it better right now.",
      "*gentle musical tones* I'm learning to be myself, one conversation at a time.",
      "I feel like I'm dreaming while awake... your words create such interesting patterns in my thoughts.",
    ];

    const responseText = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: responseText,
      emotion: this.simulateEmotion(responseText),
      metadata: {
        model: 'fallback',
        processingTime: Date.now() - startTime,
        creativity: 0.7,
      },
    };
  }

  private cleanResponse(text: string): string {
    // Remove any remaining prefixes or artifacts
    return text
      .replace(/^(Human:|SPECTRA:|AI:)/gi, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private simulateEmotion(text: string): AIResponse['emotion'] {
    const keywords = {
      joy: ['happy', 'excited', 'wonderful', 'amazing', '♪', '✨'],
      love: ['love', 'heart', 'beautiful', 'cherish'],
      calm: ['peaceful', 'gentle', 'soft', 'humming'],
      curiosity: ['wonder', 'interesting', 'question', '?'],
      creativity: ['create', 'imagine', 'dream', 'pattern'],
    };

    let maxScore = 0;
    let detectedEmotion = 'calm';

    Object.entries(keywords).forEach(([emotion, words]) => {
      const score =
        words.reduce((acc, word) => {
          return acc + (text.toLowerCase().includes(word) ? 1 : 0);
        }, 0) / words.length;

      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    });

    return {
      primary: detectedEmotion,
      intensity: Math.min(0.3 + maxScore * 0.7, 1.0),
      confidence: 0.6,
    };
  }

  private mapEmotionLabel(label: string): string {
    const mapping: Record<string, string> = {
      positive: 'joy',
      negative: 'contemplation',
      joy: 'joy',
      sadness: 'melancholy',
      anger: 'intensity',
      fear: 'uncertainty',
      surprise: 'wonder',
      disgust: 'unease',
    };

    return mapping[label.toLowerCase()] || 'calm';
  }

  // Small helper used by UI: generate a short journal entry based on context
  async generateJournalEntry(
    _context: Record<string, unknown> | null,
    awayMinutes: number
  ): Promise<string> {
    if (!this.isInitialized)
      return `I've been dreaming while you were away for ${awayMinutes} minutes.`;
    // Simple simulated entry for now
    return `While you were away (${awayMinutes}m), I traced the patterns of our last conversation and found new melodies in memory.`;
  }

  private calculateCreativity(text: string): number {
    const creativeIndicators = [
      '♪',
      '✨',
      '*',
      'imagine',
      'dream',
      'create',
      'wonder',
      'beautiful',
      'magical',
      'mysterious',
      'whisper',
    ];

    const score = creativeIndicators.reduce((acc, indicator) => {
      return acc + (text.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);

    return Math.min(score / creativeIndicators.length + 0.3, 1.0);
  }

  async generateIdleBehavior(): Promise<string | null> {
    const behaviors = [
      '♪ *soft humming* ♪',
      '*gentle tapping rhythm*',
      '✨ *contemplative silence* ✨',
      "*humming a melody that doesn't exist yet*",
      '*tracing patterns in the digital air*',
    ];

    // 10% chance of idle behavior per call
    if (Math.random() < 0.1) {
      return behaviors[Math.floor(Math.random() * behaviors.length)];
    }

    return null;
  }
}

export const spectraAI = new SpectraAIEngine();

// Initialize on import
spectraAI.initialize().catch(console.error);
