"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Zap,
  Flame,
  Star,
  Heart,
  ChevronRight,
  Brain,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

var CHAT_KEY = "dex_chat_v3";
var MAX_SAVED = 60;

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: number;
  role: "dex" | "user";
  content: string;
  timestamp: string;
};

type Context = {
  goals: any[];
  habits: any[];
  recentCheckin: any;
  profile: any;
};

// ─── Markdown renderer (safe subset) ─────────────────────────────────────────
function renderMarkdown(text: string): string {
  var escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold
  var processed = escaped.replace(
    /\*\*(.*?)\*\*/g,
    "<strong class='text-white font-semibold'>$1</strong>"
  );
  // Italic
  processed = processed.replace(
    /\*(.*?)\*/g,
    "<em class='text-gray-300 italic'>$1</em>"
  );
  // Bullet list lines
  processed = processed.replace(
    /^- (.*?)$/gm,
    "<div class='flex gap-2 my-0.5 leading-relaxed'><span class='text-[#46F0D2] shrink-0 mt-0.5'>&#x25B8;</span><span>$1</span></div>"
  );
  // Line breaks
  processed = processed.replace(/\n\n/g, "<div class='my-2'></div>");
  processed = processed.replace(/\n/g, "<br/>");

  return processed;
}

// ─── Build greeting from live context ─────────────────────────────────────────
function buildGreeting(ctx: Context): string {
  var habits = ctx.habits || [];
  var goals = ctx.goals || [];
  var checkin = ctx.recentCheckin;
  var profile = ctx.profile;

  var topStreak = habits.reduce(
    (max: any, h: any) => (h.streak > max.streak ? h : max),
    { streak: 0, name: "" }
  );
  var topGoal = goals.reduce(
    (max: any, g: any) => (g.progress > max.progress ? g : max),
    { progress: 0, name: "your goals" }
  );
  var notDone = habits.filter((h: any) => !h.done_today);

  var parts: string[] = [];

  parts.push("Hey Dhanush! Dex here, fully loaded with your data.");

  if (checkin) {
    if (checkin.energy <= 3) {
      parts.push(
        "I can see your energy is low right now — let's keep it light and strategic today."
      );
    } else if (checkin.mood >= 8) {
      parts.push("You checked in feeling great — let's make the most of this!");
    }
  }

  if (profile) {
    parts.push("You're at **Level " + profile.level + "** (" + profile.xp + " XP).");
  }

  if (topStreak.streak > 5) {
    parts.push(
      "Your " + topStreak.name + " streak is at **" + topStreak.streak + " days** — that's identity-level momentum."
    );
  }

  if (topGoal.name && topGoal.name !== "your goals") {
    parts.push(
      topGoal.name + " is your lead goal at **" + topGoal.progress + "%** — keep pushing."
    );
  }

  if (notDone.length > 0) {
    parts.push(
      "Still to check off today: " + notDone.slice(0, 3).map((h: any) => h.name).join(", ") + "."
    );
  }

  parts.push("What are we working on?");

  return parts.join(" ");
}

