-- Supabase SQL Schema for Spectra Backend
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_key TEXT UNIQUE NOT NULL, -- For external session IDs
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice interactions table (for analytics and improvement)
CREATE TABLE IF NOT EXISTS voice_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'elevenlabs', 'openai', 'webspeech'
  interaction_type TEXT NOT NULL, -- 'tts', 'stt', 'chat'
  input_text TEXT,
  output_text TEXT,
  metadata JSONB DEFAULT '{}',
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation memories table (for dynamic memory system)
CREATE TABLE IF NOT EXISTS conversation_memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  memory_id TEXT UNIQUE NOT NULL, -- External memory ID for API consistency
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  emotion TEXT DEFAULT 'neutral',
  importance DECIMAL(3,2) DEFAULT 0.5 CHECK (importance >= 0.0 AND importance <= 1.0),
  topics TEXT[] DEFAULT '{}',
  embedding TEXT, -- JSON string for embeddings (compatible with SQLite fallback)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_key ON conversation_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON voice_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_service ON voice_interactions(service_type);

-- Memory table indexes
CREATE INDEX IF NOT EXISTS idx_memories_memory_id ON conversation_memories(memory_id);
CREATE INDEX IF NOT EXISTS idx_memories_session_id ON conversation_memories(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON conversation_memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON conversation_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_emotion ON conversation_memories(emotion);
CREATE INDEX IF NOT EXISTS idx_memories_topics ON conversation_memories USING GIN(topics);

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON conversation_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memories ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON conversation_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own sessions" ON conversation_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own sessions" ON conversation_sessions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON conversation_sessions
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Voice interactions policies
CREATE POLICY "Users can view own interactions" ON voice_interactions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create interactions for own sessions" ON voice_interactions
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
  );

-- Memory policies
CREATE POLICY "Users can view own memories" ON conversation_memories
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
    OR session_id IS NULL -- Allow global memories
  );

CREATE POLICY "Users can create memories for own sessions" ON conversation_memories
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
    OR session_id IS NULL -- Allow global memories
  );

CREATE POLICY "Users can update own memories" ON conversation_memories
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
    OR session_id IS NULL -- Allow global memories
  );

CREATE POLICY "Users can delete own memories" ON conversation_memories
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM conversation_sessions 
      WHERE user_id::text = auth.uid()::text
    )
    OR session_id IS NULL -- Allow global memories
  );