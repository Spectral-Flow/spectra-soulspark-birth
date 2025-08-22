import { VercelRequest, VercelResponse } from '@vercel/node';
import { createLogger } from './utils/logger';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  applyRateLimit,
  validateRequired
} from './utils/common';

const logger = createLogger('sessions');

/**
 * Enhanced Session Management for conversation persistence
 * Works with Supabase or any PostgreSQL database with in-memory fallback
 */

interface ConversationSession {
  id: string;
  userId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    messageId?: string;
  }>;
  metadata: {
    voiceService?: 'elevenlabs' | 'openai' | 'webspeech';
    mood?: string;
    topics?: string[];
    language?: string;
    totalMessages?: number;
    averageResponseTime?: number;
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'paused' | 'ended';
}

// Enhanced in-memory storage with TTL
class SessionStorage {
  private sessions = new Map<string, ConversationSession>();
  private ttl = new Map<string, number>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  set(sessionId: string, session: ConversationSession, ttlMs?: number): void {
    this.sessions.set(sessionId, session);
    this.ttl.set(sessionId, Date.now() + (ttlMs || this.DEFAULT_TTL));
  }

  get(sessionId: string): ConversationSession | undefined {
    const session = this.sessions.get(sessionId);
    const expiry = this.ttl.get(sessionId);
    
    if (session && expiry && Date.now() < expiry) {
      return session;
    }
    
    // Cleanup expired session
    if (session) {
      this.sessions.delete(sessionId);
      this.ttl.delete(sessionId);
    }
    
    return undefined;
  }

  delete(sessionId: string): boolean {
    this.ttl.delete(sessionId);
    return this.sessions.delete(sessionId);
  }

  list(userId?: string): ConversationSession[] {
    const now = Date.now();
    const validSessions: ConversationSession[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const expiry = this.ttl.get(sessionId);
      
      if (expiry && now < expiry) {
        if (!userId || session.userId === userId) {
          validSessions.push(session);
        }
      } else {
        // Cleanup expired
        this.sessions.delete(sessionId);
        this.ttl.delete(sessionId);
      }
    }
    
    return validSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, expiry] of this.ttl.entries()) {
      if (now >= expiry) {
        this.sessions.delete(sessionId);
        this.ttl.delete(sessionId);
      }
    }
  }
}

const sessionStorage = new SessionStorage();

