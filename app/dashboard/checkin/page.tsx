"use client";
import { useState, useEffect } from "react";
import { CalendarCheck, Heart, Zap, Save, CheckCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { awardXP, checkAndAwardBadges, XP_AWARDS } from "../../../lib/xp";

var moodOptions = [
  { value: 2, label: "Awful", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", glow: "rgba(239,68,68,0.25)" },
  { value: 4, label: "Bad", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)", glow: "rgba(249,115,22,0.25)" },
  { value: 6, label: "Okay", color: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.35)", glow: "rgba(234,179,8,0.25)" },
  { value: 8, label: "Good", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.35)", glow: "rgba(74,222,128,0.25)" },
  { value: 10, label: "Amazing", color: "#46F0D2", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.35)", glow: "rgba(129,140,248,0.25)" },
];

var energyOptions = [
  { value: 2, label: "Drained", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", glow: "rgba(239,68,68,0.25)" },
  { value: 4, label: "Tired", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)", glow: "rgba(249,115,22,0.25)" },
  { value: 6, label: "Normal", color: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.35)", glow: "rgba(234,179,8,0.25)" },
  { value: 8, label: "Pumped", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.35)", glow: "rgba(74,222,128,0.25)" },
  { value: 10, label: "MAX!", color: "#FBE2B4", bg: "rgba(251,226,180,0.12)", border: "rgba(251,226,180,0.35)", glow: "rgba(251,226,180,0.35)" },
];

// SVG face components
function MoodFace(props) {
  var val = props.value;
  var size = props.size || 36;
  var color = props.color || "#ffffff";
  var active = props.active;

  // different expressions per mood level
  var eyeY = 10;
  var eyeR = 2.2;

  if (val <= 2) {
    // Very sad: curved down mouth, worried brows
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={active ? color + "22" : "transparent"} />
        <circle cx="9.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <circle cx="18.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <path d="M9 19 Q14 15 19 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M8 9 L10 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M20 9 L18 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  } else if (val <= 4) {
    // Sad: slight frown
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={active ? color + "22" : "transparent"} />
        <circle cx="9.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <circle cx="18.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <path d="M9.5 18.5 Q14 16 18.5 18.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
      </svg>
    );
  } else if (val <= 6) {
    // Neutral: flat mouth
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={active ? color + "22" : "transparent"} />
        <circle cx="9.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <circle cx="18.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <line x1="10" y1="18" x2="18" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      </svg>
    );
  } else if (val <= 8) {
    // Happy: smile
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={active ? color + "22" : "transparent"} />
        <circle cx="9.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <circle cx="18.5" cy="11" r={eyeR} fill={color} opacity="0.9" />
        <path d="M9.5 17 Q14 21 18.5 17" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
      </svg>
    );
  } else {
    // Ecstatic: big grin + squint eyes
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill={active ? color + "22" : "transparent"} />
        <path d="M7.5 10.5 Q9.5 9 11.5 10.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M16.5 10.5 Q18.5 9 20.5 10.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M8.5 16.5 Q14 22 19.5 16.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M8.5 16.5 Q14 20 19.5 16.5" fill={color} opacity="0.15" />
      </svg>
    );
  }
}

// Energy icon components
function EnergyIcon(props) {
  var val = props.value;
  var size = props.size || 32;
  var color = props.color || "#ffffff";

  if (val <= 2) {
    // Battery empty
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="9" width="18" height="10" rx="2" stroke={color} strokeWidth="1.6" opacity="0.8" />
        <rect x="22" y="12" width="2.5" height="4" rx="1" fill={color} opacity="0.6" />
        <rect x="5.5" y="10.5" width="2" height="7" rx="0.5" fill={color} opacity="0.3" />
      </svg>
    );
  } else if (val <= 4) {
    // Half battery
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="9" width="18" height="10" rx="2" stroke={color} strokeWidth="1.6" opacity="0.8" />
        <rect x="22" y="12" width="2.5" height="4" rx="1" fill={color} opacity="0.6" />
        <rect x="5.5" y="10.5" width="5" height="7" rx="0.5" fill={color} opacity="0.5" />
      </svg>
    );
  } else if (val <= 6) {
    // Lightning bolt
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <path d="M16 4 L9 15 H14 L12 24 L21 13 H16 L16 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.2" opacity="0.9" />
      </svg>
    );
  } else if (val <= 8) {
    // Fire
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <path d="M14 4 C14 4 19 9 17 13 C17 13 20 11 20 15 C20 20 17 24 14 24 C11 24 8 20 8 15 C8 11 11 13 11 13 C9 9 14 4 14 4Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={color} fillOpacity="0.2" opacity="0.9" />
        <path d="M14 14 C14 14 16 16 15 18 C15 18 16.5 17 16.5 18.5 C16.5 20.5 15.5 22 14 22 C12.5 22 11.5 20.5 11.5 18.5 C11.5 17 13 18 13 18 C12 16 14 14 14 14Z" fill={color} opacity="0.6" />
      </svg>
    );
  } else {
    // Rocket
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <path d="M14 4 C17 4 20 7 20 12 L20 18 L14 22 L8 18 L8 12 C8 7 11 4 14 4Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" opacity="0.9" />
        <circle cx="14" cy="12" r="2.5" fill={color} opacity="0.8" />
        <path d="M8 14 L5 18 L8 17" stroke={color} strokeWidth="1.3" strokeLinejoin="round" opacity="0.7" />
        <path d="M20 14 L23 18 L20 17" stroke={color} strokeWidth="1.3" strokeLinejoin="round" opacity="0.7" />
        <path d="M11 22 L14 26 L17 22" stroke={color} strokeWidth="1.3" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  }
}

