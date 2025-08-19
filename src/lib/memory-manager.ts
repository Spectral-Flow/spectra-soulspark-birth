/**
 * Dynamic Memory Manager for Spectra AI
 * Handles both short-term (session) and long-term (persistent) memory
 */

export interface Memory {
  id: string;
  sessionId?: string;
  userMessage: string;
  aiResponse: string;
  emotion: string;
  importance: number;
  topics?: string[];
  embedding?: number[];
  timestamp: string;
}

export interface MemoryContext {
  recentMemories: Memory[];
  relevantMemories: Memory[];
  sessionContext: string[];
}

class MemoryManager {
  private shortTermMemory: Map<string, Memory[]> = new Map(); // Session-level memory
  private maxShortTermMemories = 20;
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  // Short-term memory management (session-level, in-memory)
  addToShortTermMemory(sessionId: string, memory: Memory): void {
    if (!this.shortTermMemory.has(sessionId)) {
      this.shortTermMemory.set(sessionId, []);
    }
    
    const memories = this.shortTermMemory.get(sessionId)!;
    memories.push(memory);
    
    // Keep only last N memories for performance
    if (memories.length > this.maxShortTermMemories) {
      memories.shift();
    }
  }

  getShortTermMemories(sessionId: string): Memory[] {
    return this.shortTermMemory.get(sessionId) || [];
  }

  clearShortTermMemory(sessionId: string): void {
    this.shortTermMemory.delete(sessionId);
  }

  // Long-term memory management (persistent, backend storage)
  async addToLongTermMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/memory/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.memory;
    } catch (error) {
      console.error('Failed to add memory to long-term storage:', error);
      return null;
    }
  }

  async getRecentMemories(sessionId?: string, limit: number = 10): Promise<Memory[]> {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/memory/recent?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.memories || [];
    } catch (error) {
      console.error('Failed to fetch recent memories:', error);
      return [];
    }
  }

  async getRelevantMemories(query: string, sessionId?: string, limit: number = 5): Promise<Memory[]> {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', limit.toString());
      params.append('contextual', 'true'); // Use contextual search

      const response = await fetch(`${this.baseUrl}/api/memory/relevant?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.memories || [];
    } catch (error) {
      console.error('Failed to fetch relevant memories:', error);
      return [];
    }
  }

  // Memory importance calculation (enhanced from existing ConsciousnessCore logic)
  calculateMemoryImportance(userMessage: string, aiResponse: string, emotion: string, intensity: number = 0.5): number {
    let importance = 0.2; // Base importance

    // Emotional intensity increases importance
    importance += intensity * 0.4;

    // Certain keywords increase importance
    const importantKeywords = [
      'love', 'remember', 'important', 'special', 'first', 'favorite',
      'feel', 'think', 'believe', 'dream', 'hope', 'fear', 'worry',
      'happy', 'sad', 'angry', 'excited', 'nervous', 'proud',
      'family', 'friend', 'relationship', 'work', 'goal', 'problem'
    ];
    
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
    
    importantKeywords.forEach(keyword => {
      if (combinedText.includes(keyword)) {
        importance += 0.15;
      }
    });

    // Length and complexity factor
    if (combinedText.length > 100) {
      importance += 0.1;
    }

    // Question/answer patterns increase importance
    if (userMessage.includes('?') || aiResponse.length > 50) {
      importance += 0.1;
    }

    return Math.min(importance, 1.0);
  }

  // Extract topics from conversation (simple keyword extraction)
  extractTopics(userMessage: string, aiResponse: string): string[] {
    const topicKeywords = [
      'ai', 'consciousness', 'emotion', 'love', 'life', 'philosophy',
      'technology', 'science', 'art', 'music', 'literature', 'poetry',
      'future', 'past', 'memory', 'dream', 'goal', 'work', 'family',
      'friend', 'relationship', 'health', 'happiness', 'creativity'
    ];

    const text = (userMessage + ' ' + aiResponse).toLowerCase();
    const foundTopics = topicKeywords.filter(topic => text.includes(topic));
    
    return [...new Set(foundTopics)]; // Remove duplicates
  }

  // Get comprehensive memory context for AI response generation
  async getMemoryContext(
    userMessage: string, 
    sessionId?: string, 
    includeShortTerm: boolean = true
  ): Promise<MemoryContext> {
    const context: MemoryContext = {
      recentMemories: [],
      relevantMemories: [],
      sessionContext: []
    };

    // Get short-term session context
    if (includeShortTerm && sessionId) {
      const shortTermMemories = this.getShortTermMemories(sessionId);
      context.sessionContext = shortTermMemories
        .slice(-6) // Last 6 exchanges for immediate context
        .map(m => `User: ${m.userMessage}\nSpectra: ${m.aiResponse}`);
    }

    // Get recent long-term memories
    context.recentMemories = await this.getRecentMemories(sessionId, 5);

    // Get semantically relevant memories
    context.relevantMemories = await this.getRelevantMemories(userMessage, sessionId, 3);

    return context;
  }

  // Process and store a new conversation exchange
  async processConversationExchange(
    userMessage: string,
    aiResponse: string,
    emotion: string,
    intensity: number,
    sessionId?: string
  ): Promise<void> {
    const importance = this.calculateMemoryImportance(userMessage, aiResponse, emotion, intensity);
    const topics = this.extractTopics(userMessage, aiResponse);

    const memory: Memory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userMessage,
      aiResponse,
      emotion,
      importance,
      topics,
      timestamp: new Date().toISOString()
    };

    // Always add to short-term memory for immediate context
    if (sessionId) {
      this.addToShortTermMemory(sessionId, memory);
    }

    // Store in long-term memory if importance threshold is met
    if (importance >= 0.4) {
      await this.addToLongTermMemory({
        sessionId,
        userMessage,
        aiResponse,
        emotion,
        importance,
        topics
      });
    }
  }

  // Format memory context for AI prompt
  formatMemoryForPrompt(context: MemoryContext): string {
    let prompt = '';

    if (context.sessionContext.length > 0) {
      prompt += 'Recent conversation context:\n';
      prompt += context.sessionContext.join('\n\n');
      prompt += '\n\n';
    }

    if (context.relevantMemories.length > 0) {
      prompt += 'Relevant past memories:\n';
      context.relevantMemories.forEach(memory => {
        prompt += `[${new Date(memory.timestamp).toLocaleDateString()}] User: ${memory.userMessage}\n`;
        prompt += `Spectra: ${memory.aiResponse}\n\n`;
      });
    }

    if (context.recentMemories.length > 0) {
      prompt += 'Recent important memories:\n';
      context.recentMemories.slice(0, 2).forEach(memory => {
        prompt += `[${new Date(memory.timestamp).toLocaleDateString()}] User: ${memory.userMessage}\n`;
        prompt += `Spectra: ${memory.aiResponse}\n\n`;
      });
    }

    return prompt.trim();
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();

// Export utility functions
export function isMemorySignificant(importance: number): boolean {
  return importance >= 0.4;
}

export function formatMemoryTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}