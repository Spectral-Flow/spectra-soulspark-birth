import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Memory Recent API - Fetch recent conversation memories
 * GET /api/memory/recent?sessionId=<id>&limit=<number>
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

  if (req.method === 'GET') {
    try {
      const { sessionId, limit } = req.query;
      const memoryLimit = limit ? parseInt(limit as string, 10) : 20;

      if (memoryLimit > 100) {
        return res.status(400).json({ 
          error: 'Limit cannot exceed 100 memories' 
        });
      }

      const memories = await memoryService.getRecentMemories(
        sessionId as string,
        memoryLimit
      );

      res.status(200).json({ memories });
    } catch (error) {
      console.error('Memory recent error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}