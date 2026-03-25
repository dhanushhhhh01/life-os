"use client";
import { useState } from "react";

interface JournalEntry {
  id: number;
  title: string;
  body: string;
  tags: string[];
  mood: number;
  timestamp: string;
}

const sampleEntries: JournalEntry[] = [
  {
    id: 1,
    title: "First week in Berlin — reflections",
    body: "The city is everything I imagined — fast-paced, multicultural, and full of opportunities. SRH campus is well-equipped and the AI/Robotics cohort is top-tier. Need to push harder on German.",
    tags: ["Berlin", "Life", "Growth"],
    mood: 8,
    timestamp: "2026-03-20T09:00:00Z"
  },
  {
    id: 2,
    title: "FastAPI breakthrough",
    body: "Finally cracked async endpoints with dependency injection. Built a small LLM wrapper in 2 hours. The momentum is incredible. Dex helped me debug the Pydantic model issues.",
    tags: ["Tech", "Win", "FastAPI"],
    mood: 9,
    timestamp: "2026-03-22T20:30:00Z"
  },
  {
    id: 3,
    title: "German practice — Tandem session",
    body: "Met Marco for a language exchange. He wants to learn Tamil, I want German B1. The exchange is great — 30 mins each language. Progress is slow but real.",
    tags: ["German", "Language", "Berlin"],
    mood: 7,
    timestamp: "2026-03-24T18:00:00Z"
  },
];

const TAG_COLORS: Record<string, string> = {
  Berlin: "bg-blue-500/20 text-blue-400",
  Life: "bg-purple-500/20 text-purple-400",
  Growth: "bg-green-500/20 text-green-400",
  Tech: "bg-cyan-500/20 text-cyan-400",
  Win: "bg-yellow-500/20 text-yellow-400",
  FastAPI: "bg-orange-500/20 text-orange-400",
  German: "bg-red-500/20 text-red-400",
  Language: "bg-pink-500/20 text-pink-400",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showNew, setShowNew] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", body: "", tags: "", mood: 7 });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const saveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.body.trim()) return;
    const e: JournalEntry = {
      id: Date.now(),
      title: newEntry.title.trim(),
      body: newEntry.body.trim(),
      tags: newEntry.tags.split(",").map(t => t.trim()).filter(Boolean),
      mood: newEntry.mood,
      timestamp: new Date().toISOString(),
    };
    setEntries([e, ...entries]);
    setShowNew(false);
    setNewEntry({ title: "", body: "", tags: "", mood: 7 });
  };

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString("en-DE", { day: "numeric", month: "short", year: "numeric" });
  };

  const getMoodColor = (m: number) => {
    if (m >= 9) return "text-purple-400";
    if (m >= 7) return "text-green-400";
    if (m >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  if (selectedEntry) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-2">
          Back to Journal
        </button>
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-black text-white">{selectedEntry.title}</h1>
            <span className={`text-2xl font-black ${getMoodColor(selectedEntry.mood)}`}>{selectedEntry.mood}/10</span>
          </div>
          <div className="text-xs text-gray-500 mb-4">{formatDate(selectedEntry.timestamp)}</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedEntry.tags.map(tag => (
              <span key={tag} className={`text-xs px-2 py-1 rounded-full ${TAG_COLORS[tag] || "bg-white/10 text-gray-400"}`}>{tag}</span>
            ))}
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedEntry.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Journal</h1>
          <p className="text-gray-400 mt-1">Capture your thoughts, wins, and reflections</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          + New Entry
        </button>
      </div>

      {/* New Entry Form */}
      {showNew && (
        <div className="glass-card p-5 rounded-2xl border border-purple-500/30 space-y-4">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest">New Journal Entry</h2>
          <input
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            placeholder="Entry title..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
          />
          <textarea
            value={newEntry.body}
            onChange={(e) => setNewEntry({ ...newEntry, body: e.target.value })}
            placeholder="What happened today? Any thoughts, wins, or challenges..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 text-sm"
          />
          <div className="flex gap-3">
            <input
              value={newEntry.tags}
              onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
              placeholder="Tags (comma-separated, e.g. Tech, Win)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4">
              <span className="text-xs text-gray-500">Mood</span>
              <input
                type="number" min="1" max="10"
                value={newEntry.mood}
                onChange={(e) => setNewEntry({ ...newEntry, mood: Number(e.target.value) })}
                className="w-12 bg-transparent text-white text-center focus:outline-none font-bold"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveEntry} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm">
              Save Entry
            </button>
            <button onClick={() => setShowNew(false)} className="px-6 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="w-full glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 text-left transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{entry.title}</h3>
              <span className={`text-sm font-bold ${getMoodColor(entry.mood)} shrink-0 ml-4`}>{entry.mood}/10</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{entry.body}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {entry.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[tag] || "bg-white/10 text-gray-400"}`}>{tag}</span>
                ))}
              </div>
              <span className="text-xs text-gray-600">{formatDate(entry.timestamp)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
