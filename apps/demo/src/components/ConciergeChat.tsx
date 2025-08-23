import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Mic, MicOff } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

// Canned responses for demo
const CANNED_RESPONSES = [
  {
    keywords: ['pool', 'swimming', 'swim'],
    response: "The pool is open daily from 6 AM to 10 PM. Pool towels are available at the concierge desk. The pool area also features comfortable lounge chairs and umbrellas for your relaxation."
  },
  {
    keywords: ['gym', 'fitness', 'workout', 'exercise'],
    response: "Our fitness center is open 24/7 for residents. It features state-of-the-art equipment including cardio machines, weights, and yoga mats. Personal training sessions can be arranged through the concierge."
  },
  {
    keywords: ['parking', 'garage', 'car'],
    response: "Each unit includes one assigned parking space in our secure underground garage. Guest parking is available on levels P1 and P2. Please register guest vehicles at the front desk."
  },
  {
    keywords: ['package', 'delivery', 'mail'],
    response: "All packages are received at our secure package room. You'll receive an email notification when packages arrive. The package room is accessible 24/7 with your key fob."
  },
  {
    keywords: ['maintenance', 'repair', 'fix', 'broken'],
    response: "For maintenance requests, please use the 'Requests' tab or call our 24/7 maintenance hotline at (555) 123-4567. Emergency maintenance issues will be addressed immediately."
  },
  {
    keywords: ['guest', 'visitor', 'access'],
    response: "Guests can be added to your visitor list through the resident portal or by calling the front desk. Guests will need photo ID and must be escorted by residents after 10 PM."
  },
  {
    keywords: ['rent', 'payment', 'lease'],
    response: "Rent payments can be made online through the resident portal, by check, or automatic bank transfer. Late fees apply after the 5th of each month. Contact the leasing office for lease renewal inquiries."
  },
  {
    keywords: ['noise', 'quiet', 'hours'],
    response: "Quiet hours are from 10 PM to 8 AM on weekdays and 11 PM to 9 AM on weekends. Please be considerate of your neighbors. Report noise disturbances to the front desk."
  },
  {
    keywords: ['hours', 'open', 'office'],
    response: "The leasing office is open Monday-Friday 9 AM to 6 PM, Saturday 10 AM to 5 PM, and Sunday 12 PM to 5 PM. The concierge desk is staffed 24/7 for your convenience."
  }
]

const getResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  for (const response of CANNED_RESPONSES) {
    if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return response.response
    }
  }
  
  // Default response
  return "Thank you for your question! I'm here to help with information about The Meridian Apartments. Feel free to ask about our amenities, policies, or services. For urgent matters, please contact our 24/7 concierge at (555) 123-4567."
}

export default function ConciergeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your virtual concierge for The Meridian Apartments. How can I assist you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // 1-2 second delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    // In a real implementation, this would integrate with ElevenLabs
    if (!isVoiceEnabled) {
      // Mock voice activation
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Voice mode activated! (Demo: Voice features would integrate with ElevenLabs here)",
          sender: 'assistant',
          timestamp: new Date()
        }])
      }, 500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="elysia-card h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Concierge Assistant</h2>
              <p className="text-sm text-green-600">Available 24/7</p>
            </div>
          </div>
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isVoiceEnabled 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {isVoiceEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 text-primary-500" />
                  )}
                  {message.sender === 'user' && (
                    <User className="w-4 h-4 mt-0.5 text-white" />
                  )}
                  <div>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-primary-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-100">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about amenities, policies, or services..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="elysia-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try asking about: pool hours, gym access, parking, packages, maintenance, or guest policies
          </p>
        </div>
      </div>
    </div>
  )
}