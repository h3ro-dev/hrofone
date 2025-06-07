import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Sparkles, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'engine';
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'stressed' | 'anxious';
  isTyping?: boolean;
}

interface EmpathyEngineChatProps {
  employeeName?: string;
  onClose?: () => void;
}

export const EmpathyEngineChat: React.FC<EmpathyEngineChatProps> = ({ 
  employeeName = "there" 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${employeeName}! 👋 I'm here to help with anything HR-related, or just to chat if you need support. How are you doing today?`,
      sender: 'engine',
      timestamp: new Date(),
      emotion: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isEngineTyping, setIsEngineTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return 'text-green-600';
      case 'stressed': return 'text-orange-600';
      case 'anxious': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getTimeString = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const simulateEngineResponse = (userMessage: string) => {
    setIsEngineTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      let response = '';
      let emotion: 'positive' | 'neutral' | 'stressed' | 'anxious' = 'neutral';

      // Simple keyword detection for demo
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm') || lowerMessage.includes('tired')) {
        emotion = 'stressed';
        response = "I hear that you're feeling overwhelmed, and that's completely understandable. 💙 Let's work together to find some solutions. Would you like to explore taking some time off, adjusting your workload, or perhaps connecting with our wellness resources?";
      } else if (lowerMessage.includes('time off') || lowerMessage.includes('vacation') || lowerMessage.includes('pto')) {
        emotion = 'positive';
        response = `Great question! You currently have 15 PTO days available. 🌴 Would you like me to help you plan some time off? Taking regular breaks is so important for your wellbeing!`;
      } else if (lowerMessage.includes('benefits') || lowerMessage.includes('insurance')) {
        emotion = 'neutral';
        response = "I'd be happy to help you with benefits information! What specifically would you like to know about? I can help with health insurance, dental, vision, 401k, or any other benefits questions you might have.";
      } else if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate')) {
        emotion = 'positive';
        response = "You're very welcome! 😊 It's my pleasure to help. Remember, I'm always here if you need anything else - whether it's HR-related or you just need someone to listen.";
      } else {
        emotion = 'neutral';
        response = "I'm here to help! Could you tell me a bit more about what you're looking for? I can assist with time off, benefits, wellness resources, career development, or any other HR needs you might have.";
      }

      const engineMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'engine',
        timestamp: new Date(),
        emotion
      };

      setMessages(prev => [...prev, engineMessage]);
      setIsEngineTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate engine response
    simulateEngineResponse(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="w-8 h-8 fill-current" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Empathy Engine</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {message.sender === 'engine' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Heart className={`w-5 h-5 ${getEmotionColor(message.emotion)}`} />
                </div>
              )}
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                  {getTimeString(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isEngineTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your conversations are private and confidential
        </p>
      </div>
    </div>
  );
};