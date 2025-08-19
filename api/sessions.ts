import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Session management for conversation persistence
 * Works with Supabase or any PostgreSQL database
 */

interface ConversationSession {
  id: string;
  userId?: string;
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

// Simple in-memory storage for demo (replace with database)
const sessions = new Map<string, ConversationSession>();

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
          // Get specific session
          const session = sessions.get(sessionId as string);
          if (!session) {
            return res.status(404).json({ error: 'Session not found' });
          }
          return res.status(200).json(session);
        } else {
          // List all sessions (in production, filter by user)
          return res.status(200).json(Array.from(sessions.values()));
        }

      case 'POST':
        // Create new session
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: ConversationSession = {
          id: newSessionId,
          userId: req.body.userId,
          messages: [],
          metadata: req.body.metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        sessions.set(newSessionId, newSession);
        return res.status(201).json(newSession);

      case 'PUT':
        // Update session
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }
        const existingSession = sessions.get(sessionId as string);
        if (!existingSession) {
          return res.status(404).json({ error: 'Session not found' });
        }
        
        const updatedSession = {
          ...existingSession,
          ...req.body,
          id: sessionId as string, // Prevent ID change
          updatedAt: new Date().toISOString(),
        };
        sessions.set(sessionId as string, updatedSession);
        return res.status(200).json(updatedSession);

      case 'DELETE':
        // Delete session
        if (!sessionId) {
          return res.status(400).json({ error: 'Session ID required' });
        }
        if (sessions.delete(sessionId as string)) {
          return res.status(204).end();
        } else {
          return res.status(404).json({ error: 'Session not found' });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Session endpoint error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}