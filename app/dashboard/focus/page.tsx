"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen, Brain, Music, Volume2, VolumeX, Flame } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { awardXP, checkAndAwardBadges, XP_AWARDS } from "../../../lib/xp";

var MODES = [
  { label: "Focus", minutes: 25, color: "from-theme-primary to-pink-500", glow: "rgba(168,85,247,0.3)", icon: Brain },
  { label: "Short Break", minutes: 5, color: "from-green-500 to-teal-500", glow: "rgba(20,184,166,0.3)", icon: Coffee },
  { label: "Long Break", minutes: 15, color: "from-blue-500 to-theme-secondary", glow: "rgba(251,226,180,0.3)", icon: BookOpen },
];

var motivationalQuotes = [
  "Deep work is the superpower of the 21st century.",
  "Every expert was once a beginner. You are becoming.",
  "The session you almost skipped is often the most important.",
  "Dhanush, Berlin belongs to those who focus.",
  "One Pomodoro at a time. That is how careers are built.",
  "Siemens will hire you. But first, finish this session.",
  "Your future self is watching this session. Make them proud.",
  "FastAPI, German, AI - all built one session at a time.",
];

var HISTORY_KEY = "focus_daily_history";

function getTodayKey() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function getWeekHistory() {
  var history = {};
  try {
    var raw = typeof window !== "undefined" ? window.localStorage.getItem(HISTORY_KEY) : null;
    if (raw) history = JSON.parse(raw);
  } catch(e) {}

  // Build last 7 days
  var days = [];
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    days.push({
      key: key,
      label: i === 0 ? "Today" : dayNames[d.getDay()],
      minutes: history[key] || 0,
      isToday: i === 0,
    });
  }
  return days;
}

function addFocusMinutesToHistory(minutes) {
  try {
    var raw = typeof window !== "undefined" ? window.localStorage.getItem(HISTORY_KEY) : null;
    var history = raw ? JSON.parse(raw) : {};
    var key = getTodayKey();
    history[key] = (history[key] || 0) + minutes;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch(e) {}
}

function FocusHistoryChart(props) {
  var history = props.history;
  var mounted = props.mounted;

  if (!history || history.length === 0) return null;

  var maxMin = Math.max.apply(null, history.map(function(d) { return d.minutes; })) || 1;
  // Goal line: 100 min/day
  var goalMin = 100;
  var chartMax = Math.max(maxMin, goalMin) * 1.15;

  var totalWeek = history.reduce(function(s, d) { return s + d.minutes; }, 0);
  var daysWithFocus = history.filter(function(d) { return d.minutes > 0; }).length;
  var bestDay = history.reduce(function(best, d) { return d.minutes > best.minutes ? d : best; }, history[0]);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/[0.06] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-theme-secondary" />
          <span className="text-xs font-semibold text-theme-secondary uppercase tracking-[0.15em]">7-Day Focus History</span>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm font-black bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent">{Math.round(totalWeek / 60 * 10) / 10}h</div>
            <div className="text-[9px] text-gray-700 uppercase tracking-wider">This week</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-theme-primary">{daysWithFocus}/7</div>
            <div className="text-[9px] text-gray-700 uppercase tracking-wider">Active days</div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative">
        {/* Goal line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-theme-secondary/20 flex items-center"
          style={{ bottom: (goalMin / chartMax * 100) + "%" }}
        >
          <span className="text-[9px] text-theme-secondary/40 ml-1 -mt-3">goal 100m</span>
        </div>

        <div className="flex items-end gap-1.5 h-28">
          {history.map(function(day) {
            var barH = mounted && day.minutes > 0 ? Math.max((day.minutes / chartMax) * 100, 3) : 0;
            var isGoalMet = day.minutes >= goalMin;
            var barColor = day.isToday
              ? "linear-gradient(180deg, var(--app-primary), var(--app-primary)aa)"
              : isGoalMet
              ? "linear-gradient(180deg, var(--app-secondary), var(--app-secondary)aa)"
              : "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.06))";

            return (
              <div key={day.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="relative w-full flex justify-center group">
                  {/* Tooltip */}
                  {day.minutes > 0 && (
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#0c0c1d] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap shadow-xl">
                      {day.minutes}m · {Math.round(day.minutes / 25)} session{Math.round(day.minutes / 25) !== 1 ? "s" : ""}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: barH + "%",
                      minHeight: day.minutes > 0 ? "4px" : "0px",
                      background: barColor,
                      boxShadow: day.isToday ? "0 0 8px var(--app-primary)aa" : isGoalMet ? "0 0 8px var(--app-secondary)aa" : "none",
                    }}
                  />
                </div>
                <div className={"text-[9px] text-center " + (day.isToday ? "text-theme-primary font-semibold" : "text-gray-700")}>{day.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best day callout */}
      {bestDay && bestDay.minutes > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <span className="text-[10px] text-gray-600">Best day this week</span>
          <span className="text-[10px] font-semibold text-theme-secondary">{bestDay.label} — {bestDay.minutes}m ({Math.floor(bestDay.minutes / 25)} sessions)</span>
        </div>
      )}

      {totalWeek === 0 && (
        <div className="text-center py-4 text-gray-700 text-xs">
          Complete your first focus session to start tracking history!
        </div>
      )}
    </div>
  );
}

