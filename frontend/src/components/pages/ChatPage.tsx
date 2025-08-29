import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { User, AppState, ChatMessage } from '../../lib/types';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

interface ChatPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function ChatPage({ user, onStateChange }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${user.name}! I'm your AI Study Buddy. What would you like to learn about today?`,
      timestamp: new Date(),
      confidence: 0.95
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Persist to Firestore: ensure session document exists then add the message
    const sessionId = `${user.id}-chat-${new Date().toISOString().slice(0,10)}`;
    const sessionRef = doc(db, 'users', user.id, 'chatSessions', sessionId);
    await setDoc(sessionRef, { createdAt: serverTimestamp(), userId: user.id }, { merge: true });
    await addDoc(collection(db, 'users', user.id, 'chatSessions', sessionId, 'messages'), {
      role: 'user',
      content: inputValue,
      ts: serverTimestamp(),
    });

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${inputValue}". This is a simulated response for the demo. In the full version, I would provide detailed explanations with sources and practice questions.`,
        timestamp: new Date(),
        confidence: 0.85
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      await addDoc(collection(db, 'users', user.id, 'chatSessions', sessionId, 'messages'), {
        role: 'assistant',
        content: aiResponse.content,
        confidence: aiResponse.confidence,
        ts: serverTimestamp(),
      });
    }, 1500);
  };

  const handleFeedback = (_messageId: string, isPositive: boolean) => {
    const pointsToAdd = isPositive ? 2 : 1;
    const updatedUser = { ...user, points: user.points + pointsToAdd };
    
    onStateChange({
      user: updatedUser,
      currentSession: null,
      isLoading: false,
      error: null
    });
    
    localStorage.setItem('ai-study-buddy-user', JSON.stringify(updatedUser));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-600" />
          Ask & Learn
        </h2>
        <p className="text-gray-600">
          Ask me anything about your subjects. I'll provide detailed explanations with sources and practice questions.
        </p>
      </div>

      <div className="card mb-6">
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === 'assistant' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(message.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((message.confidence || 0) * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="card">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your subjects..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
