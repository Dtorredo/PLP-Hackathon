import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, User as UserIcon } from "lucide-react";
import type { User, ChatMessage } from "../../lib/types";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "../../lib/theme.tsx";
import { usePersistentState } from "../../lib/pageState.tsx";

interface ChatPageProps {
  user: User;
}

export function ChatPage({ user }: ChatPageProps) {
  const { theme } = useTheme();

  // Use persistent state for chat history
  const [chatHistory, setChatHistory] = usePersistentState<
    Array<{
      id: string;
      createdAt: Date;
      firstMessage: string;
      allMessages: string;
      [key: string]: unknown;
    }>
  >("chat", "chatHistory", []);

  // Keep non-persistent state for current session
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      const sessionsRef = collection(db, "users", user.id, "chatSessions");
      const q = query(sessionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      // Fetch the first message for each session to display as preview
      const history = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const sessionData = doc.data();
          const messagesRef = collection(
            db,
            "users",
            user.id,
            "chatSessions",
            doc.id,
            "messages"
          );
          const messagesQuery = query(
            messagesRef,
            orderBy("ts", "asc"),
            limit(3)
          );
          const messagesSnapshot = await getDocs(messagesQuery);

          let firstMessage = "";
          let allMessages = "";
          if (!messagesSnapshot.empty) {
            const firstMsg = messagesSnapshot.docs[0].data();
            firstMessage = firstMsg.content || "";

            // Collect all messages for better search
            messagesSnapshot.docs.forEach((doc) => {
              const msgData = doc.data();
              allMessages += (msgData.content || "") + " ";
            });
          }

          return {
            id: doc.id,
            createdAt: sessionData.createdAt?.toDate() || new Date(),
            firstMessage:
              firstMessage.substring(0, 50) +
              (firstMessage.length > 50 ? "..." : ""),
            allMessages: allMessages.trim(),
            ...sessionData,
          };
        })
      );

      setChatHistory(history);
    };

    if (user.id) {
      fetchChatHistory();
    }
  }, [user.id]);

  // Filter history items based on search query
  const filteredHistoryItems = chatHistory.filter((item) => {
    if (searchQuery === "") return true;

    const query = searchQuery.toLowerCase();

    // Search in all messages content (most comprehensive)
    if (item.allMessages.toLowerCase().includes(query)) return true;

    // Search in first message content
    if (item.firstMessage.toLowerCase().includes(query)) return true;

    // Search in session ID (fallback)
    if (item.id.toLowerCase().includes(query)) return true;

    // Search in date (if user searches for dates)
    if (item.createdAt) {
      const dateStr = new Date(item.createdAt)
        .toLocaleDateString()
        .toLowerCase();
      if (dateStr.includes(query)) return true;
    }

    return false;
  });

  // Group filtered items by section
  const groupedHistory = {
    "Chat History": filteredHistoryItems,
  };

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      // Main layout
      mainContainer: theme === "light" ? "bg-[#FAF5FA]" : "bg-[#231E28]",
      sidebar:
        theme === "light"
          ? "bg-[#F1DEF7] border-r border-gray-200"
          : "bg-[#140D13] border-r border-secondary-700",
      chatArea: theme === "light" ? "bg-[#FAF5FA]" : "bg-[#231E28]",

      // Text colors
      text: theme === "light" ? "text-[#492C61]" : "text-white",
      textSecondary: theme === "light" ? "text-[#492C61]/80" : "text-gray-300",

      // Buttons
      newChatButton:
        theme === "light"
          ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white",

      // Input area
      inputContainer:
        theme === "light"
          ? "bg-white shadow-lg border border-gray-200"
          : "bg-secondary-800 shadow-lg border border-secondary-700",
      input:
        theme === "light"
          ? "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          : "bg-secondary-800 border border-secondary-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500",
      searchInput:
        theme === "light"
          ? "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          : "bg-secondary-700 border border-secondary-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500",
      button:
        theme === "light"
          ? "bg-pink-600 hover:bg-pink-700 text-white"
          : "bg-primary-600 hover:primary-700 text-white",

      // Messages
      userMessage:
        theme === "light"
          ? "bg-pink-600 text-white"
          : "bg-primary-600 text-white",
      aiMessage:
        theme === "light"
          ? "bg-white border border-gray-200 text-[#492C61]"
          : "bg-secondary-800 text-white",

      // Code blocks (pink background like flashcards)
      codeBlock:
        theme === "light"
          ? "bg-[#F2DEF6] border border-gray-200"
          : "bg-secondary-900 border border-secondary-700",

      // Markdown elements
      heading: theme === "light" ? "text-[#492C61]" : "text-white",
      paragraph: theme === "light" ? "text-[#492C61]" : "text-gray-300",
      listItem: theme === "light" ? "text-[#492C61]" : "text-gray-300",
      strong: theme === "light" ? "text-[#492C61]" : "text-white",
      emphasis: theme === "light" ? "text-[#492C61]/80" : "text-gray-300",

      // History items
      historyItem:
        theme === "light"
          ? "bg-white border border-gray-200 hover:bg-gray-50"
          : "bg-secondary-700 border border-secondary-600 hover:bg-secondary-600",
      selectedHistoryItem:
        theme === "light"
          ? "bg-pink-50 border-pink-200"
          : "bg-primary-900 border-primary-700",

      // User profile
      userProfile:
        theme === "light"
          ? "bg-gray-50 border-t border-gray-200"
          : "bg-secondary-700 border-t border-secondary-600",
    };
  };

  const themeClasses = getThemeClasses();

  // Initialize chat with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi ${user.name}! I'm your AI Study Buddy. What would you like to learn about today?`,
        timestamp: new Date(),
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/v1/ask`,
        {
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
        }
      );

      if (response.ok) {
        const data = await response.json();
        let content = data.answer;

        // Clean up the content formatting
        content = content
          // Remove excessive line breaks but preserve intentional formatting
          .replace(/\n{3,}/g, "\n\n")
          // Clean up spaces around line breaks
          .replace(/\s*\n\s*/g, "\n")
          // Fix inline code formatting - ensure single words don't break lines
          .replace(/`(\w+)`/g, "`$1`")
          // Remove trailing whitespace
          .trim();

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: content,
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

  const handleHistorySelect = async (sessionId: string) => {
    try {
      setIsLoading(true);

      // Load messages from the selected session
      const messagesRef = collection(
        db,
        "users",
        user.id,
        "chatSessions",
        sessionId,
        "messages"
      );
      const q = query(messagesRef, orderBy("ts", "asc"));
      const querySnapshot = await getDocs(q);

      const loadedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.ts?.toDate() || new Date(),
          confidence: data.confidence || 0.85,
        });
      });

      setMessages(loadedMessages);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user.name}! I'm your AI Study Buddy. What would you like to learn about today?`,
      timestamp: new Date(),
      confidence: 0.95,
    };
    setMessages([welcomeMessage]);
    setIsInitialized(true);
  };

  return (
    <div
      className={`${themeClasses.mainContainer} h-screen flex flex-col md:flex-row pt-24 chat-page-container relative`}
    >
      {/* Floating Sidebar - Fixed position, doesn't move */}
      <div
        className={`${themeClasses.sidebar} hidden md:flex w-80 p-4 rounded-xl shadow-lg sidebar-scrollbar flex-col h-[calc(100vh-10rem)] fixed left-24 top-24 z-50 chat-sidebar-fixed`}
        style={{ transform: "none !important", transition: "none !important" }}
      >
        {/* Search Bar */}
        <div className="p-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your threads..."
              className={`${themeClasses.searchInput} w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none text-sm`}
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <button
            onClick={startNewChat}
            className={`${themeClasses.newChatButton} w-full px-4 py-3 rounded-lg font-medium transition-colors`}
          >
            + New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 px-4 space-y-6 overflow-y-auto">
          {Object.entries(groupedHistory).map(([section, items]) => (
            <div key={section}>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}
                >
                  {section}
                </h3>
                {searchQuery && (
                  <span className={`text-xs ${themeClasses.textSecondary}`}>
                    {items.length} result{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div
                    key={`${section}-${index}`}
                    className={`${themeClasses.historyItem} p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => handleHistorySelect(item.id)}
                  >
                    <p
                      className={`text-sm ${themeClasses.text} font-medium truncate`}
                    >
                      {item.firstMessage || "New conversation"}
                    </p>
                    <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {searchQuery && filteredHistoryItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                No conversations found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Floating Profile Section at Bottom */}
        <div
          className={`${themeClasses.userProfile} p-3 rounded-lg mx-4 mb-8 shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-yellow-800" />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${themeClasses.text} font-medium`}>
                {user.name}
              </p>
              <p className={`text-xs ${themeClasses.textSecondary}`}>Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Adjusted for floating sidebar */}
      <div
        className={`${themeClasses.chatArea} flex-1 flex flex-col h-full p-2 md:p-6 chat-area md:ml-80`}
      >
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-2 md:p-6 pb-8">
          <div className="space-y-4 max-w-4xl mx-auto">
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
                        ? themeClasses.userMessage
                        : themeClasses.aiMessage
                    }`}
                  >
                    <div className="max-w-none chat-message">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Customize code blocks - pink background like flashcards
                          code: ({
                            inline,
                            className,
                            children,
                            ...props
                          }: React.ComponentProps<"code"> & {
                            inline?: boolean;
                          }) => {
                            return !inline ? (
                              <pre
                                className={`${themeClasses.codeBlock} p-3 rounded-lg overflow-x-auto my-3 whitespace-pre-wrap`}
                              >
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code {...props}>{children}</code>
                            );
                          },
                          // Customize headings
                          h1: ({ children }) => (
                            <h1
                              className={`text-2xl font-bold ${themeClasses.heading} mb-4`}
                            >
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2
                              className={`text-xl font-bold ${themeClasses.heading} mb-3`}
                            >
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3
                              className={`text-lg font-bold ${themeClasses.heading} mb-2`}
                            >
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
                            <li className={themeClasses.listItem}>
                              {children}
                            </li>
                          ),

                          // Customize strong text
                          strong: ({ children }) => (
                            <strong
                              className={`font-semibold ${themeClasses.strong}`}
                            >
                              {children}
                            </strong>
                          ),
                          // Customize emphasis
                          em: ({ children }) => (
                            <em className={`italic ${themeClasses.emphasis}`}>
                              {children}
                            </em>
                          ),
                          // Customize paragraphs for better spacing
                          p: ({ children }) => (
                            <p
                              className={`${themeClasses.paragraph} mb-3 leading-relaxed`}
                            >
                              {children}
                            </p>
                          ),
                          // Customize blockquotes
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3">
                              {children}
                            </blockquote>
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
                <div className={`${themeClasses.aiMessage} rounded-lg p-4`}>
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area at Bottom */}
        <div
          className={`${themeClasses.inputContainer} fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 rounded-xl shadow-lg md:left-[calc(50%+10rem)]`}
          style={{ width: "max-content", maxWidth: "48rem" }}
        >
          <div className="max-w-3xl mx-auto flex gap-3 p-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className={`${themeClasses.input} flex-1 px-4 py-3 rounded-lg focus:outline-none`}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`${themeClasses.button} px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