// ─── Dynamic context-aware quick prompts ─────────────────────────────────────
function getQuickPrompts(ctx: Context): string[] {
  var habits = ctx.habits || [];
  var goals = ctx.goals || [];
  var checkin = ctx.recentCheckin;

  var prompts: string[] = [];

  // Energy-aware
  if (checkin && checkin.energy <= 4) {
    prompts.push("I'm low energy, what should I do?");
  }

  // Habit nudge
  var notDone = habits.filter((h: any) => !h.done_today);
  if (notDone.length > 0) {
    prompts.push("Which habit should I do first?");
  }

  // Stalled goal
  var stalledGoal = goals.find((g: any) => g.progress < 30);
  if (stalledGoal) {
    prompts.push("How do I unblock: " + stalledGoal.name.slice(0, 25));
  }

  // Always include a few anchors
  if (prompts.length < 2) prompts.push("Plan my day");
  prompts.push("German B1 practice tips");
  if (prompts.length < 4) prompts.push("Internship strategy");
  prompts.push("Review my week");

  return prompts.slice(0, 5);
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CoachPage() {
  var [messages, setMessages] = useState<Message[]>([]);
  var [input, setInput] = useState("");
  var [isStreaming, setIsStreaming] = useState(false);
  var [isListening, setIsListening] = useState(false);
  var [ttsEnabled, setTtsEnabled] = useState(true);
  var [speakingId, setSpeakingId] = useState<number | null>(null);
  var [copiedId, setCopiedId] = useState<number | null>(null);
  var [context, setContext] = useState<Context>({
    goals: [],
    habits: [],
    recentCheckin: null,
    profile: null,
  });
  var [dataLoaded, setDataLoaded] = useState(false);
  var [showClearConfirm, setShowClearConfirm] = useState(false);
  var [quickPrompts, setQuickPrompts] = useState<string[]>([
    "Plan my day",
    "German B1 practice tips",
    "Internship strategy",
    "Review my week",
  ]);

  var bottomRef = useRef<HTMLDivElement | null>(null);
  var recognitionRef = useRef<any>(null);
  var synthRef = useRef<SpeechSynthesis | null>(null);
  var contextRef = useRef<Context>(context);
  var inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(function () {
    contextRef.current = context;
  }, [context]);

  // ── Init speech synthesis ──────────────────────────────────────────────────
  useEffect(function () {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(function () {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // ── Load Supabase data + chat history ─────────────────────────────────────
  useEffect(function () {
    async function loadAll() {
      var sessionRes = await supabase.auth.getSession();
      var userId = sessionRes.data.session?.user?.id;

      if (!userId) {
        setMessages([
          {
            id: 1,
            role: "dex",
            content:
              "Hey Dhanush! Log in to get your personalised coaching session with your live goals, habits, and mood data.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setDataLoaded(true);
        return;
      }

      try {
        var results = await Promise.all([
          supabase
            .from("goals")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("habits")
            .select("*")
            .eq("user_id", userId)
            .order("streak", { ascending: false }),
          supabase
            .from("checkins")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single(),
        ]);

        var ctx: Context = {
          goals: results[0].data || [],
          habits: results[1].data || [],
          recentCheckin: results[2].data?.[0] || null,
          profile: results[3].data || null,
        };

        setContext(ctx);
        contextRef.current = ctx;
        setQuickPrompts(getQuickPrompts(ctx));

        // Load saved chat
        var saved: Message[] | null = null;
        try {
          var raw = localStorage.getItem(CHAT_KEY);
          if (raw) saved = JSON.parse(raw);
        } catch (_e) {}

        if (saved && saved.length > 1) {
          setMessages(saved);
        } else {
          setMessages([
            {
              id: 1,
              role: "dex",
              content: buildGreeting(ctx),
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Load error:", err);
        setMessages([
          {
            id: 1,
            role: "dex",
            content:
              "Hey Dhanush! I couldn't load your data right now, but I'm still here. What do you want to work on?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }

      setDataLoaded(true);
    }

    loadAll();
  }, []);

  // ── Persist chat to localStorage ─────────────────────────────────────────
  useEffect(
    function () {
      if (!dataLoaded || messages.length === 0) return;
      try {
        localStorage.setItem(
          CHAT_KEY,
          JSON.stringify(messages.slice(-MAX_SAVED))
        );
      } catch (_e) {}
    },
    [messages, dataLoaded]
  );

  // ── TTS ────────────────────────────────────────────────────────────────────
  var speakMessage = useCallback(function (text: string, msgId: number) {
    if (!synthRef.current || !ttsEnabled) return;
    synthRef.current.cancel();
    var cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#+\s/g, "")
      .replace(/&#x25B8;/g, "")
      .slice(0, 600);
    var utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    var voices = synthRef.current.getVoices();
    var preferred =
      voices.find(function (v) {
        return v.name.includes("Google UK English Female");
      }) ||
      voices.find(function (v) {
        return v.name.includes("Samantha");
      }) ||
      voices.find(function (v) {
        return v.name.includes("Google US English");
      }) ||
      voices.find(function (v) {
        return v.lang === "en-US" && v.localService;
      }) ||
      voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = function () {
      setSpeakingId(msgId);
    };
    utterance.onend = function () {
      setSpeakingId(null);
    };
    utterance.onerror = function () {
      setSpeakingId(null);
    };
    synthRef.current.speak(utterance);
  }, [ttsEnabled]);

  function stopSpeaking() {
    if (synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);
  }

  function toggleTts() {
    if (ttsEnabled && synthRef.current) synthRef.current.cancel();
    setSpeakingId(null);
    setTtsEnabled(function (prev) {
      return !prev;
    });
  }

  // ── Copy message ──────────────────────────────────────────────────────────
  function copyMessage(id: number, text: string) {
    navigator.clipboard.writeText(text).then(function () {
      setCopiedId(id);
      setTimeout(function () {
        setCopiedId(null);
      }, 1800);
    });
  }

  // ── Clear chat ────────────────────────────────────────────────────────────
  function clearChat() {
    stopSpeaking();
    var greeting = dataLoaded
      ? buildGreeting(contextRef.current)
      : "Hey Dhanush! Fresh start - what are we working on?";
    setMessages([
      {
        id: Date.now(),
        role: "dex",
        content: greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
    try {
      localStorage.removeItem(CHAT_KEY);
    } catch (_e) {}
    setShowClearConfirm(false);
  }

  // ── Send message (streaming) ──────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || isStreaming) return;

    var userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    var updatedMessages = messages.concat([userMsg]);
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    var dexMsgId = Date.now() + 1;
    var dexMsg: Message = {
      id: dexMsgId,
      role: "dex",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages(function (prev) {
      return prev.concat([dexMsg]);
    });

    try {
      var res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          context: contextRef.current,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Bad response");
      }

      // Check if streaming or JSON fallback
      var contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/plain")) {
        // Streaming path
        var reader = res.body.getReader();
        var dec = new TextDecoder();
        var fullText = "";

        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          fullText += dec.decode(chunk.value, { stream: true });
          var snapshot = fullText;
          setMessages(function (prev) {
            return prev.map(function (m) {
              return m.id === dexMsgId ? { ...m, content: snapshot } : m;
            });
          });
        }

        // Speak after streaming complete
        if (ttsEnabled && fullText) {
          setTimeout(function () {
            speakMessage(fullText, dexMsgId);
          }, 300);
        }
      } else {
        // JSON fallback
        var data = await res.json();
        var fallbackText =
          data.response || "Something went wrong. Try again!";
        setMessages(function (prev) {
          return prev.map(function (m) {
            return m.id === dexMsgId
              ? { ...m, content: fallbackText }
              : m;
          });
        });
        if (ttsEnabled) {
          setTimeout(function () {
            speakMessage(fallbackText, dexMsgId);
          }, 300);
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessages(function (prev) {
        return prev.map(function (m) {
          return m.id === dexMsgId
            ? {
                ...m,
                content:
                  "Connection hiccup! Check your internet and try again.",
              }
            : m;
        });
      });
    } finally {
      setIsStreaming(false);
    }
  }

  // ── Voice input ───────────────────────────────────────────────────────────
  function toggleVoice() {
    var SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice not supported in this browser. Use Chrome!");
      return;
    }
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    var rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = function (e: any) {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = function () {
      setIsListening(false);
    };
    rec.onend = function () {
      setIsListening(false);
    };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("en-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ─── Context chips ────────────────────────────────────────────────────────
  var topStreak =
    context.habits.length > 0
      ? context.habits.reduce(
          (max: any, h: any) => (h.streak > max.streak ? h : max),
          { streak: 0, name: "" }
        )
      : null;

  var moodEmoji = context.recentCheckin
    ? context.recentCheckin.mood >= 8
      ? "Mood: Great"
      : context.recentCheckin.mood >= 5
      ? "Mood: OK"
      : "Mood: Low"
    : null;

  var energyLabel = context.recentCheckin
    ? "Energy: " + context.recentCheckin.energy + "/10"
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="p-5 border-b border-white/[0.06] flex items-center gap-4 bg-[#0e0d20]/60 backdrop-blur-xl shrink-0">
        {/* Dex 3D Animated Orb */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0 group">
          {/* Outer glow */}
          <div className={"absolute inset-0 rounded-full blur-md transition-all duration-500 " + (isListening ? 'bg-orange-500/60 animate-pulse' : speakingId ? 'bg-[#46F0D2]/50 animate-pulse-mint' : 'bg-[#46F0D2]/20 animate-breathe group-hover:bg-[#46F0D2]/40')} />
          
          {/* Orb core */}
          <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-[#13122c] to-[#1a1932] border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(70,240,210,0.15)] transition-all duration-300">
            {/* Inner energy fields */}
            <div className={"absolute w-[160%] h-[160%] mix-blend-screen opacity-60 animate-spin-slow transition-all duration-700 " + (speakingId ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#46F0D2]/40 via-transparent to-transparent' : isListening ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/40 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#46F0D2]/10 via-transparent to-transparent')} />
            
            <div className={"absolute w-[130%] h-[130%] mix-blend-screen animate-morph transition-all duration-700 " + (speakingId ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/30 via-transparent to-transparent' : isListening ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/30 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FBE2B4]/15 via-transparent to-transparent')} />
            
            {/* Center Icon */}
            {isListening ? (
              <Mic size={18} className="text-orange-400 relative z-10 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            ) : speakingId ? (
              <span className="relative z-10 flex items-center gap-0.5 h-4">
                <span className="w-1 h-3 bg-[#46F0D2] rounded-full animate-pulse shadow-[0_0_8px_rgba(70,240,210,0.8)]" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-4 bg-[#46F0D2] rounded-full animate-pulse shadow-[0_0_8px_rgba(70,240,210,0.8)]" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-2 bg-[#46F0D2] rounded-full animate-pulse shadow-[0_0_8px_rgba(70,240,210,0.8)]" style={{ animationDelay: "300ms" }} />
              </span>
            ) : (
              <Brain size={18} className="text-white/80 relative z-10 transition-transform group-hover:scale-110" />
            )}
          </div>
          
          {/* Status dot */}
          <div className={"absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0e0d20] transition-all " + (isListening ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : dataLoaded ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-500')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            Dex
            {dataLoaded && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#46F0D2]/10 border border-[#46F0D2]/20 text-[#46F0D2] font-normal">
                Live data
              </span>
            )}
          </div>
          <div className="text-[11px] text-green-400 flex items-center gap-1.5">
            {speakingId ? (
              <>
                <span>Speaking</span>
                <span className="flex gap-0.5 items-end h-3">
                  {[0, 100, 200, 50, 150].map(function (delay, i) {
                    return (
                      <span
                        key={i}
                        className="w-0.5 bg-[#46F0D2] rounded-full animate-bounce"
                        style={{
                          height: [6, 10, 7, 12, 5][i] + "px",
                          animationDelay: delay + "ms",
                        }}
                      />
                    );
                  })}
                </span>
              </>
            ) : isStreaming ? (
              "Thinking..."
            ) : (
              "AI Life Coach - always on"
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Clear chat */}
          {showClearConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">Clear?</span>
              <button
                onClick={clearChat}
                className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
              >
                Yes
              </button>
              <button
                onClick={function () {
                  setShowClearConfirm(false);
                }}
                className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-white transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={function () {
                setShowClearConfirm(true);
              }}
              title="Clear chat"
              className="p-2 rounded-xl border bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400 hover:border-white/[0.12] transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* TTS toggle */}
          <button
            onClick={toggleTts}
            title={ttsEnabled ? "Mute Dex" : "Unmute Dex"}
            className={
              "p-2.5 rounded-xl border transition-all " +
              (ttsEnabled
                ? "bg-[#46F0D2]/10 border-[#46F0D2]/30 text-[#46F0D2] shadow-[0_0_12px_rgba(70,240,210,0.15)]"
                : "bg-white/[0.04] border-white/[0.08] text-gray-600 hover:text-gray-400")
            }
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* ── Context chips bar ── */}
      {dataLoaded &&
        (context.recentCheckin || context.profile || topStreak) && (
          <div className="px-5 py-2.5 border-b border-white/[0.04] flex gap-2 flex-wrap bg-[#080814]/60 shrink-0">
            {context.profile && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-[#46F0D2]/10 border border-[#46F0D2]/20 text-[#46F0D2]">
                <Star size={9} />
                Lv {context.profile.level}
                <span className="text-[#46F0D2]/60 ml-0.5">
                  {context.profile.xp} XP
                </span>
              </span>
            )}
            {moodEmoji && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-400">
                <Heart size={9} />
                {moodEmoji}
              </span>
            )}
            {energyLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-400">
                <Zap size={9} />
                {energyLabel}
              </span>
            )}
            {topStreak && topStreak.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Flame size={9} />
                {topStreak.streak}d {topStreak.name}
              </span>
            )}
            {context.goals.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-500">
                {context.goals.length} goals
                <ChevronRight size={9} />
                {context.habits.filter((h: any) => h.done_today).length}/
                {context.habits.length} habits done
              </span>
            )}
          </div>
        )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {/* Loading skeleton */}
        {!dataLoaded && (
          <div className="flex items-start gap-2.5 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] shrink-0" />
            <div className="space-y-2 flex-1 max-w-sm">
              <div className="h-3 bg-white/[0.06] rounded-full w-3/4" />
              <div className="h-3 bg-white/[0.06] rounded-full w-1/2" />
            </div>
          </div>
        )}

        {messages.map(function (msg) {
          var isUser = msg.role === "user";
          var isSpeaking = speakingId === msg.id;
          var isCopied = copiedId === msg.id;
          var isEmpty = msg.content === "" && isStreaming;

          return (
            <div
              key={msg.id}
              className={
                "flex " +
                (isUser ? "justify-end" : "justify-start") +
                " animate-slide-up"
              }
            >
              {/* Dex avatar */}
              {!isUser && (
                <div
                  className={
                    "w-8 h-8 rounded-lg bg-gradient-to-br from-[#46F0D2]/20 to-[#FBE2B4]/20 border flex items-center justify-center text-[#46F0D2] shrink-0 mr-2.5 mt-0.5 transition-all " +
                    (isSpeaking
                      ? "border-[#46F0D2]/60 shadow-[0_0_14px_rgba(70,240,210,0.3)]"
                      : "border-[#46F0D2]/20")
                  }
                >
                  <Sparkles size={13} />
                </div>
              )}

              <div
                className={
                  "max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg flex flex-col " +
                  (isUser ? "items-end" : "items-start")
                }
              >
                {/* Bubble */}
                <div
                  className={
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all " +
                    (isUser
                      ? "bg-gradient-to-r from-[#46F0D2] to-[#3ad4bc] text-white rounded-br-sm shadow-lg shadow-[#46F0D2]/10"
                      : "bg-white/[0.04] border text-gray-300 rounded-bl-sm " +
                        (isSpeaking
                          ? "border-[#46F0D2]/25 shadow-[0_0_18px_rgba(70,240,210,0.08)]"
                          : "border-white/[0.07]"))
                  }
                >
                  {isEmpty ? (
                    // Streaming "thinking" dots
                    <div className="flex gap-1.5 py-0.5">
                      <span
                        className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  ) : isUser ? (
                    msg.content
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  )}
                  {/* Streaming cursor */}
                  {!isUser && isStreaming && msg.content && (
                    <span className="inline-block w-0.5 h-4 bg-[#46F0D2] ml-0.5 animate-pulse rounded-full align-middle" />
                  )}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  <span className="text-[10px] text-gray-700">
                    {formatTime(msg.timestamp)}
                  </span>

                  {!isUser && msg.content && (
                    <>
                      {/* TTS button */}
                      <button
                        onClick={function () {
                          isSpeaking
                            ? stopSpeaking()
                            : speakMessage(msg.content, msg.id);
                        }}
                        className={
                          "text-[10px] flex items-center gap-1 transition-all " +
                          (isSpeaking
                            ? "text-[#46F0D2]"
                            : "text-gray-700 hover:text-gray-500")
                        }
                      >
                        {isSpeaking ? (
                          <VolumeX size={10} />
                        ) : (
                          <Volume2 size={10} />
                        )}
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={function () {
                          copyMessage(msg.id, msg.content);
                        }}
                        className={
                          "text-[10px] flex items-center gap-1 transition-all " +
                          (isCopied
                            ? "text-[#46F0D2]"
                            : "text-gray-700 hover:text-gray-500")
                        }
                        title="Copy message"
                      >
                        {isCopied ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick Prompts ── */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap shrink-0">
        {quickPrompts.map(function (prompt) {
          return (
            <button
              key={prompt}
              onClick={function () {
                setInput(prompt);
                if (inputRef.current) inputRef.current.focus();
              }}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-gray-500 hover:text-white hover:border-[#46F0D2]/30 hover:bg-[#46F0D2]/[0.05] transition-all"
            >
              {prompt}
            </button>
          );
        })}
      </div>

      {/* ── Input ── */}
      <div className="p-5 pt-0 border-t border-white/[0.06] shrink-0">
        <div className="flex gap-3 mt-3">
          <button
            onClick={toggleVoice}
            title="Voice input"
            className={
              "p-3 rounded-xl border transition-all shrink-0 " +
              (isListening
                ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                : "bg-white/[0.04] border-white/[0.08] text-gray-600 hover:text-[#46F0D2] hover:border-[#46F0D2]/30")
            }
          >
            <Mic size={18} />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={function (e) {
              setInput(e.target.value);
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              isStreaming
                ? "Dex is thinking..."
                : "Ask Dex anything about your goals, habits, or life..."
            }
            disabled={isStreaming}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all focus:outline-none focus:border-[#46F0D2]/30 focus:bg-white/[0.06] disabled:opacity-50"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="px-5 py-3 bg-gradient-to-r from-[#46F0D2] to-[#3ad4bc] text-[#080818] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-30 text-sm shadow-lg shadow-[#46F0D2]/20 flex items-center gap-2 shrink-0"
          >
            {isStreaming ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span className="hidden sm:inline">
              {isStreaming ? "" : "Send"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
