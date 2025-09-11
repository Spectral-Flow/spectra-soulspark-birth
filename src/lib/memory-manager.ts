/**
 * Dynamic Memory Manager for Spectra AI
 * Handles both short-term (session) and long-term (persistent) memory
 */

export interface Memory {
  id: string;
  sessionId: string | undefined;
  userMessage: string;
  aiResponse: string;
  emotion: string;
  importance: number;
  topics: string[] | undefined;
  embedding: number[] | undefined;
  timestamp: string;
}

export interface MemoryContext {
  recentMemories: Memory[];
  relevantMemories: Memory[];
  sessionContext: string[];
}

export interface MemoryAnalytics {
  totalMemories: number;
  averageImportance: number;
  significantMemories: number;
  topTopics: { topic: string; count: number; importance: number }[];
  emotionDistribution: { emotion: string; count: number; avgIntensity: number }[];
  conversationTrends: {
    period: string;
    memoryCount: number;
    avgImportance: number;
  }[];
  memoryTimeline: {
    date: string;
    memories: Memory[];
    importance: number;
  }[];
}

export interface MemoryExportData {
  exportDate: string;
  sessionId?: string;
  memories: Memory[];
  analytics: MemoryAnalytics;
  metadata: {
    version: string;
    totalSize: number;
    exportType: 'full' | 'session' | 'filtered';
  };
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
      const response = await fetch(`${this.baseUrl}/api/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'add',
          ...memory
        }),
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
      params.append('operation', 'recent');
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/api/memory?${params}`);
      
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
      params.append('operation', 'relevant');
      params.append('query', query);
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', limit.toString());
      params.append('contextual', 'true'); // Use contextual search

