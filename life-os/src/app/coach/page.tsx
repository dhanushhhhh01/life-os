"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Sparkles, BarChart3, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { ai } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function CoachPage() {
  const { loggedIn } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
    // Welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hey! I'm your Life Coach — I know your goals, mood patterns, journal entries, and habits. " +
          "Ask me anything about your life. Big decisions, feeling stuck, need perspective? I'm here.\n\n" +
          "Try something like:\n" +
          '• "Should I focus on learning AI or robotics first?"\n' +
          '• "I\'ve been feeling low lately, what do you see in my data?"\n' +
          '• "Help me prioritize my goals for this month"',
        timestamp: new Date(),
      },
    ]);
  }, [loggedIn]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for multi-turn
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await ai.coach(text, history);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: res.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: `Something went wrong: ${err.message}. Try again?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  async function handleInsights() {
    setInsightsLoading(true);
    try {
      const res = await ai.moodInsights(30);
      const insightMsg: Message = {
        id: `i-${Date.now()}`,
        role: "assistant",
        content: `📊 **Mood Insights (Last ${res.days_analyzed} days):**\n\n${res.insights}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, insightMsg]);
    } catch (err: any) {
      console.error(err);
    }
    setInsightsLoading(false);
  }

  function clearChat() {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Fresh start! What's on your mind?",
        timestamp: new Date(),
      },
    ]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-glass-border p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-accent-light" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Life Coach</h1>
              <p className="text-xs text-white/30">Powered by your personal data</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInsights}
              disabled={insightsLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm hover:bg-blue-500/20 transition-all disabled:opacity-50"
            >
              {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              Mood Insights
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-300/50 text-white/40 text-sm hover:text-white/70 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
                    msg.role === "user"
                      ? "bg-accent/20 text-white border border-accent/20"
                      : "bg-surface-200 text-white/80 border border-glass-border"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-light" />
                      <span className="text-[10px] text-accent-light/60 uppercase tracking-wider">Life Coach</span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  <p className="text-[10px] text-white/20 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-white/40"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent-light/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-accent-light/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-accent-light/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs">Thinking...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-glass-border p-4 shrink-0">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your life coach anything..."
              rows={1}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-surface-200 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 text-sm resize-none max-h-32"
              style={{ minHeight: "50px" }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-glow transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-white/20 mt-2">
            Your coach uses your goals, mood, journal &amp; habits for personalized advice
          </p>
        </div>
      </main>
    </div>
  );
}
