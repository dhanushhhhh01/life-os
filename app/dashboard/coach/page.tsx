"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Mic } from "lucide-react";

var starterMessages = [
  {
    id: 1,
    role: "dex",
    content: "Hey Dhanush! I am Dex, your personal AI life coach. I know your goals, your habits, and your Berlin journey. What are we working on today - FastAPI, German, the internship hunt, or just a vibe check?",
    timestamp: new Date().toISOString(),
  }
];

export default function CoachPage() {
  var [messages, setMessages] = useState(starterMessages);
  var [input, setInput] = useState("");
  var [isTyping, setIsTyping] = useState(false);
  var [isListening, setIsListening] = useState(false);
  var bottomRef = useRef(null);
  var recognitionRef = useRef(null);

  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim() || isTyping) return;
    var userMsg = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    var updatedMessages = [].concat(messages, [userMsg]);
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      var res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      var data = await res.json();
      var dexMsg = {
        id: Date.now() + 1,
        role: "dex",
        content: data.response || "Something went wrong. Try again!",
        timestamp: new Date().toISOString(),
      };
      setMessages(function(prev) { return [].concat(prev, [dexMsg]); });
    } catch (err) {
      var errorMsg = {
        id: Date.now() + 1,
        role: "dex",
        content: "Connection hiccup! Try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages(function(prev) { return [].concat(prev, [errorMsg]); });
    } finally {
      setIsTyping(false);
    }
  }

  function toggleVoice() {
    var SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice not supported in this browser. Use Chrome!"); return; }
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    var recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = function(event) {
      var transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = function() { setIsListening(false); };
    recognition.onend = function() { setIsListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  var formatTime = function(ts) {
    return new Date(ts).toLocaleTimeString("en-DE", { hour: "2-digit", minute: "2-digit" });
  };

  var quickPrompts = ["How is my progress?", "Help with German B1", "FastAPI career tips", "Review my goals"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center gap-4 bg-[#0e0d20]/60 backdrop-blur-xl">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#46F0D2] to-[#FBE2B4] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#46F0D2]/20 animate-pulse-glow">
            <Sparkles size={20} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#080818] shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">Dex</div>
          <div className="text-[11px] text-green-400 flex items-center gap-1.5">
            <span className="inline-block">AI Life Coach - always on</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {messages.map(function(msg) {
          return (
            <div key={msg.id} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start") + " animate-slide-up"}>
              {msg.role === "dex" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#46F0D2]/20 to-[#FBE2B4]/20 border border-[#46F0D2]/20 flex items-center justify-center text-[#46F0D2] shrink-0 mr-2.5 mt-0.5">
                  <Sparkles size={14} />
                </div>
              )}
              <div className={"max-w-sm lg:max-w-md xl:max-w-lg flex flex-col " + (msg.role === "user" ? "items-end" : "items-start")}>
                <div className={"px-4 py-3 rounded-2xl text-sm leading-relaxed " + (
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#46F0D2] to-[#46F0D2] text-white rounded-br-md shadow-lg shadow-[#46F0D2]/10"
                    : "bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-bl-md"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-700 mt-1.5 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2.5 animate-slide-up">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#46F0D2]/20 to-[#FBE2B4]/20 border border-[#46F0D2]/20 flex items-center justify-center text-[#46F0D2] shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#46F0D2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-5 pb-3 flex gap-2 flex-wrap">
        {quickPrompts.map(function(prompt) {
          return (
            <button
              key={prompt}
              onClick={function() { setInput(prompt); }}
              className="text-xs px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-gray-500 hover:text-white hover:border-[#46F0D2]/30 hover:bg-[#46F0D2]/[0.05] transition-all"
            >
              {prompt}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-5 pt-0 border-t border-white/[0.06]">
        <div className="flex gap-3 mt-3">
          <button
            onClick={toggleVoice}
            className={"p-3 rounded-xl border transition-all " + (isListening ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse" : "bg-white/[0.04] border-white/[0.08] text-gray-600 hover:text-[#46F0D2] hover:border-[#46F0D2]/30")}
          >
            <Mic size={18} />
          </button>
          <input
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) sendMessage(); }}
            placeholder="Ask Dex anything about your goals, habits, or life..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-30 text-sm shadow-lg shadow-[#46F0D2]/20 flex items-center gap-2"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
