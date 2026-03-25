"use client";
import { useState } from "react";

const moodLabels = ["", "Awful", "Bad", "Rough", "Meh", "Okay", "Good", "Great", "Amazing", "Excellent", "Perfect"];
const energyLabels = ["", "Drained", "Low", "Tired", "Sluggish", "Neutral", "Active", "Energized", "Pumped", "Fired Up", "Max Power"];

export default function CheckinPage() {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(6);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const moodColors = ["", "red", "red", "orange", "orange", "yellow", "yellow", "green", "green", "cyan", "purple"];
  const getMoodColor = (val: number) => {
    const map: Record<number, string> = {
      1: "text-red-500", 2: "text-red-400", 3: "text-orange-500", 4: "text-orange-400",
      5: "text-yellow-500", 6: "text-yellow-400", 7: "text-green-400", 8: "text-green-300",
      9: "text-cyan-400", 10: "text-purple-400"
    };
    return map[val] || "text-white";
  };

  const handleSubmit = () => {
    const entry = { mood, energy, note, timestamp: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem("checkins") || "[]");
    existing.unshift(entry);
    localStorage.setItem("checkins", JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setNote("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Daily Check-In</h1>
        <p className="text-gray-400 mt-1">How are you feeling today, Dhanush?</p>
      </div>

      {/* Mood */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Mood</h2>
          <div className={`text-2xl font-black ${getMoodColor(mood)}`}>
            {mood}/10 — {moodLabels[mood]}
          </div>
        </div>
        <input
          type="range" min="1" max="10" value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="w-full h-3 accent-purple-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>1</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Energy */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Energy</h2>
          <div className={`text-2xl font-black ${getMoodColor(energy)}`}>
            {energy}/10 — {energyLabels[energy]}
          </div>
        </div>
        <input
          type="range" min="1" max="10" value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="w-full h-3 accent-cyan-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>1</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Note */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What is on your mind today? Any wins, challenges, or thoughts..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 text-sm"
        />
      </div>

      {/* Summary */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-6">
        <div className="text-center">
          <div className={`text-3xl font-black ${getMoodColor(mood)}`}>{mood}</div>
          <div className="text-xs text-gray-500">Mood</div>
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="text-center">
          <div className={`text-3xl font-black ${getMoodColor(energy)}`}>{energy}</div>
          <div className="text-xs text-gray-500">Energy</div>
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="text-center">
          <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {Math.round((mood + energy) / 2 * 10)}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
        <button
          onClick={handleSubmit}
          className="ml-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          {submitted ? "Saved!" : "Save Check-In"}
        </button>
      </div>
    </div>
  );
}
