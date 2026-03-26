"use client";
import { useState, useEffect } from "react";
import { BookOpen, Plus, X, ArrowLeft, Tag, Smile, Trash2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

var TAG_COLORS = {
  Berlin: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Life: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Growth: "bg-green-500/15 text-green-400 border-green-500/20",
  Tech: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Win: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  FastAPI: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  German: "bg-red-500/15 text-red-400 border-red-500/20",
  Language: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

var moodEmojis = ["", ":(", ":/", ":|", ":/", ":|", ":)", ":D", "XD", "<3", "!!!"];

function getMoodColor(m) {
  if (m >= 9) return "text-purple-400";
  if (m >= 7) return "text-green-400";
  if (m >= 5) return "text-yellow-400";
  return "text-red-400";
}

export default function JournalPage() {
  var [entries, setEntries] = useState([]);
  var [loading, setLoading] = useState(true);
  var [userId, setUserId] = useState(null);
  var [showNew, setShowNew] = useState(false);
  var [newEntry, setNewEntry] = useState({ title: "", body: "", tags: "", mood: 7 });
  var [selectedEntry, setSelectedEntry] = useState(null);
  var [saving, setSaving] = useState(false);
  var [mounted, setMounted] = useState(false);

  useEffect(function() { setMounted(true); }, []);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        var uid = result.data.session.user.id;
        setUserId(uid);
        loadEntries(uid);
      }
    });
  }, []);

  async function loadEntries(uid) {
    setLoading(true);
    var result = await supabase.from("journal_entries").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    if (!result.error) setEntries(result.data);
    setLoading(false);
  }

  async function saveEntry() {
    if (!newEntry.title.trim() || !newEntry.body.trim() || !userId) return;
    setSaving(true);
    var data = {
      user_id: userId,
      title: newEntry.title.trim(),
      body: newEntry.body.trim(),
      tags: newEntry.tags.split(",").map(function(t) { return t.trim(); }).filter(Boolean),
      mood: newEntry.mood,
    };
    var result = await supabase.from("journal_entries").insert(data).select();
    if (!result.error) {
      setEntries([result.data[0]].concat(entries));
      setShowNew(false);
      setNewEntry({ title: "", body: "", tags: "", mood: 7 });
    }
    setSaving(false);
  }

  async function deleteEntry(id) {
    await supabase.from("journal_entries").delete().eq("id", id);
    setEntries(entries.filter(function(e) { return e.id !== id; }));
    if (selectedEntry && selectedEntry.id === id) setSelectedEntry(null);
  }

  var formatDate = function(ts) {
    return new Date(ts).toLocaleDateString("en-DE", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button onClick={function() { setSelectedEntry(null); }} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
          </button>
          <button onClick={function() { deleteEntry(selectedEntry.id); }} className="text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm">
            <Trash2 size={14} /> Delete
          </button>
        </div>
        <div className="glass-card p-8 rounded-2xl border border-white/[0.06]">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-black text-white">{selectedEntry.title}</h1>
            <div className={"text-2xl font-black font-display " + getMoodColor(selectedEntry.mood)}>
              {selectedEntry.mood}/10
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-5">{formatDate(selectedEntry.created_at)}</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedEntry.tags.map(function(tag) {
              return (
                <span key={tag} className={"text-xs px-2.5 py-1 rounded-full border " + (TAG_COLORS[tag] || "bg-white/10 text-gray-400 border-white/10")}>
                  {tag}
                </span>
              );
            })}
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">{selectedEntry.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-indigo-400" />
            <h1 className="text-3xl font-black text-white">Journal</h1>
          </div>
          <p className="text-gray-500 text-sm">Capture your thoughts, wins, and reflections</p>
        </div>
        <button
          onClick={function() { setShowNew(!showNew); }}
          className={"px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2 " + (showNew ? "bg-white/10" : "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/20")}
        >
          {showNew ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Entry</>}
        </button>
      </div>

      {/* New Entry Form */}
      {showNew && (
        <div className="glass-card p-6 rounded-2xl border border-purple-500/20 space-y-4 animate-slide-up">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-[0.15em]">New Journal Entry</h2>
          <input
            value={newEntry.title}
            onChange={function(e) { setNewEntry(Object.assign({}, newEntry, { title: e.target.value })); }}
            placeholder="Entry title..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
          />
          <textarea
            value={newEntry.body}
            onChange={function(e) { setNewEntry(Object.assign({}, newEntry, { body: e.target.value })); }}
            placeholder="What happened today? Any thoughts, wins, or challenges..."
            rows={6}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none text-sm transition-all"
          />
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                value={newEntry.tags}
                onChange={function(e) { setNewEntry(Object.assign({}, newEntry, { tags: e.target.value })); }}
                placeholder="Tags (comma-separated)"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4">
              <Smile size={14} className="text-gray-600" />
              <input
                type="number" min="1" max="10"
                value={newEntry.mood}
                onChange={function(e) { setNewEntry(Object.assign({}, newEntry, { mood: Number(e.target.value) })); }}
                className="w-12 bg-transparent text-white text-center font-bold font-display"
              />
            </div>
          </div>
          <button onClick={saveEntry} disabled={saving} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50">
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map(function(entry, index) {
          return (
            <button
              key={entry.id}
              onClick={function() { setSelectedEntry(entry); }}
              className="w-full glass-card p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] text-left transition-all group"
              style={{ animationDelay: (index * 0.05) + "s" }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{entry.title}</h3>
                <span className={"text-sm font-bold font-display shrink-0 ml-4 " + getMoodColor(entry.mood)}>{entry.mood}/10</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{entry.body}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map(function(tag) {
                    return (
                      <span key={tag} className={"text-[10px] px-2 py-0.5 rounded-full border " + (TAG_COLORS[tag] || "bg-white/10 text-gray-400 border-white/10")}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-700">{formatDate(entry.created_at)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