function CircularDisplay(props) {
  var size = props.size || 60;
  var sw = 4;
  var value = props.value || 1;
  var color = props.color || "#46F0D2";
  var radius = (size - sw) / 2;
  var circumference = radius * 2 * Math.PI;
  var offset = circumference - (value / 10) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease-in-out", filter: "drop-shadow(0 0 6px " + color + ")" }} />
    </svg>
  );
}

export default function CheckinPage() {
  var [mood, setMood] = useState(8);
  var [energy, setEnergy] = useState(8);
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
      try {
        var profileRes = await supabase.from("profiles").select("xp, level, badges").eq("id", userId).single();
        var curXp = profileRes.data?.xp || 0;
        var curBadges = profileRes.data?.badges || [];
        var countRes = await supabase.from("checkins").select("id", { count: "exact" }).eq("user_id", userId);
        var checkinCount = (countRes.count || 0) + 1;
        var xpResult = await awardXP(userId, XP_AWARDS.CHECKIN, curXp, curBadges, { type: "checkin", data: {} });
        await checkAndAwardBadges(userId, xpResult.newBadges, { checkins: checkinCount });
        var toastMsg = "+20 XP earned!";
        if (xpResult.leveledUp) toastMsg = "Level Up! Level " + xpResult.newLevel + " +20 XP!";
        setXpToast(toastMsg);
        setTimeout(function() { setXpToast(""); }, 3000);
      } catch(e) {}
      setTimeout(function() { setSubmitted(false); }, 2500);
    }
    setSaving(false);
  }

  var moodOpt = moodOptions.find(function(m) { return m.value === mood; }) || moodOptions[3];
  var energyOpt = energyOptions.find(function(e) { return e.value === energy; }) || energyOptions[3];
  var score = Math.round((mood + energy) / 2 * 10);

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5 stagger-children">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] text-white text-sm font-bold shadow-2xl shadow-[#46F0D2]/30 animate-fade-in flex items-center gap-2">
          <span className="text-yellow-200">+</span>
          {xpToast}
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <CalendarCheck size={18} className="text-[#FBE2B4]" />
        <h1 className="text-3xl font-black text-white">Daily Check-In</h1>
      </div>
      <p className="text-gray-500 text-sm -mt-4">How are you feeling today, Dhanush?</p>

      {/* Mood Emoji Picker */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-[#46F0D2]" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">How is your Mood?</h2>
          </div>
          <div className="text-sm font-bold" style={{ color: moodOpt.color }}>{moodOpt.label}</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map(function(opt) {
            var isActive = mood === opt.value;
            return (
              <button
                key={opt.value}
                onClick={function() { setMood(opt.value); }}
                className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border transition-all duration-200 group"
                style={{
                  background: isActive ? opt.bg : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? opt.border : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? "0 0 20px " + opt.glow + ", 0 4px 12px rgba(0,0,0,0.3)" : "none",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                }}
              >
                <div style={{ filter: isActive ? "drop-shadow(0 0 8px " + opt.color + ")" : "none", transition: "filter 0.2s" }}>
                  <MoodFace value={opt.value} size={40} color={opt.color} active={isActive} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide transition-colors" style={{ color: isActive ? opt.color : "#4b5563" }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Picker */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#FBE2B4]" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Energy Level?</h2>
          </div>
          <div className="text-sm font-bold" style={{ color: energyOpt.color }}>{energyOpt.label}</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {energyOptions.map(function(opt) {
            var isActive = energy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={function() { setEnergy(opt.value); }}
                className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border transition-all duration-200 group"
                style={{
                  background: isActive ? opt.bg : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? opt.border : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? "0 0 20px " + opt.glow + ", 0 4px 12px rgba(0,0,0,0.3)" : "none",
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                }}
              >
                <div style={{ filter: isActive ? "drop-shadow(0 0 8px " + opt.color + ")" : "none", transition: "filter 0.2s" }}>
                  <EnergyIcon value={opt.value} size={38} color={opt.color} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide transition-colors" style={{ color: isActive ? opt.color : "#4b5563" }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4">Quick Note</h2>
        <textarea
          value={note}
          onChange={function(e) { setNote(e.target.value); }}
          placeholder="Any wins, challenges, or thoughts to capture today..."
          rows={3}
          className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-white placeholder-gray-600 resize-none text-sm transition-all"
        />
      </div>

      {/* Summary + Submit */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <CircularDisplay size={60} value={mood} color={moodOpt.color} />
                <div className="absolute text-lg font-black font-display" style={{ color: moodOpt.color }}>{mood}</div>
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Mood</div>
            </div>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <CircularDisplay size={60} value={energy} color={energyOpt.color} />
                <div className="absolute text-lg font-black font-display" style={{ color: energyOpt.color }}>{energy}</div>
              </div>
              <div className="text-[10px] text-gray-600 mt-1">Energy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gradient-gold font-display">{score}</div>
              <div className="text-[10px] text-gray-600 mt-1">Score</div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitted || saving}
            className={"ml-auto px-6 py-3 text-white font-semibold rounded-xl transition-all text-sm flex items-center gap-2 " + (
              submitted
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] hover:opacity-90 shadow-lg shadow-[#46F0D2]/20 disabled:opacity-50"
            )}
          >
            {submitted ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Check-In</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
