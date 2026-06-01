"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../../lib/supabase";
import DexAvatar, { DexState } from "../../components/DexAvatar";
import { useDexVoice }         from "../../hooks/useDexVoice";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronLeft,
  Zap,
  Brain,
  Trash2,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id:        string;
  role:      "user" | "dex";
  content:   string;
  toolsUsed?: string[];
  timestamp: Date;
};

type Context = {
  goals:         any[];
  habits:        any[];
  recentCheckin: any;
  profile:       any;
};

// ─── State label + colour ─────────────────────────────────────────────────────

const STATE_LABEL: Record<DexState, string> = {
  idle:      "Dex is ready",
  thinking:  "Dex is thinking...",
  speaking:  "Dex is speaking...",
  listening: "Listening...",
};

const STATE_COLOR: Record<DexState, string> = {
  idle:      "text-cyan-400",
  thinking:  "text-purple-400",
  speaking:  "text-green-400",
  listening: "text-orange-400",
};

// ─── Tool label prettifier ────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  create_goal:          "goal created",
  update_goal_progress: "goal updated",
  log_habit:            "habit logged",
  create_journal_entry: "journal saved",
  update_checkin:       "mood logged",
  create_plan:          "plan created",
  save_memory:          "memory saved",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DexPage() {
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [dexState,     setDexState]     = useState<DexState>("idle");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [context,      setContext]      = useState<Context>({
    goals: [], habits: [], recentCheckin: null, profile: null,
  });
  const [userId,  setUserId]  = useState("dhanush");
  const [loading, setLoading] = useState(false);
  const [memCount, setMemCount] = useState(0);

  const chatEndRef    = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const sendLatestRef = useRef<(text: string) => void>();

  // ── Voice ─────────────────────────────────────────────────────────────────

  const handleTranscript = useCallback((text: string) => {
    sendLatestRef.current?.(text);
  }, []);

  const voice = useDexVoice({ onTranscript: handleTranscript });

  // Sync avatar state with voice states
  useEffect(() => {
    if (voice.isListening) {
      setDexState("listening");
    } else if (voice.isSpeaking) {
      setDexState("speaking");
    }
  }, [voice.isListening, voice.isSpeaking]);

  // ── Load user context from Supabase ───────────────────────────────────────

  useEffect(() => {
    async function loadContext() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id || "dhanush";
        setUserId(uid);

        const [goalsRes, habitsRes, checkinRes, profileRes, memRes] = await Promise.all([
          supabase.from("goals").select("*").eq("user_id", uid).limit(8),
          supabase.from("habits").select("*").eq("user_id", uid),
          supabase
            .from("checkins")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase.from("profiles").select("*").eq("id", uid).single(),
          supabase.from("agent_memory").select("id").eq("user_id", uid),
        ]);

        setContext({
          goals:         goalsRes.data  || [],
          habits:        habitsRes.data || [],
          recentCheckin: checkinRes.data?.[0] || null,
          profile:       profileRes.data || null,
        });

        setMemCount((memRes.data || []).length);
      } catch (err) {
        console.error("Context load error:", err);
      }
    }
    loadContext();
  }, []);

  // ── Initial greeting ──────────────────────────────────────────────────────

  useEffect(() => {
    setMessages([
      {
        id:        "welcome",
        role:      "dex",
        content:   "Hey Dhanush. I'm Dex — your agent, your coach, and your thinking partner.\n\nI remember everything across our sessions, I take action automatically, and I think deeply about what you actually need — not just what you ask.\n\nWhat's on your mind?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content:   trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setDexState("thinking");

    try {
      const res = await fetch("/api/agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed, userId, context }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      const dexMsg: Message = {
        id:        (Date.now() + 1).toString(),
        role:      "dex",
        content:   data.response || "Something went wrong.",
        toolsUsed: data.toolsUsed || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, dexMsg]);

      if (data.toolsUsed?.length) {
        // Update memory count if a memory was saved
        if (data.toolsUsed.includes("save_memory")) {
          setMemCount(n => n + 1);
        }
      }

      if (voiceEnabled && !data.error) {
        setDexState("speaking");
        voice.speak(data.response);
      } else {
        setDexState("idle");
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id:        Date.now().toString(),
          role:      "dex",
          content:   "Connection issue — give it a moment and try again.",
          timestamp: new Date(),
        },
      ]);
      setDexState("idle");
    } finally {
      setLoading(false);
    }
  }, [loading, userId, context, voiceEnabled, voice]);

  // Keep ref in sync with latest sendMessage
  sendLatestRef.current = sendMessage;

  // ── Keyboard submit ───────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ── Voice toggle ──────────────────────────────────────────────────────────

  function toggleVoice() {
    if (voiceEnabled) {
      voice.stopSpeaking();
      setVoiceEnabled(false);
      if (dexState === "speaking") setDexState("idle");
    } else {
      setVoiceEnabled(true);
    }
  }

  function toggleMic() {
    if (voice.isListening) voice.stopListening();
    else voice.startListening();
  }

  // ── Clear conversation ────────────────────────────────────────────────────

  function clearChat() {
    voice.stopSpeaking();
    setDexState("idle");
    setMessages([
      {
        id:        "reset",
        role:      "dex",
        content:   "Fresh start. What do you want to work on?",
        timestamp: new Date(),
      },
    ]);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#080810] text-white overflow-hidden relative">

      {/* ── Animated Background ────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] right-[5%] w-[45vw] h-[45vw] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" 
        />
      </div>

      {/* ── Content Wrapper ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/5 backdrop-blur-md shrink-0">
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Dashboard
          </a>

          {/* Centre badge */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Dex Agent
            </span>
            {memCount > 0 && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                title={`${memCount} memories stored`}
              >
                <Brain size={10} />
                {memCount}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={15} />
            </button>
            {voice.isSupported && (
              <button
                onClick={toggleVoice}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  voiceEnabled
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-gray-200"
                }`}
              >
                {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                {voiceEnabled ? "Voice" : "Mute"}
              </button>
            )}
          </div>
        </header>

        {/* ── Avatar + state ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center pt-6 pb-2 shrink-0">
          <DexAvatar state={dexState} size={220} />
          <p className={`text-xs font-medium mt-2 transition-all duration-500 tracking-wide uppercase ${STATE_COLOR[dexState]}`}>
            {STATE_LABEL[dexState]}
          </p>
        </div>

        {/* ── Chat ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
                    msg.role === "user"
                      ? "bg-cyan-500/15 text-white rounded-br-sm border border-cyan-400/20"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "dex" ? (
                    <div className="markdown-body space-y-2 prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-cyan-400 prose-strong:text-white prose-ul:my-2 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Tool tags */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {msg.toolsUsed.map(tool => (
                        <span
                          key={tool}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                        >
                          <Zap size={9} className="text-purple-400" />
                          {TOOL_LABELS[tool] || tool.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-bl-sm px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="flex gap-1.5 items-center h-4">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* ── Input bar ────────────────────────────────────────────────────── */}
        <div className="px-4 pb-6 pt-4 shrink-0 bg-gradient-to-t from-[#080810] to-transparent">
          <div className="flex items-end gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Talk to Dex..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none leading-relaxed py-1"
              style={{ height: "28px", maxHeight: "120px" }}
              disabled={loading}
            />

            {/* Mic button */}
            {voice.isSupported && (
              <button
                onClick={toggleMic}
                disabled={loading}
                className={`p-2 rounded-xl transition-all shrink-0 flex items-center justify-center ${
                  voice.isListening
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.3)] animate-pulse"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5 disabled:opacity-30"
                }`}
                title={voice.isListening ? "Stop listening" : "Speak to Dex"}
              >
                {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_12px_rgba(0,212,255,0.3)] border border-cyan-500/20 transition-all disabled:opacity-25 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
              title="Send"
            >
              {loading
                ? <RefreshCw size={18} className="animate-spin" />
                : <Send size={18} />
              }
            </button>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-3 tracking-wide">
            Enter to send · Shift+Enter for new line
            {voice.isSupported && " · Mic for voice"}
          </p>
        </div>
      </div>
    </div>
  );
}
