import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import type { User, AppState, ChatMessage } from "../../lib/types";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function ChatPage({ user, onStateChange }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi ${user.name}! I'm your AI Study Buddy. What would you like to learn about today?`,
        timestamp: new Date(),
        confidence: 0.95,
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [user.name, isInitialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Persist to Firestore: ensure session document exists then add the message
      const sessionId = `${user.id}-chat-${new Date()
        .toISOString()
        .slice(0, 10)}`;
      const sessionRef = doc(db, "users", user.id, "chatSessions", sessionId);
      await setDoc(
        sessionRef,
        { createdAt: serverTimestamp(), userId: user.id },
        { merge: true }
      );
      await addDoc(
        collection(db, "users", user.id, "chatSessions", sessionId, "messages"),
        {
          role: "user",
          content: inputValue,
          ts: serverTimestamp(),
        }
      );

      // Call AI service for response
      const response = await fetch("http://localhost:3001/api/v1/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userId: user.id,
          text: inputValue,
          mode: "explain",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
          confidence: data.confidence || 0.85,
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);

        // Store AI response in Firestore
        await addDoc(
          collection(
            db,
            "users",
            user.id,
            "chatSessions",
            sessionId,
            "messages"
          ),
          {
            role: "assistant",
            content: aiResponse.content,
            confidence: aiResponse.confidence,
            ts: serverTimestamp(),
          }
        );
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        confidence: 0.5,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-500" />
          Ask & Learn
        </h2>
        <p className="text-gray-300">
          Ask me anything about your subjects. I'll provide detailed
          explanations with sources and practice questions.
        </p>
      </div>

      {/* Input - Fixed below header */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask me anything about your subjects..."
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="btn-primary"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Container - Scrollable below input */}
      <div className="bg-secondary-900 rounded-lg border border-secondary-700 p-4 min-h-96 max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-secondary-800 text-white"
                  }`}
                >
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Customize code blocks
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline ? (
                            <pre className="bg-secondary-900 p-3 rounded-lg overflow-x-auto">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code
                              className="bg-secondary-700 px-1 py-0.5 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        // Customize headings
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-white mb-4">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold text-white mb-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-bold text-white mb-2">
                            {children}
                          </h3>
                        ),
                        // Customize lists
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-300">{children}</li>
                        ),
                        // Customize paragraphs - prevent line breaks and preserve code formatting
                        p: ({ children }) => (
                          <p className="mb-3 text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                            {children}
                          </p>
                        ),
                        // Customize strong text
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">
                            {children}
                          </strong>
                        ),
                        // Customize emphasis
                        em: ({ children }) => (
                          <em className="italic text-gray-300">{children}</em>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary-800 rounded-lg p-4">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