      const response = await fetch(`${this.baseUrl}/api/memory?${params}`);
      
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
      sessionId: sessionId ?? undefined,
      userMessage,
      aiResponse,
      emotion,
      importance,
      topics: topics ?? undefined,
      embedding: undefined,
      timestamp: new Date().toISOString()
    };

    // Always add to short-term memory for immediate context
    if (sessionId) {
      this.addToShortTermMemory(sessionId, memory);
    }

    // Store in long-term memory if importance threshold is met
    if (importance >= 0.4) {
      await this.addToLongTermMemory({
        sessionId: sessionId ?? undefined,
        userMessage,
        aiResponse,
        emotion,
        importance,
        topics: topics ?? undefined,
        embedding: undefined
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

  // Enhanced Analytics Methods
  async generateMemoryAnalytics(sessionId?: string): Promise<MemoryAnalytics> {
    try {
      // Get all memories for analysis
      const recentMemories = await this.getRecentMemories(sessionId, 100);
      const shortTermMemories = sessionId ? this.getShortTermMemories(sessionId) : [];
      const allMemories = [...recentMemories, ...shortTermMemories];

      // Basic statistics
      const totalMemories = allMemories.length;
      const totalImportance = allMemories.reduce((sum, m) => sum + m.importance, 0);
      const averageImportance = totalMemories > 0 ? totalImportance / totalMemories : 0;
      const significantMemories = allMemories.filter(m => isMemorySignificant(m.importance)).length;

      // Topic analysis
      const topicCount: Record<string, { count: number; totalImportance: number }> = {};
      allMemories.forEach(memory => {
        if (memory.topics) {
          memory.topics.forEach(topic => {
            if (!topicCount[topic]) {
              topicCount[topic] = { count: 0, totalImportance: 0 };
            }
            topicCount[topic].count++;
            topicCount[topic].totalImportance += memory.importance;
          });
        }
      });

      const topTopics = Object.entries(topicCount)
        .map(([topic, data]) => ({
          topic,
          count: data.count,
          importance: data.totalImportance / data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Emotion distribution
      const emotionCount: Record<string, { count: number; totalIntensity: number }> = {};
      allMemories.forEach(memory => {
        if (!emotionCount[memory.emotion]) {
          emotionCount[memory.emotion] = { count: 0, totalIntensity: 0 };
        }
        emotionCount[memory.emotion].count++;
        emotionCount[memory.emotion].totalIntensity += memory.importance; // Using importance as intensity proxy
      });

      const emotionDistribution = Object.entries(emotionCount)
        .map(([emotion, data]) => ({
          emotion,
          count: data.count,
          avgIntensity: data.totalIntensity / data.count
        }))
        .sort((a, b) => b.count - a.count);

      // Conversation trends (last 7 days)
      const now = new Date();
      const conversationTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const dayMemories = allMemories.filter(m => {
          const memDate = new Date(m.timestamp);
          return memDate >= dayStart && memDate <= dayEnd;
        });

        conversationTrends.push({
          period: date.toLocaleDateString(),
          memoryCount: dayMemories.length,
          avgImportance: dayMemories.length > 0 
            ? dayMemories.reduce((sum, m) => sum + m.importance, 0) / dayMemories.length 
            : 0
        });
      }

      // Memory timeline (group by day)
      const timelineMap: Record<string, { memories: Memory[]; importance: number }> = {};
      allMemories.forEach(memory => {
        const date = new Date(memory.timestamp).toLocaleDateString();
        if (!timelineMap[date]) {
          timelineMap[date] = { memories: [], importance: 0 };
        }
        timelineMap[date].memories.push(memory);
        timelineMap[date].importance += memory.importance;
      });

      const memoryTimeline = Object.entries(timelineMap)
        .map(([date, data]) => ({
          date,
          memories: data.memories,
          importance: data.importance / data.memories.length
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Last 30 days

      return {
        totalMemories,
        averageImportance,
        significantMemories,
        topTopics,
        emotionDistribution,
        conversationTrends,
        memoryTimeline
      };
    } catch (error) {
      console.error('Error generating memory analytics:', error);
      return {
        totalMemories: 0,
        averageImportance: 0,
        significantMemories: 0,
        topTopics: [],
        emotionDistribution: [],
        conversationTrends: [],
        memoryTimeline: []
      };
    }
  }

  // Memory Export/Import Methods
  async exportMemories(
    sessionId?: string, 
    exportType: 'full' | 'session' | 'filtered' = 'session'
  ): Promise<MemoryExportData> {
    try {
      let memories: Memory[] = [];
      
      switch (exportType) {
        case 'full':
          memories = await this.getRecentMemories(undefined, 1000);
          break;
        case 'session':
          if (sessionId) {
            const recent = await this.getRecentMemories(sessionId, 100);
            const shortTerm = this.getShortTermMemories(sessionId);
            memories = [...recent, ...shortTerm];
          }
          break;
        case 'filtered':
          memories = await this.getRecentMemories(sessionId, 100);
          memories = memories.filter(m => isMemorySignificant(m.importance));
          break;
      }

      const analytics = await this.generateMemoryAnalytics(sessionId);
      const totalSize = JSON.stringify(memories).length;

      return {
        exportDate: new Date().toISOString(),
        sessionId,
        memories,
        analytics,
        metadata: {
          version: '1.0.0',
          totalSize,
          exportType
        }
      };
    } catch (error) {
      console.error('Error exporting memories:', error);
      throw new Error(`Failed to export memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importMemories(exportData: MemoryExportData): Promise<{ imported: number; skipped: number }> {
    try {
      let imported = 0;
      let skipped = 0;

      for (const memory of exportData.memories) {
        try {
          // Check if memory already exists (basic duplicate detection)
          const existing = await this.getRecentMemories(memory.sessionId, 1000);
          const isDuplicate = existing.some(m => 
            m.userMessage === memory.userMessage && 
            m.aiResponse === memory.aiResponse &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(memory.timestamp).getTime()) < 60000 // 1 minute tolerance
          );

          if (!isDuplicate && isMemorySignificant(memory.importance)) {
            await this.addToLongTermMemory({
              sessionId: memory.sessionId,
              userMessage: memory.userMessage,
              aiResponse: memory.aiResponse,
              emotion: memory.emotion,
              importance: memory.importance,
              topics: memory.topics,
              embedding: memory.embedding
            });
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error('Error importing memory:', error);
          skipped++;
        }
      }

      return { imported, skipped };
    } catch (error) {
      console.error('Error importing memories:', error);
      throw new Error(`Failed to import memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced semantic search with better scoring
  async getEnhancedRelevantMemories(
    query: string, 
    sessionId?: string, 
    limit: number = 5,
    minImportance: number = 0.3
  ): Promise<Memory[]> {
    try {
      const memories = await this.getRecentMemories(sessionId, 100);
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      const scoredMemories = memories
        .filter(memory => memory.importance >= minImportance)
        .map(memory => {
          let score = 0;
          const memoryText = `${memory.userMessage} ${memory.aiResponse}`.toLowerCase();
          
          // Keyword matching with position weighting
          queryWords.forEach(word => {
            const userIndex = memory.userMessage.toLowerCase().indexOf(word);
            const aiIndex = memory.aiResponse.toLowerCase().indexOf(word);
            
            if (userIndex !== -1) score += 2; // User message match is more important
            if (aiIndex !== -1) score += 1;
            
            // Boost score for exact phrase matches
            if (memoryText.includes(query.toLowerCase())) score += 3;
          });
          
          // Topic relevance boost
          if (memory.topics) {
            const topicMatch = memory.topics.some(topic => 
              queryWords.some(word => topic.toLowerCase().includes(word))
            );
            if (topicMatch) score += 2;
          }
          
          // Importance and recency weighting
          score *= memory.importance;
          const daysSince = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          const recencyBoost = Math.max(0.1, 1 - (daysSince / 30)); // Decay over 30 days
          score *= recencyBoost;
          
          return { memory, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.memory);

      return scoredMemories;
    } catch (error) {
      console.error('Error getting enhanced relevant memories:', error);
      return this.getRelevantMemories(query, sessionId, limit); // Fallback to original method
    }
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