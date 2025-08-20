import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Memory Relevant API - Fetch semantically relevant memories
 * GET /api/memory/relevant?query=<text>&sessionId=<id>&limit=<number>
 */

interface Memory {
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

// In-memory fallback storage
const inMemoryMemories = new Map<string, Memory>();

// Initialize Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

class MemoryService {
  async getRelevantMemories(query: string, sessionId?: string, limit: number = 10): Promise<Memory[]> {
    if (supabase) {
      // For now, use text-based search. Later can be enhanced with vector similarity
      let searchQuery = supabase
        .from('conversation_memories')
        .select('*')
        .or(`user_message.ilike.%${query}%,ai_response.ilike.%${query}%`)
        .order('importance', { ascending: false })
        .limit(limit);

      if (sessionId) {
        searchQuery = searchQuery.eq('session_id', sessionId);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return (data || []).map(this.mapDbToMemory);
    } else {
      // Fallback to in-memory storage with simple text matching
      const queryLower = query.toLowerCase();
      const memories = Array.from(inMemoryMemories.values())
        .filter(m => {
          if (sessionId && m.sessionId !== sessionId) return false;
          
          const content = (m.userMessage + ' ' + m.aiResponse).toLowerCase();
          return content.includes(queryLower) || 
                 (m.topics && m.topics.some(topic => topic.toLowerCase().includes(queryLower)));
        })
        .sort((a, b) => b.importance - a.importance)
        .slice(0, limit);
      
      return memories;
    }
  }

  // Simple keyword-based relevance scoring (can be enhanced with embeddings later)
  async getContextualMemories(query: string, sessionId?: string, limit: number = 5): Promise<Memory[]> {
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    if (supabase) {
      // Get recent high-importance memories and keyword matches
      let contextQuery = supabase
        .from('conversation_memories')
        .select('*')
        .gte('importance', 0.6)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to filter down

      if (sessionId) {
        contextQuery = contextQuery.eq('session_id', sessionId);
      }

      const { data, error } = await contextQuery;
      if (error) throw error;

      const memories = (data || []).map(this.mapDbToMemory);
      
      // Score memories based on keyword relevance
      const scoredMemories = memories.map(memory => {
        const content = (memory.userMessage + ' ' + memory.aiResponse).toLowerCase();
        let score = memory.importance;
        
        queryWords.forEach(word => {
          if (content.includes(word)) {
            score += 0.2;
          }
        });
        
        return { memory, score };
      });
      
      return scoredMemories
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.memory);
    } else {
      // Fallback to simple in-memory search
      return this.getRelevantMemories(query, sessionId, limit);
    }
  }

  private mapDbToMemory(dbRow: any): Memory {
    return {
      id: dbRow.memory_id,
      sessionId: dbRow.session_id,
      userMessage: dbRow.user_message,
      aiResponse: dbRow.ai_response,
      emotion: dbRow.emotion,
      importance: dbRow.importance,
      topics: dbRow.topics || [],
      embedding: dbRow.embedding,
      timestamp: dbRow.created_at,
    };
  }
}

const memoryService = new MemoryService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { query, sessionId, limit, contextual } = req.query;

      if (!query) {
        return res.status(400).json({ 
          error: 'Missing required parameter: query' 
        });
      }

      const memoryLimit = limit ? parseInt(limit as string, 10) : 10;

      if (memoryLimit > 50) {
        return res.status(400).json({ 
          error: 'Limit cannot exceed 50 memories' 
        });
      }

      let memories: Memory[];
      
      if (contextual === 'true') {
        memories = await memoryService.getContextualMemories(
          query as string,
          sessionId as string,
          memoryLimit
        );
      } else {
        memories = await memoryService.getRelevantMemories(
          query as string,
          sessionId as string,
          memoryLimit
        );
      }

      return res.status(200).json({ memories, query, resultsCount: memories.length });
    } catch (error) {
      console.error('Memory relevant error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}