export default function FocusPage() {
  var [modeIndex, setModeIndex] = useState(0);
  var [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  var [isRunning, setIsRunning] = useState(false);
  var [sessionsCompleted, setSessionsCompleted] = useState(0);
  var [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  var [quote, setQuote] = useState(motivationalQuotes[0]);
  var [soundOn, setSoundOn] = useState(false);
  var [mounted, setMounted] = useState(false);
  var [userId, setUserId] = useState(null);
  var [xpToast, setXpToast] = useState("");
  var [weekHistory, setWeekHistory] = useState([]);
  var intervalRef = useRef(null);
  var audioCtxRef = useRef(null);
  var nodesRef = useRef([]);

  var mode = MODES[modeIndex];
  var totalSeconds = mode.minutes * 60;
  var progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  var mins = Math.floor(secondsLeft / 60);
  var secs = secondsLeft % 60;

  useEffect(function() {
    setMounted(true);
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    setWeekHistory(getWeekHistory());
    supabase.auth.getSession().then(function(res) {
      if (res.data.session) setUserId(res.data.session.user.id);
    });
  }, []);

  useEffect(function() {
    if (isRunning) {
      intervalRef.current = setInterval(function() {
        setSecondsLeft(function(prev) {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (modeIndex === 0) {
              setSessionsCompleted(function(c) { return c + 1; });
              setTotalFocusMinutes(function(t) { return t + MODES[0].minutes; });

              // Save to localStorage history
              addFocusMinutesToHistory(MODES[0].minutes);
              setWeekHistory(getWeekHistory());

              // Award XP + save focus minutes to Supabase
              supabase.auth.getSession().then(async function(res) {
                if (!res.data.session) return;
                var uid = res.data.session.user.id;
                var profileRes = await supabase.from("profiles").select("xp, level, badges, total_focus_minutes").eq("id", uid).single();
                var curXp = profileRes.data?.xp || 0;
                var curBadges = profileRes.data?.badges || [];
                var updatedFocusMin = (profileRes.data?.total_focus_minutes || 0) + MODES[0].minutes;
                await supabase.from("profiles").update({ total_focus_minutes: updatedFocusMin }).eq("id", uid);
                var xpResult = await awardXP(uid, XP_AWARDS.FOCUS_SESSION, curXp, curBadges);
                await checkAndAwardBadges(uid, xpResult.newBadges, { focusMinutes: updatedFocusMin });
                var msg = "+25 XP! Focus session complete!";
                if (xpResult.leveledUp) msg = "Level Up! Level " + xpResult.newLevel + "! +25 XP";
                setXpToast(msg);
                setTimeout(function() { setXpToast(""); }, 3000);
              });
            }
            setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("Dex: Session complete!", { body: modeIndex === 0 ? "Focus session done! Take a break." : "Break over! Time to focus." });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return function() { clearInterval(intervalRef.current); };
  }, [isRunning, modeIndex]);

  function switchMode(idx) {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setModeIndex(idx);
    setSecondsLeft(MODES[idx].minutes * 60);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(mode.minutes * 60);
  }

  function toggleSound() {
    if (soundOn) {
      nodesRef.current.forEach(function(n) { try { n.stop(); } catch(e) {} });
      nodesRef.current = [];
      setSoundOn(false);
      return;
    }
    try {
      var AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      var ctx = audioCtxRef.current;
      var bufferSize = ctx.sampleRate * 2;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      var gainNode = ctx.createGain();
      gainNode.gain.value = 0.04;
      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      nodesRef.current = [source];
      setSoundOn(true);
    } catch(e) {
      console.log("Audio not available:", e);
    }
  }

  var radius = 110;
  var circumference = radius * 2 * Math.PI;
  var strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-theme-secondary to-theme-primary text-white text-sm font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="text-yellow-300">*</span>
          {xpToast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Focus Timer</h1>
          <p className="text-gray-500 text-sm mt-1">Deep work. No distractions. Just progress.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent">{sessionsCompleted}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">Sessions Today</div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        {MODES.map(function(m, i) {
          var Icon = m.icon;
          return (
            <button
              key={m.label}
              onClick={function() { switchMode(i); }}
              className={"flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 " + (
                modeIndex === i
                  ? "bg-gradient-to-r " + m.color + " text-white shadow-lg"
                  : "bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:text-white"
              )}
            >
              <Icon size={12} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center py-4">
        <div className="relative" style={{ filter: "drop-shadow(0 0 40px " + mode.glow + ")" }}>
          <svg width={260} height={260} className="transform -rotate-90">
            <circle cx={130} cy={130} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={8} />
            <circle
              cx={130} cy={130} r={radius}
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={mounted ? strokeOffset : circumference}
              style={{ transition: isRunning ? "stroke-dashoffset 1s linear" : "none" }}
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--app-primary)" />
                <stop offset="100%" stopColor="var(--app-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-black text-white font-display tracking-tight">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2">{mode.label}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={function() { setIsRunning(!isRunning); }}
            className={"w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl transition-all bg-gradient-to-r " + mode.color}
            style={{ boxShadow: "0 0 30px " + mode.glow }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
          </button>
          <button
            onClick={toggleSound}
            className={"w-12 h-12 rounded-xl border flex items-center justify-center transition-all " + (soundOn ? "bg-theme-primary/20 border-theme-primary/40 text-theme-primary" : "bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-white")}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="glass-card p-5 rounded-2xl border border-theme-primary/15 bg-theme-primary/[0.03]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 border border-theme-primary/20 flex items-center justify-center text-theme-primary shrink-0 mt-0.5">
            <Brain size={14} />
          </div>
          <p className="text-sm text-gray-400 italic leading-relaxed">"{quote}"</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black bg-gradient-to-r from-theme-primary to-pink-400 bg-clip-text text-transparent">{sessionsCompleted}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Sessions</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black bg-gradient-to-r from-theme-secondary to-blue-400 bg-clip-text text-transparent">{totalFocusMinutes}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Minutes</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">{Math.round(totalFocusMinutes / 60 * 10) / 10}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Hours</div>
        </div>
      </div>

      {/* 7-Day Focus History Chart */}
      {mounted && <FocusHistoryChart history={weekHistory} mounted={mounted} />}

      {/* Request notification permission */}
      {typeof Notification !== "undefined" && Notification.permission === "default" && (
        <button
          onClick={function() { Notification.requestPermission(); }}
          className="w-full py-2.5 text-xs text-gray-500 hover:text-theme-primary transition-colors text-center"
        >
          Enable notifications for session alerts
        </button>
      )}
    </div>
  );
}
