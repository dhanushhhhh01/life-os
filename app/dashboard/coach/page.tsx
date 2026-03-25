"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  role: "user" | "dex";
  content: string;
  timestamp: string;
}

const starterMessages: Message[] = [
  {
    id: 1,
    role: "dex",
    content: "Hey Dhanush! I am Dex, your personal AI life coach. I know your goals, your habits, and your journey. What are we working on today? FastAPI, German, the internship hunt, or just a vibe check?",
    timestamp: new Date().toISOString(),
  }
];

const DEX_RESPONSES: Record<string, string> = {
  default: "Great question! Based on your current progress, I think the key is consistency over intensity. What specific challenge are you facing?",
  german: "Your German is at 30%  -  real progress! The Tandem method with Marco is solid. For B1 by August, you need ~45 mins daily. Try Anki for vocabulary and Deutsche Welle for listening. Wollen wir heute eine Ubung machen?",
  fastapi: "FastAPI is your superpower right now. You are at 45%  -  keep building. Next milestone: deploy a real LLM-powered API to Railway. That alone will make your portfolio stand out to Siemens and Continental recruiters.",
  internship: "For AI internships in Germany: Siemens, Continental, Bosch, and Volkswagen all hire Master students. Your FastAPI + Python stack is exactly what they want. Polish your GitHub README files and write a 1-page project summary. Timeline: apply by April.",
  habits: "Your morning coding streak at 12 days is impressive! The compound effect is real  -  keep it above 10 days and it becomes identity-level. What habit are you struggling with most right now?",
  goals: "Looking at your goals: Build Portfolio Projects is at 60%  -  almost there! Focus energy here this week. Master Thesis at 10% might need attention soon. Shall we break it into weekly milestones?",
  mood: "How you feel matters. If your mood or energy is low, it usually means you need either rest, connection, or a small win. Tell me what is going on and we will figure it out together.",
  berlin: "Berlin is the perfect city for your journey  -  the startup scene is incredible, Deutsche Bahn aside. Have you checked the Berlin AI meetups? Great way to network with engineers who can refer you.",
};

function getDexResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("german") || lower.includes("deutsch") || lower.includes("language")) return DEX_RESPONSES.german;
  if (lower.includes("fastapi") || lower.includes("api") || lower.includes("code") || lower.includes("llm")) return DEX_RESPONSES.fastapi;
  if (lower.includes("intern") || lower.includes("job") || lower.includes("career") || lower.includes("siemens")) return DEX_RESPONSES.internship;
  if (lower.includes("habit") || lower.includes("streak") || lower.includes("routine")) return DEX_RESPONSES.habits;
  if (lower.includes("goal") || lower.includes("progress") || lower.includes("thesis")) return DEX_RESPONSES.goals;
  if (lower.includes("mood") || lower.includes("feel") || lower.includes("tired") || lower.includes("energy")) return DEX_RESPONSES.mood;
  if (lower.includes("berlin") || lower.includes("germany") || lower.includes("city")) return DEX_RESPONSES.berlin;
  return DEX_RESPONSES.default;
}

export default function CoachPage() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getDexResponse(userMsg.content);
      const dexMsg: Message = {
        id: Date.now() + 1,
        role: "dex",
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, dexMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-DE", { hour: "2-digit", minute: "2-digit" });
  };

  const quickPrompts = ["How is my progress?", "Help with German B1", "FastAPI career tips", "Review my goals"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg">
          D
        </div>
        <div>
          <div className="font-bold text-white">Dex</div>
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            AI Life Coach  -  always on
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "dex" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5">
                D
              </div>
            )}
            <div className={`max-w-sm lg:max-w-md xl:max-w-lg ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
              <span className="text-xs text-gray-600 mt-1 px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              D
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-5 pt-0 border-t border-white/10">
        <div className="flex gap-3 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask Dex anything about your goals, habits, or life..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
