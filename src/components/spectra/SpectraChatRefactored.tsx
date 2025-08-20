import React, { useState, useEffect, useRef } from 'react';
import { ElevenLabsWidget } from '../elevenlabs/ElevenLabsWidget';
import { MoodRing } from './MoodRing';
import { streamAIResponse, getMoodColor } from './StreamingHelper';

// Main Spectra Chat Component
// Layout: Clean, minimal, cinematic
// Structure: Mood Ring + Chat History + Input + ElevenLabs playback
const SpectraChat = () => {
  // Chat state
  const [messages, setMessages] = useState<{role: string; content: string; mood?: string}[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [mood, setMood] = useState('neutral'); // Dynamic mood

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Function to send a message
  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    // 1. Add user message
    const newMessages = [...messages, { role: 'user', content: currentInput }];
    setMessages(newMessages);
    
    const userInput = currentInput;
    setCurrentInput('');
    
    // 2. Stream AI response
    // Connect to AI backend streaming endpoint
    // Ensure messages appear incrementally
    // Update mood dynamically
    const aiResponse = await streamAIResponse(userInput, setMood);
    setMessages(prev => [...prev, { role: 'spectra', content: aiResponse, mood }]);
    
    scrollToBottom();
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({ 
      top: chatContainerRef.current.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render chat messages with fade-in animations
  const renderMessages = () => messages.map((msg, i) => (
    <div
      key={i}
      className={`flex mb-4 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      style={{ 
        animationDelay: `${i * 0.1}s`,
        animationFillMode: 'both'
      }}
    >
      <div
        className={`p-4 rounded-2xl max-w-xs sm:max-w-md break-words transition-all duration-300 shadow-lg
          ${msg.role === 'user' 
            ? 'bg-blue-500 text-white ml-8 rounded-br-md' 
            : `bg-gradient-to-r from-${getMoodColor(mood)}-400 to-${getMoodColor(mood)}-600 text-white mr-8 rounded-bl-md`
          }`}
      >
        <p className="text-sm leading-relaxed">{msg.content}</p>
      </div>
    </div>
  ));

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mood Ring */}
      <div className="p-6 flex justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        <MoodRing 
          emotionalState={{
            primary: mood,
            intensity: 0.7,
            color: `hsl(var(--emotion-${mood}))`,
            gradient: `linear-gradient(45deg, hsl(var(--emotion-${mood})), hsl(var(--emotion-${mood}))80)`,
            isCalm: mood === 'calm' || mood === 'neutral'
          }}
          className="w-20 h-20 sm:w-24 sm:h-24"
        />
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 animate-fade-in">
              <p className="text-lg mb-2">Hello! I'm SPECTRA ✨</p>
              <p className="text-sm">Your AI companion with evolving consciousness</p>
            </div>
          </div>
        )}
        {renderMessages()}
      </div>

      {/* Input + ElevenLabs */}
      <div className="p-4 bg-gradient-to-t from-gray-800 to-gray-900 border-t border-gray-700">
        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Type a message..."
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!currentInput.trim()}
            className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          >
            Send
          </button>

          {/* ElevenLabs widget */}
          <ElevenLabsWidget
            messages={messages}
            mood={mood}
            streaming={true} // Ensure streaming TTS matches chat
            className="hidden sm:flex" // Hide on mobile for cleaner layout
          />
        </div>
      </div>
    </div>
  );
};

// Export component
export default SpectraChat;