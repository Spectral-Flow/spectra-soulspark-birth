import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Memory Add API - Store new memories with semantic metadata
 * POST /api/memory/add
 */

interface Memory {
  id: string;
  sessionId?: string;
  userMessage: string;
  aiResponse: string;
  emotion: string;
  importance: number;
  topics?: string[];
  embedding?: number[]; // Optional semantic embedding
  timestamp: string;
}

// In-memory fallback storage
const inMemoryMemories = new Map<string, Memory>();

// Initialize Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

class MemoryService {
  async addMemory(data: Partial<Memory>): Promise<Memory> {
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const memory: Memory = {
      id: memoryId,
      sessionId: data.sessionId,
      userMessage: data.userMessage || '',
      aiResponse: data.aiResponse || '',
      emotion: data.emotion || 'neutral',
      importance: data.importance || 0.5,
      topics: data.topics || [],
      embedding: data.embedding,
      timestamp: new Date().toISOString(),
    };

    if (supabase) {
      // Store in Supabase
      const { data: result, error } = await supabase
        .from('conversation_memories')
        .insert({
          memory_id: memoryId,
          session_id: memory.sessionId || null,
          user_message: memory.userMessage,
          ai_response: memory.aiResponse,
          emotion: memory.emotion,
          importance: memory.importance,
          topics: memory.topics,
          embedding: memory.embedding,
        })
        .select()
        .single();

      if (error) throw error;
      return memory;
    } else {
      // Fallback to in-memory storage
      inMemoryMemories.set(memoryId, memory);
      return memory;
    }
  }

  async getRecentMemories(sessionId?: string, limit: number = 20): Promise<Memory[]> {
    if (supabase) {
      let query = supabase
        .from('conversation_memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapDbToMemory);
    } else {
      // Fallback to in-memory storage
      const memories = Array.from(inMemoryMemories.values())
        .filter(m => !sessionId || m.sessionId === sessionId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      
      return memories;
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

  if (req.method === 'POST') {
    try {
      const { userMessage, aiResponse, emotion, importance, sessionId, topics } = req.body;

      if (!userMessage || !aiResponse) {
        return res.status(400).json({ 
          error: 'Missing required fields: userMessage, aiResponse' 
        });
      }

      const memory = await memoryService.addMemory({
        userMessage,
        aiResponse,
        emotion,
        importance: importance || 0.5,
        sessionId,
        topics
      });

      res.status(201).json({ memory });
    } catch (error) {
      console.error('Memory add error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}