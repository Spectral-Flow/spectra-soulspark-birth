import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Database service abstraction
 * Supports both in-memory storage and Supabase
 */

interface ConversationSession {
  id: string;
  userId?: string;
  sessionKey: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  metadata: {
    voiceService?: 'elevenlabs' | 'openai' | 'webspeech';
    mood?: string;
    topics?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback storage
const inMemorySessions = new Map<string, ConversationSession>();

// Initialize Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

class DatabaseService {
  async createSession(data: Partial<ConversationSession>): Promise<ConversationSession> {
    const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ConversationSession = {
      id: sessionKey,
      sessionKey,
      userId: data.userId,
      messages: data.messages || [],
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (supabase) {
      const { data: result, error } = await supabase
        .from('conversation_sessions')
        .insert({
          session_key: sessionKey,
          user_id: data.userId || null,
          messages: session.messages,
          metadata: session.metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...session,
        id: result.id,
      };
    } else {
      // Fallback to in-memory storage
      inMemorySessions.set(sessionKey, session);
      return session;
    }
  }

  async getSession(sessionId: string): Promise<ConversationSession | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .or(`id.eq.${sessionId},session_key.eq.${sessionId}`)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        sessionKey: data.session_key,
        userId: data.user_id,
        messages: data.messages || [],
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      // Fallback to in-memory storage
      return inMemorySessions.get(sessionId) || null;
    }
  }

  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<ConversationSession | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .update({
          messages: updates.messages,
          metadata: updates.metadata,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${sessionId},session_key.eq.${sessionId}`)
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        sessionKey: data.session_key,
        userId: data.user_id,
        messages: data.messages || [],
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } else {
      // Fallback to in-memory storage
      const existing = inMemorySessions.get(sessionId);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...updates,
        id: sessionId,
        updatedAt: new Date().toISOString(),
      };
      inMemorySessions.set(sessionId, updated);
      return updated;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('conversation_sessions')
        .delete()
        .or(`id.eq.${sessionId},session_key.eq.${sessionId}`);

      return !error;
    } else {
      // Fallback to in-memory storage
      return inMemorySessions.delete(sessionId);
    }
  }

  async listSessions(userId?: string): Promise<ConversationSession[]> {
    if (supabase) {
      let query = supabase.from('conversation_sessions').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        sessionKey: item.session_key,
        userId: item.user_id,
        messages: item.messages || [],
        metadata: item.metadata || {},
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } else {
      // Fallback to in-memory storage
      const sessions = Array.from(inMemorySessions.values());
      return userId ? sessions.filter(s => s.userId === userId) : sessions;
    }
  }
}

const db = new DatabaseService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sessionId } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        if (sessionId) {
          const session = await db.getSession(sessionId as string);
          if (!session) {
            return res.status(404).json({ error: 'Session not found' });
          }
          return res.status(200).json(session);
        } else {
          const sessions = await db.listSessions(req.body?.userId);
          return res.status(200).json(sessions);
        }

      case 'POST':
        const newSession = await db.createSession(req.body);
        return res.status(201).json(newSession);

      case 'PUT':
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }
        const updatedSession = await db.updateSession(sessionId as string, req.body);
        if (!updatedSession) {
          return res.status(404).json({ error: 'Session not found' });
        }
        return res.status(200).json(updatedSession);

      case 'DELETE':
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }
        const deleted = await db.deleteSession(sessionId as string);
        if (deleted) {
          return res.status(204).end();
        } else {
          return res.status(404).json({ error: 'Session not found' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database sessions endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}