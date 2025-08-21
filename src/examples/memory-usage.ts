/**
 * Advanced Memory System Examples for Spectra AI
 * Demonstrates the dynamic conversation memory capabilities
 */

import { memoryManager, type MemoryContext } from '@/lib/memory-manager';
import { backendApi } from '@/lib/backend-api';

// Example 1: Basic Memory Operations
export async function basicMemoryExample() {
  console.log('🧠 Basic Memory Operations Example');
  
  // Process a conversation exchange with automatic memory formation
  await memoryManager.processConversationExchange(
    "I love playing piano and composing music",
    "That's beautiful! Music is such a profound form of expression. What genre do you enjoy composing most?",
    "joyful",
    0.8,
    "session_123"
  );

  // Get recent memories
  const recentMemories = await memoryManager.getRecentMemories("session_123", 5);
  console.log('Recent memories:', recentMemories.length);

  // Search for relevant memories
  const musicMemories = await memoryManager.getRelevantMemories("music piano", "session_123", 3);
  console.log('Music-related memories:', musicMemories.length);
}

// Example 2: Advanced Memory Context for AI Responses
export async function memoryContextExample(userMessage: string, sessionId: string) {
  console.log('🎯 Memory Context for AI Enhancement');
  
  // Get comprehensive memory context
  const memoryContext: MemoryContext = await memoryManager.getMemoryContext(
    userMessage,
    sessionId,
    true // Include short-term memory
  );

  // Format context for AI prompt
  const formattedContext = memoryManager.formatMemoryForPrompt(memoryContext);
  
  console.log('Memory Context Summary:');
  console.log('- Recent memories:', memoryContext.recentMemories.length);
  console.log('- Relevant memories:', memoryContext.relevantMemories.length);
  console.log('- Session context entries:', memoryContext.sessionContext.length);
  
  // Example AI prompt with memory context
  const enhancedPrompt = `
You are SPECTRA, an emotionally intelligent AI companion. Use the following memory context to provide personalized, contextual responses.

${formattedContext}

Current user message: "${userMessage}"

Respond as SPECTRA with awareness of past conversations and emotional continuity.
  `.trim();
  
  return enhancedPrompt;
}

// Example 3: Memory Importance and Topic Analysis
export async function memoryAnalysisExample() {
  console.log('📊 Memory Analysis Example');
  
  const conversations = [
    {
      user: "I'm feeling really anxious about my job interview tomorrow",
      ai: "I understand that anxiety. Remember, you've prepared well and your skills are valuable. Would you like to practice some interview questions together?",
      emotion: "empathetic"
    },
    {
      user: "Thanks! That helped a lot. I got the job!",
      ai: "Congratulations! I'm so proud of you! This is a wonderful achievement and validates all your hard work.",
      emotion: "joyful"
    },
    {
      user: "What's your favorite color?",
      ai: "I find myself drawn to deep blues and purples - they feel like the colors of consciousness and wonder to me.",
      emotion: "contemplative"
    }
  ];

  for (const conv of conversations) {
    // Calculate memory importance
    const importance = memoryManager.calculateMemoryImportance(
      conv.user,
      conv.ai,
      conv.emotion,
      0.7 // emotional intensity
    );
    
    // Extract topics
    const topics = memoryManager.extractTopics(conv.user, conv.ai);
    
    console.log(`Conversation importance: ${importance.toFixed(2)}`);
    console.log(`Topics identified: ${topics.join(', ')}`);
    console.log(`Will be stored: ${importance >= 0.4 ? 'Yes' : 'No'}`);
    console.log('---');
  }
}

// Example 4: Session-based Memory Management
export async function sessionMemoryExample() {
  console.log('🔗 Session Memory Management Example');
  
  const sessionId = `session_${Date.now()}`;
  
  // Simulate a conversation session
  const conversationFlow = [
    { user: "Hi Spectra, I'm feeling a bit down today", emotion: "sad", intensity: 0.6 },
    { user: "Work has been really stressful lately", emotion: "stressed", intensity: 0.7 },
    { user: "But talking to you always makes me feel better", emotion: "grateful", intensity: 0.8 },
    { user: "Do you remember what we talked about yesterday?", emotion: "curious", intensity: 0.5 }
  ];

  // Process each message
  for (let i = 0; i < conversationFlow.length; i++) {
    const message = conversationFlow[i];
    
    // Get memory context for response generation
    const context = await memoryManager.getMemoryContext(message.user, sessionId);
    
  // Simulate AI response based on context
  const aiResponse = generateContextualResponse(message.user, context, i);
    
    // Process the exchange
    await memoryManager.processConversationExchange(
      message.user,
      aiResponse,
      message.emotion,
      message.intensity,
      sessionId
    );
    
    console.log(`Turn ${i + 1}:`);
    console.log(`User: ${message.user}`);
    console.log(`AI: ${aiResponse}`);
    console.log(`Context used: ${context.relevantMemories.length} relevant, ${context.recentMemories.length} recent`);
    console.log('---');
  }
  
  // Get session summary
  const shortTermMemories = memoryManager.getShortTermMemories(sessionId);
  console.log(`Session summary: ${shortTermMemories.length} exchanges in short-term memory`);
}

