"use client";
import { useState, useEffect } from "react";
import { CalendarCheck, Heart, Zap, Save, CheckCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { awardXP, checkAndAwardBadges, XP_AWARDS } from "../../../lib/xp";

var moodLabels = ["", "Awful", "Bad", "Rough", "Meh", "Okay", "Good", "Great", "Amazing", "Excellent", "Perfect"];
var energyLabels = ["", "Drained", "Low", "Tired", "Sluggish", "Neutral", "Active", "Energized", "Pumped", "Fired Up", "Max Power"];

var moodColorMap = {
  1: "#ef4444", 2: "#f87171", 3: "#f97316", 4: "#fb923c",
  5: "#eab308", 6: "#a3e635", 7: "#4ade80", 8: "#34d399",
  9: "#22d3ee", 10: "#a78bfa",
};

function getMoodTextColor(val) {
  var map = {
    1: "text-red-500", 2: "text-red-400", 3: "text-orange-500", 4: "text-orange-400",
    5: "text-yellow-500", 6: "text-lime-400", 7: "text-green-400", 8: "text-emerald-400",
    9: "text-cyan-400", 10: "text-purple-400"
  };
  return map[val] || "text-white";
}

function CircularMood(props) {
  var size = props.size || 70;
  var strokeWidth = props.strokeWidth || 5;
  var value = props.value || 1;
  var color = moodColorMap[value] || "#8b5cf6";
  var radius = (size - strokeWidth) / 2;
  var circumference = radius * 2 * Math.PI;
  var offset = circumference - (value / 10) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out", filter: "drop-shadow(0 0 6px " + color + ")" }} />
    </svg>
  );
}

export default function CheckinPage() {
  var [mood, setMood] = useState(7);
  var [energy, setEnergy] = useState(6);
  var [note, setNote] = useState("");
  var [submitted, setSubmitted] = useState(false);
  var [saving, setSaving] = useState(false);
  var [userId, setUserId] = useState(null);
  var [mounted, setMounted] = useState(false);
  var [xpToast, setXpToast] = useState("");

  useEffect(function() { setMounted(true); }, []);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) setUserId(result.data.session.user.id);
    });
  }, []);

  async function handleSubmit() {
    if (!userId) return;
    setSaving(true);
    var data = { user_id: userId, mood: mood, energy: energy, note: note };
    var result = await supabase.from("checkins").insert(data);
    if (!result.error) {
      setSubmitted(true);
      setNote("");

      // Award XP
      try {
        var profileRes = await supabase.from("profiles").select("xp, level, badges").eq("id", userId).single();
        var curXp = profileRes.data?.xp || 0;
        var curBadges = profileRes.data?.badges || [];

        // Get checkin count for badge checks
        var countRes = await supabase.from("checkins").select("id", { count: "exact" }).eq("user_id", userId);
        var checkinCount = (countRes.count || 0) + 1;

        var xpResult = await awardXP(userId, XP_AWARDS.CHECKIN, curXp, curBadges, { type: "checkin", data: {} });
        await checkAndAwardBadges(userId, xpResult.newBadges, { checkins: checkinCount });

        var toastMsg = "+20 XP earned!";
        if (xpResult.leveledUp) toastMsg = "Level Up! Now Level " + xpResult.newLevel + " - +20 XP!";
        setXpToast(toastMsg);
        setTimeout(function() { setXpToast(""); }, 3000);
      } catch(e) {}

      setTimeout(function() { setSubmitted(false); }, 2500);
    }
    setSaving(false);
  }

  var score = Math.round((mood + energy) / 2 * 10);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 stagger-children">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold shadow-2xl shadow-purple-500/30 animate-fade-in flex items-center gap-2">
          <span className="text-yellow-300">⚡</span>
          {xpToast}
        </div>
      )}
      <div className="flex items-center gap-2 mb-1">
        <CalendarCheck size={18} className="text-cyan-400" />
        <h1 className="text-3xl font-black text-white">Daily Check-In</h1>
      </div>
      <p className="text-gray-500 text-sm -mt-4">How are you feeling today, Dhanush?</p>

      {/* Mood */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-purple-400" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Mood</h2>
          </div>
          <div className={"text-xl font-black font-display " + getMoodTextColor(mood)}>
            {mood}/10 - {moodLabels[mood]}
          </div>
        </div>
        <input
          type="range" min="1" max="10" value={mood}
          onChange={function(e) { setMood(Number(e.target.value)); }}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-700 mt-2 px-1">
          <span>Awful</span><span>Neutral</span><span>Perfect</span>
        </div>
      </div>

      {/* Energy */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-cyan-400" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Energy</h2>
          </div>
          <div className={"text-xl font-black font-display " + getMoodTextColor(energy)}>
            {energy}/10 - {energyLabels[energy]}
          </div>
        </div>
        <input
          type="range" min="1" max="10" value={energy}
          onChange={function(e) { setEnergy(Number(e.target.value)); }}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-700 mt-2 px-1">
          <span>Drained</span><span>Neutral</span><span>Max Power</span>
        </div>
      </div>

      {/* Note */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          Quick Note
        </h2>
        <textarea
          value={note}
          onChange={function(e) { setNote(e.target.value); }}
          placeholder="What is on your mind today? Any wins, challenges, or thoughts..."
          rows={4}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-white placeholder-gray-600 resize-none text-sm transition-all"
        />
      </div>

      {/* Summary */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <CircularMood size={60} strokeWidth={4} value={mood} />
                <div className="absolute">
                  <div className={"text-lg font-black font-display " + getMoodTextColor(mood)}>{mood}</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Mood</div>
            </div>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <CircularMood size={60} strokeWidth={4} value={energy} />
                <div className="absolute">
                  <div className={"text-lg font-black font-display " + getMoodTextColor(energy)}>{energy}</div>
                </div>
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Energy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gradient-cyan font-display">{score}</div>
              <div className="text-[10px] text-gray-600 mt-1">Score</div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitted || saving}
            className={"ml-auto px-6 py-3 text-white font-semibold rounded-xl transition-all text-sm flex items-center gap-2 " + (
              submitted
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            )}
          >
            {submitted ? <><CheckCircle size={16} /> Saved!</> : saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={16} /> Save Check-In</>}
          </button>
        </div>
      </div>
    </div>
  );
}
