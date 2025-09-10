import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createLogger } from './utils/logger';
import { 
  handlePreflight, 
  sendSuccess, 
  sendError,
  generateRequestId,
  validateRequired
} from './utils/common';

const logger = createLogger('unified-memory');

interface Memory {
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

// In-memory fallback storage
const inMemoryMemories = new Map<string, Memory>();

// Initialize Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

/**
 * Unified Memory API
 * Handles memory operations: add, recent, relevant
 * Supports both Supabase and in-memory fallback storage
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;

  try {
    const method = req.method;
    let operation: string;
    let requestData: any;

    if (method === 'POST') {
      // POST requests have operation in body
      requestData = req.body;
      operation = requestData.operation;
    } else if (method === 'GET') {
      // GET requests use query parameters
      const { operation: op, ...queryParams } = req.query;
      operation = op as string;
      requestData = { operation, ...queryParams };
    } else {
      return sendError(res, 405, 'Method not allowed', 'Only GET and POST methods are supported', undefined, requestId);
    }

    if (!operation) {
      return sendError(res, 400, 'Missing operation', 'Operation parameter is required (add, recent, relevant)', undefined, requestId);
    }

    logger.info(`Memory ${operation} request initiated`, { method }, requestId);

    const memoryService = new MemoryService();

    switch (operation) {
      case 'add':
        if (method !== 'POST') {
          return sendError(res, 405, 'Method not allowed', 'Add operation requires POST method', undefined, requestId);
        }
        return await handleAddMemory(memoryService, requestData, res, requestId);
      
      case 'recent':
        return await handleRecentMemories(memoryService, requestData, res, requestId);
      
      case 'relevant':
        return await handleRelevantMemories(memoryService, requestData, res, requestId);
      
      default:
        return sendError(res, 400, 'Invalid operation', `Unsupported operation: ${operation}`, undefined, requestId);
    }

  } catch (error) {
    logger.error('Unified memory API error', error, undefined, requestId);
    return sendError(res, 500, 'Internal server error', 'An unexpected error occurred', error, requestId);
  }
}

// Handle add memory operation
async function handleAddMemory(memoryService: MemoryService, data: any, res: VercelResponse, requestId: string) {
  const { sessionId, userMessage, aiResponse, emotion = 'neutral', importance = 5, topics = [], embedding } = data;

  // Validate required fields for add
  const validation = validateRequired({ userMessage, aiResponse }, ['userMessage', 'aiResponse']);
  if (!validation.valid) {
    return sendError(res, 400, 'Missing required fields', validation.missing?.join(', '), undefined, requestId);
  }

  // Validate importance range
  if (typeof importance !== 'number' || importance < 1 || importance > 10) {
    return sendError(res, 400, 'Invalid importance', 'Importance must be a number between 1 and 10', undefined, requestId);
  }

  try {
    const memory = await memoryService.addMemory({
      sessionId,
      userMessage,
      aiResponse,
      emotion,
      importance,
      topics,
      embedding
    });

    logger.info('Memory added successfully', { memoryId: memory.id }, requestId);
    return sendSuccess(res, memory, 200, requestId);

  } catch (error) {
    logger.error('Add memory error', error, undefined, requestId);
    return sendError(res, 500, 'Failed to add memory', 'Database operation failed', error, requestId);
  }
}

// Handle recent memories operation
async function handleRecentMemories(memoryService: MemoryService, data: any, res: VercelResponse, requestId: string) {
  const sessionId = data.sessionId;
  const limit = parseInt(data.limit) || 20;

  if (limit < 1 || limit > 100) {
    return sendError(res, 400, 'Invalid limit', 'Limit must be between 1 and 100', undefined, requestId);
  }

  try {
    const memories = await memoryService.getRecentMemories(sessionId, limit);
    
    logger.info('Recent memories retrieved', { count: memories.length, sessionId }, requestId);
    return sendSuccess(res, { memories, count: memories.length }, 200, requestId);

  } catch (error) {
    logger.error('Get recent memories error', error, undefined, requestId);
    return sendError(res, 500, 'Failed to retrieve memories', 'Database operation failed', error, requestId);
  }
}

// Handle relevant memories operation
async function handleRelevantMemories(memoryService: MemoryService, data: any, res: VercelResponse, requestId: string) {
  const { query, sessionId, limit: limitParam } = data;
  const limit = parseInt(limitParam) || 10;

  if (!query) {
    return sendError(res, 400, 'Missing query', 'Query parameter is required for relevant search', undefined, requestId);
  }

  if (limit < 1 || limit > 50) {
    return sendError(res, 400, 'Invalid limit', 'Limit must be between 1 and 50', undefined, requestId);
  }

  try {
    const memories = await memoryService.getRelevantMemories(query, sessionId, limit);
    
    logger.info('Relevant memories retrieved', { count: memories.length, queryLength: query.length }, requestId);
    return sendSuccess(res, { memories, count: memories.length }, 200, requestId);

  } catch (error) {
    logger.error('Get relevant memories error', error, undefined, requestId);
    return sendError(res, 500, 'Failed to retrieve relevant memories', 'Search operation failed', error, requestId);
  }
}

class MemoryService {
  async addMemory(data: Partial<Memory>): Promise<Memory> {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const memory: Memory = {
      id: memoryId,
      sessionId: data.sessionId ?? undefined,
      userMessage: data.userMessage!,
      aiResponse: data.aiResponse!,
      emotion: data.emotion || 'neutral',
      importance: data.importance || 5,
      topics: data.topics ?? undefined,
      embedding: data.embedding ?? undefined,
      timestamp
    };

    if (supabase) {
      const { error } = await supabase
        .from('conversation_memories')
        .insert({
          memory_id: memory.id,
          session_id: memory.sessionId,
          user_message: memory.userMessage,
          ai_response: memory.aiResponse,
          emotion: memory.emotion,
          importance: memory.importance,
          topics: memory.topics,
          embedding: memory.embedding,
          created_at: timestamp,
          updated_at: timestamp
        });

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

  async getRelevantMemories(query: string, sessionId?: string, limit: number = 10): Promise<Memory[]> {
    if (supabase) {
      // Try semantic search first if embeddings are available
      try {
        let searchQuery = supabase
          .from('conversation_memories')
          .select('*')
          .limit(limit);

        if (sessionId) {
          searchQuery = searchQuery.eq('session_id', sessionId);
        }

        // Fallback to text search if no embedding search is available
        searchQuery = searchQuery.or(`user_message.ilike.%${query}%,ai_response.ilike.%${query}%`);

        const { data, error } = await searchQuery;
        if (error) throw error;

        return (data || []).map(this.mapDbToMemory);
      } catch (error) {
        // Fallback to basic text search
        let fallbackQuery = supabase
          .from('conversation_memories')
          .select('*')
          .or(`user_message.ilike.%${query}%,ai_response.ilike.%${query}%`)
          .limit(limit);

        if (sessionId) {
          fallbackQuery = fallbackQuery.eq('session_id', sessionId);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;

        return (fallbackData || []).map(this.mapDbToMemory);
      }
    } else {
      // Fallback to in-memory storage with simple text matching
      const queryLower = query.toLowerCase();
      const memories = Array.from(inMemoryMemories.values())
        .filter(m => {
          if (sessionId && m.sessionId !== sessionId) return false;
          return m.userMessage.toLowerCase().includes(queryLower) || 
                 m.aiResponse.toLowerCase().includes(queryLower) ||
                 (m.topics && m.topics.some(topic => topic.toLowerCase().includes(queryLower)));
        })
        .sort((a, b) => b.importance - a.importance) // Sort by importance
        .slice(0, limit);
      
      return memories;
    }
  }

  private mapDbToMemory(dbRow: any): Memory {
    return {
      id: dbRow.memory_id,
      sessionId: dbRow.session_id ?? undefined,
      userMessage: dbRow.user_message,
      aiResponse: dbRow.ai_response,
      emotion: dbRow.emotion,
      importance: dbRow.importance,
      topics: dbRow.topics ?? undefined,
      embedding: dbRow.embedding ?? undefined,
      timestamp: dbRow.created_at
    };
  }
}