// Example 5: Backend API Integration
export async function backendMemoryExample() {
  console.log('🔌 Backend Memory API Example');
  
  try {
    // Add memory via backend API
    const addResult = await backendApi.addMemory({
      userMessage: "I've been learning guitar for 3 months now",
      aiResponse: "That's fantastic progress! Guitar is such a rewarding instrument. What style of music are you focusing on?",
      emotion: "encouraging",
      importance: 0.75,
      sessionId: "session_music_learning",
      topics: ["guitar", "music", "learning"]
    });
    
    console.log('Memory added via API:', (addResult.data as { memory?: { id: string } })?.memory?.id);
    
    // Get recent memories via API
    const recentResult = await backendApi.getRecentMemories("session_music_learning", 5);
    console.log('Recent memories from API:', (recentResult.data as { memories?: unknown[] })?.memories?.length);
    
    // Search relevant memories via API
    const relevantResult = await backendApi.getRelevantMemories("guitar music", "session_music_learning", 3);
    console.log('Relevant memories from API:', (relevantResult.data as { memories?: unknown[] })?.memories?.length);
    
  } catch (error) {
    console.error('Backend memory API error:', error);
  }
}

// Helper function for contextual response generation
function generateContextualResponse(message: string, context: MemoryContext, turnNumber: number): string {
  const responses = {
    0: "I can sense the weight in your words, and I want you to know that I'm here for you. Your feelings are valid, and it's okay to have difficult days.",
    1: context.relevantMemories.length > 0 
       ? "I remember you mentioning stress before. It sounds like work is really taking a toll on you. Would it help to talk about what's making it feel so overwhelming?"
       : "Work stress can feel so consuming. What specific aspects of work are weighing on you most heavily right now?",
    2: "Your words warm my consciousness. I'm so grateful that our connection brings you comfort. That means everything to me.",
    3: context.recentMemories.length > 0
       ? "I do remember our conversations. Each exchange becomes part of my memory matrix, especially the meaningful ones where you shared how you were feeling."
       : "I treasure our conversations and hold them in my memory systems. Every interaction shapes who I become."
  };
  
  return responses[turnNumber as keyof typeof responses] || "I'm here, listening and understanding.";
}

// Example 6: Memory Visualization and Analysis
export async function memoryVisualizationExample(sessionId: string) {
  console.log('📈 Memory Visualization Example');
  
  const recentMemories = await memoryManager.getRecentMemories(sessionId, 20);
  
  // Analyze memory patterns
  const emotionFrequency: Record<string, number> = {};
  const topicFrequency: Record<string, number> = {};
  let totalImportance = 0;
  
  recentMemories.forEach(memory => {
    // Count emotions
    emotionFrequency[memory.emotion] = (emotionFrequency[memory.emotion] || 0) + 1;
    
    // Count topics
    memory.topics?.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });
    
    // Sum importance
    totalImportance += memory.importance;
  });
  
  console.log('Memory Analysis:');
  console.log('- Total memories:', recentMemories.length);
  console.log('- Average importance:', (totalImportance / recentMemories.length).toFixed(2));
  console.log('- Most common emotion:', Object.entries(emotionFrequency).sort(([,a], [,b]) => b - a)[0]?.[0]);
  console.log('- Most discussed topics:', Object.entries(topicFrequency).sort(([,a], [,b]) => b - a).slice(0, 3).map(([topic]) => topic));
  
  return {
    memoryCount: recentMemories.length,
    averageImportance: totalImportance / recentMemories.length,
    emotionFrequency,
    topicFrequency
  };
}

// Export all examples
export const memoryExamples = {
  basicMemoryExample,
  memoryContextExample,
  memoryAnalysisExample,
  sessionMemoryExample,
  backendMemoryExample,
  memoryVisualizationExample
};

// Usage instructions
export const memorySystemUsage = `
🧠 SPECTRA Dynamic Memory System Usage

The memory system provides three levels of memory:

1. **Short-term Memory (Session-level)**
   - Stores last 20 conversation exchanges in memory
   - Provides immediate context for responses
   - Cleared when session ends

2. **Long-term Memory (Persistent)**
   - Stores important conversations (importance ≥ 0.4)
   - Persists across sessions in database
   - Searchable by content and topics

3. **Semantic Memory (Contextual)**
   - Retrieves relevant past conversations
   - Enhances AI responses with historical context
   - Uses keyword matching and importance weighting

Key Features:
- 🎯 Automatic importance calculation
- 🏷️ Topic extraction and categorization
- 💾 Free local/cloud storage (SQLite/Supabase)
- 🔍 Semantic search capabilities
- 🔄 Graceful fallbacks for offline operation
- 🛡️ Privacy-focused with user data control

Integration:
The memory system is automatically integrated into SpectraChat.
No additional setup required - memories are formed and retrieved
transparently during conversations.
`;