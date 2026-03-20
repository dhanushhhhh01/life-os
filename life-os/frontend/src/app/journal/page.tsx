"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, Plus, Trash2, Loader2, PenTool, Lightbulb, Expand,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { GlassCard } from "@/components/GlassCard";
import { MoodDot } from "@/components/MoodRing";
import { journal, ai } from "@/lib/api";
import type { JournalEntry, JournalAssistResponse } from "@/lib/api";
import { format } from "date-fns";

const moodTagColors: Record<string, string> = {
  grateful: "bg-green-500/20 text-green-300",
  anxious: "bg-red-500/20 text-red-300",
  motivated: "bg-yellow-500/20 text-yellow-300",
  stuck: "bg-orange-500/20 text-orange-300",
  reflective: "bg-blue-500/20 text-blue-300",
  frustrated: "bg-red-500/20 text-red-300",
  sad: "bg-indigo-500/20 text-indigo-300",
  happy: "bg-emerald-500/20 text-emerald-300",
  calm: "bg-cyan-500/20 text-cyan-300",
};

export default function JournalPage() {
  const { loggedIn } = useAuth();
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New entry form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMoodTag, setNewMoodTag] = useState("");
  const [saving, setSaving] = useState(false);

  // AI Assistant
  const [aiInput, setAiInput] = useState("");
  const [aiMode, setAiMode] = useState<"reflect" | "prompt" | "expand">("reflect");
  const [aiResult, setAiResult] = useState<JournalAssistResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
    loadEntries();
  }, [loggedIn]);

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await journal.list(50);
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSaveEntry() {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      await journal.create({
        title: newTitle || undefined,
        content: newContent,
        mood_tag: newMoodTag || undefined,
      });
      setNewTitle("");
      setNewContent("");
      setNewMoodTag("");
      setShowNew(false);
      await loadEntries();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await journal.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAIAssist() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await ai.journalAssist(aiInput, aiMode);
      setAiResult(res);
    } catch (err: any) {
      console.error(err);
    }
    setAiLoading(false);
  }

  async function handleSaveAIDraft() {
    if (!aiResult) return;
    setSaving(true);
    try {
      await journal.create({
        title: "AI-assisted reflection",
        content: aiResult.ai_response,
        mood_tag: aiResult.suggested_mood_tag,
      });
      setAiResult(null);
      setAiInput("");
      setShowAI(false);
      await loadEntries();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-64 p-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Journal</h1>
            <p className="text-white/40 mt-1">Your thoughts, reflections, and growth</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAI(!showAI); setShowNew(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 text-accent-light text-sm hover:bg-accent/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={() => { setShowNew(!showNew); setShowAI(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm hover:bg-accent-dark transition-all shadow-glow-sm"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </motion.div>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <GlassCard className="border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-accent-light" />
                  <h2 className="text-lg font-semibold text-white">AI Journal Assistant</h2>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-4">
                  {[
                    { mode: "reflect" as const, icon: PenTool, label: "Reflect", desc: "Follow-ups + draft" },
                    { mode: "prompt" as const, icon: Lightbulb, label: "Prompts", desc: "Get writing ideas" },
                    { mode: "expand" as const, icon: Expand, label: "Expand", desc: "Polish rough notes" },
                  ].map((m) => (
                    <button
                      key={m.mode}
                      onClick={() => setAiMode(m.mode)}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all ${
                        aiMode === m.mode
                          ? "bg-accent/15 text-accent-light border border-accent/30"
                          : "bg-surface-300/30 text-white/40 border border-transparent hover:text-white/60"
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <div className="text-left">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-[10px] opacity-60">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    aiMode === "reflect"
                      ? "Share how you're feeling... (e.g., 'I feel stuck in my career')"
                      : aiMode === "prompt"
                      ? "Describe what's on your mind, or leave blank for general prompts..."
                      : "Paste your rough notes or thoughts to expand..."
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 text-sm resize-none mb-4"
                />

                <button
                  onClick={handleAIAssist}
                  disabled={aiLoading || !aiInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Thinking..." : "Generate"}
                </button>

                {/* AI Result */}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 rounded-xl bg-surface-50 border border-glass-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent-light" />
                        <span className="text-sm text-accent-light/80">AI Response</span>
                        {aiResult.suggested_mood_tag && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${moodTagColors[aiResult.suggested_mood_tag] || "bg-surface-300 text-white/50"}`}>
                            {aiResult.suggested_mood_tag}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleSaveAIDraft}
                        disabled={saving}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-all"
                      >
                        {saving ? "Saving..." : "Save to Journal"}
                      </button>
                    </div>
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {aiResult.ai_response}
                    </div>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Entry Form */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <GlassCard>
                <h2 className="text-lg font-semibold text-white mb-4">New Journal Entry</h2>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 text-sm mb-3"
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 text-sm resize-none mb-3"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={newMoodTag}
                    onChange={(e) => setNewMoodTag(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-surface-300/50 border border-glass-border text-white text-sm focus:outline-none"
                  >
                    <option value="">Mood tag (optional)</option>
                    {Object.keys(moodTagColors).map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={() => setShowNew(false)}
                    className="px-4 py-2 rounded-xl text-white/40 text-sm hover:text-white/60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    disabled={saving || !newContent.trim()}
                    className="px-6 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Entry"}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-accent-light animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <GlassCard className="text-center py-16">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">Your journal is empty</h3>
            <p className="text-white/30 text-sm">
              Start writing or let the AI assistant help you reflect.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {entries.map((entry, i) => (
              <GlassCard
                key={entry.id}
                delay={i * 0.05}
                className="cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.mood_tag && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${moodTagColors[entry.mood_tag] || "bg-surface-300 text-white/50"}`}>
                        {entry.mood_tag}
                      </span>
                    )}
                    <span className="text-[10px] text-white/30">
                      {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {entry.title && (
                  <h3 className="text-white font-medium mb-1">{entry.title}</h3>
                )}
                <p className="text-sm text-white/50 leading-relaxed line-clamp-4">
                  {entry.content}
                </p>
                {entry.prompt && (
                  <p className="text-[10px] text-accent-light/40 mt-3 italic">
                    Prompt: &ldquo;{entry.prompt}&rdquo;
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