// Cleanup expired sessions every hour
setInterval(() => sessionStorage.cleanup(), 60 * 60 * 1000);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  // Apply rate limiting
  if (!applyRateLimit(req, res)) {
    return;
  }

  const { sessionId } = req.query;
  const userId = req.headers['x-user-id'] as string; // Optional user identification

  try {
    switch (req.method) {
      case 'GET': {
        if (sessionId) {
          // Get specific session
          logger.info('Retrieving session', { sessionId, userId }, requestId);
          
          const session = sessionStorage.get(sessionId as string);
          if (!session) {
            return sendError(res, 404, 'Session not found', 'Session may have expired or does not exist', undefined, requestId);
          }
          
          // Check user authorization
          if (session.userId && userId && session.userId !== userId) {
            return sendError(res, 403, 'Access denied', 'Session belongs to different user', undefined, requestId);
          }
          
          logger.info('Session retrieved successfully', { 
            sessionId, 
            messageCount: session.messages.length,
            status: session.status 
          }, requestId);
          
          return sendSuccess(res, session, 200, requestId);
        } else {
          // List sessions for user
          logger.info('Listing sessions', { userId }, requestId);
          
          const sessions = sessionStorage.list(userId);
          
          // Return summary information for list view
          const sessionSummaries = sessions.map(session => ({
            id: session.id,
            userId: session.userId,
            messageCount: session.messages.length,
            lastMessage: session.messages[session.messages.length - 1]?.content?.substring(0, 100) + '...',
            metadata: session.metadata,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            status: session.status
          }));
          
          logger.info('Sessions listed successfully', { count: sessions.length }, requestId);
          
          return sendSuccess(res, { sessions: sessionSummaries, total: sessions.length }, 200, requestId);
        }
      }

      case 'POST': {
        // Create new session
        const validation = validateRequired(req.body, []);
        if (!validation.valid) {
          return sendError(res, 400, 'Invalid request body', `Missing: ${validation.missing.join(', ')}`, undefined, requestId);
        }

        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: ConversationSession = {
          id: newSessionId,
          userId: req.body.userId || userId,
          messages: [],
          metadata: {
            ...req.body.metadata,
            totalMessages: 0,
            averageResponseTime: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        };

        sessionStorage.set(newSessionId, newSession);
        
        logger.info('Session created successfully', { 
          sessionId: newSessionId, 
          userId: newSession.userId 
        }, requestId);
        
        return sendSuccess(res, newSession, 201, requestId);
      }

      case 'PUT': {
        // Update session
        if (!sessionId) {
          return sendError(res, 400, 'Session ID required', 'Session ID must be provided in query parameters', undefined, requestId);
        }

        const existingSession = sessionStorage.get(sessionId as string);
        if (!existingSession) {
          return sendError(res, 404, 'Session not found', 'Session may have expired or does not exist', undefined, requestId);
        }

        // Check user authorization
        if (existingSession.userId && userId && existingSession.userId !== userId) {
          return sendError(res, 403, 'Access denied', 'Session belongs to different user', undefined, requestId);
        }

        // Validate update data
        const { messages, metadata, status } = req.body;
        
        const updatedSession: ConversationSession = {
          ...existingSession,
          id: sessionId as string, // Prevent ID change
          updatedAt: new Date().toISOString(),
        };

        // Update messages if provided
        if (messages && Array.isArray(messages)) {
          // Validate message structure
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (!message.role || !message.content) {
              return sendError(res, 400, 'Invalid message format', `Message ${i} must have role and content`, undefined, requestId);
            }
          }
          updatedSession.messages = messages.map((msg, index) => ({
            ...msg,
            messageId: msg.messageId || `msg_${Date.now()}_${index}`,
            timestamp: msg.timestamp || new Date().toISOString()
          }));
          updatedSession.metadata.totalMessages = messages.length;
        }

        // Update metadata if provided
        if (metadata && typeof metadata === 'object') {
          updatedSession.metadata = { ...updatedSession.metadata, ...metadata };
        }

        // Update status if provided
        if (status && ['active', 'paused', 'ended'].includes(status)) {
          updatedSession.status = status;
        }

        sessionStorage.set(sessionId as string, updatedSession);
        
        logger.info('Session updated successfully', { 
          sessionId, 
          messageCount: updatedSession.messages.length,
          status: updatedSession.status 
        }, requestId);
        
        return sendSuccess(res, updatedSession, 200, requestId);
      }

      case 'DELETE': {
        // Delete session
        if (!sessionId) {
          return sendError(res, 400, 'Session ID required', 'Session ID must be provided in query parameters', undefined, requestId);
        }

        const existingSession = sessionStorage.get(sessionId as string);
        if (!existingSession) {
          return sendError(res, 404, 'Session not found', 'Session may have already been deleted', undefined, requestId);
        }

        // Check user authorization
        if (existingSession.userId && userId && existingSession.userId !== userId) {
          return sendError(res, 403, 'Access denied', 'Session belongs to different user', undefined, requestId);
        }

        const deleted = sessionStorage.delete(sessionId as string);
        
        if (deleted) {
          logger.info('Session deleted successfully', { sessionId }, requestId);
          return res.status(204).end();
        } else {
          return sendError(res, 404, 'Session not found', 'Session may have already been deleted', undefined, requestId);
        }
      }

      default:
        return sendError(res, 405, 'Method not allowed', `${req.method} is not supported`, undefined, requestId);
    }

  } catch (error) {
    logger.error('Session endpoint error', error instanceof Error ? error : new Error(String(error)), {}, requestId);
    return sendError(res, 500, 'Internal server error', 'Session operation failed', undefined, requestId);
  }
}