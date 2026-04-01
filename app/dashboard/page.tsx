"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { EnhancedCard, ScrollTriggerWrapper, StaggerContainer } from "../../lib/3d-components-enhanced";
import { getLevel, getLevelTitle, getXpProgress, BADGES } from "../../lib/xp";
import {
  Target,
  Flame,
  BookOpen,
  Bot,
  TrendingUp,
  Zap,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Trophy,
  Timer,
  CalendarCheck,
  Star,
} from "lucide-react";

function CircularProgress(props) {
  var size = props.size || 80;
  var strokeWidth = props.strokeWidth || 6;
  var progress = props.progress || 0;
  var color = props.color || "var(--app-primary)";
  var radius = (size - strokeWidth) / 2;
  var circumference = radius * 2 * Math.PI;
  var offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-in-out", filter: "drop-shadow(0 0 6px " + color + ")" }} />
    </svg>
  );
}

function MoodChart(props) {
  var data = props.data || [];
  var W = 480;
  var H = 110;
  var padL = 28;
  var padR = 12;
  var padT = 12;
  var padB = 28;
  var innerW = W - padL - padR;
  var innerH = H - padT - padB;

  function xPos(i) { return padL + (i / (data.length - 1)) * innerW; }
  function yPos(val) { return padT + innerH - ((val - 1) / 9) * innerH; }

  // Build polyline points for mood and energy (skip nulls — connect existing)
  function buildPath(key) {
    var pts = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i][key] !== null) {
        pts.push(xPos(i) + "," + yPos(data[i][key]));
      }
    }
    return pts.join(" ");
  }

  var moodPts = buildPath("mood");
  var energyPts = buildPath("energy");
  var hasMood = moodPts.length > 0;
  var hasEnergy = energyPts.length > 0;

  // Y-axis grid lines at 2, 4, 6, 8, 10
  var gridLines = [2, 4, 6, 8, 10];

  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ height: "110px" }}>
      {/* Grid lines */}
      {gridLines.map(function(v) {
        return (
          <line key={v}
            x1={padL} y1={yPos(v)} x2={W - padR} y2={yPos(v)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        );
      })}

      {/* Y-axis labels */}
      {[2, 6, 10].map(function(v) {
        return (
          <text key={v} x={padL - 4} y={yPos(v) + 3} fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="end">{v}</text>
        );
      })}

      {/* Mood line (var(--app-primary)) */}
      {hasMood && (
        <polyline
          points={moodPts}
          fill="none"
          stroke="var(--app-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(70,240,210,0.6))" }}
        />
      )}

      {/* Energy line (var(--app-secondary)) */}
      {hasEnergy && (
        <polyline
          points={energyPts}
          fill="none"
          stroke="var(--app-secondary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(251,226,180,0.6))" }}
        />
      )}

      {/* Mood dots */}
      {data.map(function(d, i) {
        if (d.mood === null) return null;
        return (
          <circle key={"m" + i} cx={xPos(i)} cy={yPos(d.mood)} r="3.5"
            fill="#131321" stroke="var(--app-primary)" strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 3px rgba(70,240,210,0.8))" }}
          />
        );
      })}

      {/* Energy dots */}
      {data.map(function(d, i) {
        if (d.energy === null) return null;
        return (
          <circle key={"e" + i} cx={xPos(i)} cy={yPos(d.energy)} r="3.5"
            fill="#131321" stroke="var(--app-secondary)" strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 3px rgba(251,226,180,0.8))" }}
          />
        );
      })}

      {/* X-axis day labels */}
      {data.map(function(d, i) {
        return (
          <text key={"l" + i} x={xPos(i)} y={H - 6} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">{d.day}</text>
        );
      })}
    </svg>
  );
}

var MOOD_EMOJIS = ["", "😫", "😔", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🔥"];

var DAILY_QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "You don't have to be great to start, but you have to start to be great.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your future is created by what you do today, not tomorrow.",
  "Dream big. Start small. Act now.",
  "In Berlin, ambition has no limits — and neither do you.",
  "Every master was once a beginner. Every expert was once a novice.",
];

export default function DashboardPage() {
  var [userId, setUserId] = useState("");
  var [userName, setUserName] = useState("Dhanush");
  var [mounted, setMounted] = useState(false);
  var [loading, setLoading] = useState(true);

  // Profile / XP
  var [xp, setXp] = useState(0);
  var [level, setLevel] = useState(1);
  var [badges, setBadges] = useState([]);

  // Goals (real data)
  var [goals, setGoals] = useState([]);

  // Habits (real data)
  var [habits, setHabits] = useState([]);

  // Today's checkin
  var [todayMood, setTodayMood] = useState(0);
  var [todayEnergy, setTodayEnergy] = useState(0);
  var [hasCheckinToday, setHasCheckinToday] = useState(false);

  // Weekly stats
  var [weeklyStats, setWeeklyStats] = useState({
    checkins: 0,
    journalEntries: 0,
    habitsDoneToday: 0,
    totalHabits: 0,
    focusMinutes: 0,
    avgMood: 0,
    avgEnergy: 0,
  });

  // 7-day mood/energy chart data
  var [moodChartData, setMoodChartData] = useState([]);

  // Daily quote
  var [quote, setQuote] = useState("");

  // Dex morning briefing
  var [morningBriefing, setMorningBriefing] = useState("");
  var [briefingLoading, setBriefingLoading] = useState(false);
  var [briefingDismissed, setBriefingDismissed] = useState(false);

  useEffect(function() {
    setMounted(true);
    var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);

    supabase.auth.getSession().then(async function(res) {
      if (!res.data.session) return;
      var uid = res.data.session.user.id;
      var name = res.data.session.user.user_metadata?.name || res.data.session.user.email?.split("@")[0] || "Dhanush";
      setUserId(uid);
      setUserName(name);

      var today = new Date().toISOString().split("T")[0];
      var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel load everything
      var [profileRes, goalsRes, habitsRes, checkinTodayRes, weekCheckinsRes, journalWeekRes] = await Promise.all([
        supabase.from("profiles").select("xp, level, badges, total_focus_minutes").eq("id", uid).single(),
        supabase.from("goals").select("*").eq("user_id", uid).order("created_at", { ascending: true }).limit(4),
        supabase.from("habits").select("*").eq("user_id", uid).limit(4),
        supabase.from("checkins").select("mood, energy").eq("user_id", uid).gte("created_at", today + "T00:00:00").limit(1),
        supabase.from("checkins").select("mood, energy, created_at").eq("user_id", uid).gte("created_at", weekAgo),
        supabase.from("journal_entries").select("id").eq("user_id", uid).gte("created_at", weekAgo),
      ]);

      if (profileRes.data) {
        setXp(profileRes.data.xp || 0);
        setLevel(profileRes.data.level || 1);
        setBadges(profileRes.data.badges || []);
      }

      if (goalsRes.data) setGoals(goalsRes.data);
      if (habitsRes.data) setHabits(habitsRes.data);

      if (checkinTodayRes.data && checkinTodayRes.data.length > 0) {
        setHasCheckinToday(true);
        setTodayMood(checkinTodayRes.data[0].mood);
        setTodayEnergy(checkinTodayRes.data[0].energy);
      }

      // Weekly stats
      var checkinData = weekCheckinsRes.data || [];
      var avgMood = checkinData.length > 0 ? Math.round(checkinData.reduce(function(s, c) { return s + c.mood; }, 0) / checkinData.length) : 0;
      var avgEnergy = checkinData.length > 0 ? Math.round(checkinData.reduce(function(s, c) { return s + c.energy; }, 0) / checkinData.length) : 0;
      var habitsDoneToday = (habitsRes.data || []).filter(function(h) { return h.last_done_date === today; }).length;

      setWeeklyStats({
        checkins: checkinData.length,
        journalEntries: (journalWeekRes.data || []).length,
        habitsDoneToday: habitsDoneToday,
        totalHabits: (habitsRes.data || []).length,
        focusMinutes: profileRes.data?.total_focus_minutes || 0,
        avgMood: avgMood,
        avgEnergy: avgEnergy,
      });

      // Build 7-day chart data: one entry per day for the past 7 days
      var DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      var chartPoints = [];
      for (var di = 6; di >= 0; di--) {
        var d = new Date(Date.now() - di * 24 * 60 * 60 * 1000);
        var dateStr = d.toISOString().split("T")[0];
        var dayCheckins = checkinData.filter(function(c) { return c.created_at && c.created_at.startsWith(dateStr); });
        var dayMood = dayCheckins.length > 0 ? Math.round(dayCheckins.reduce(function(s, c) { return s + c.mood; }, 0) / dayCheckins.length) : null;
        var dayEnergy = dayCheckins.length > 0 ? Math.round(dayCheckins.reduce(function(s, c) { return s + c.energy; }, 0) / dayCheckins.length) : null;
        chartPoints.push({ day: DAY_LABELS[d.getDay()], mood: dayMood, energy: dayEnergy, date: dateStr });
      }
      setMoodChartData(chartPoints);

      setLoading(false);

      // Dex morning briefing — once per day
      var today2 = new Date().toISOString().split("T")[0];
      var savedBriefing = typeof window !== "undefined" ? localStorage.getItem("dex-briefing-" + today2) : null;
      var dismissed = typeof window !== "undefined" ? localStorage.getItem("dex-briefing-dismissed-" + today2) : null;
      if (dismissed) {
        setBriefingDismissed(true);
      } else if (savedBriefing) {
        setMorningBriefing(savedBriefing);
      } else {
        setBriefingLoading(true);
        var maxStreak2 = (habitsRes.data || []).reduce(function(m, h) { return h.streak > m ? h.streak : m; }, 0);
        var topGoalName = (goalsRes.data || []).length > 0 ? goalsRes.data[0].name : "your goals";
        var briefPrompt = "Give me a personalized morning briefing for today. I am Dhanush, studying AI/Robotics at SRH Berlin, targeting internships at Siemens/Tesla/Continental. My stats: longest habit streak is " + maxStreak2 + " days, top goal is '" + topGoalName + "', average mood this week is " + (avgMood || 0) + "/10, I've checked in " + (checkinData || []).length + " times this week. Be specific, motivating, and concise (2-3 sentences max). Reference Berlin or my AI goals.";
        try {
          var briefRes = await fetch("/api/coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ id: 1, role: "user", content: briefPrompt }] }),
          });
          var briefData = await briefRes.json();
          var briefing = briefData.response || "Good morning Dhanush! Ready to make progress on your goals today?";
          setMorningBriefing(briefing);
          if (typeof window !== "undefined") {
            localStorage.setItem("dex-briefing-" + today2, briefing);
          }
        } catch(e) {
          setMorningBriefing("Good morning Dhanush! Berlin awaits — let's make today count.");
        }
        setBriefingLoading(false);
      }
    });
  }, []);

  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  var TimeIcon = hour >= 6 && hour < 18 ? Sun : Moon;

  var level_ = getLevel(xp);
  var xpInLevel = getXpProgress(xp);
  var levelTitle = getLevelTitle(level_);

  // Life score: blend mood, energy, habit completion, XP tier
  var habitScore = weeklyStats.totalHabits > 0 ? (weeklyStats.habitsDoneToday / weeklyStats.totalHabits) * 10 : 5;
  var moodScore = todayMood || weeklyStats.avgMood || 6;
  var energyScore = todayEnergy || weeklyStats.avgEnergy || 6;
  var lifeScore = Math.round(((moodScore + energyScore + habitScore) / 3) * 10);

  var quickActions = [
    { label: "Check In", href: "/dashboard/checkin", color: "from-green-500 to-emerald-600", icon: CalendarCheck },
    { label: "New Journal", href: "/dashboard/journal", color: "from-theme-primary to-theme-primary", icon: BookOpen },
    { label: "Focus Timer", href: "/dashboard/focus", color: "from-theme-secondary to-blue-500", icon: Timer },
    { label: "Ask Dex", href: "/dashboard/coach", color: "from-theme-primary to-pink-500", icon: Bot },
  ];

  // Dex insight based on actual data
  function getDexInsight() {
    var insights = [];
    if (goals.length > 0) {
      var topGoal = goals.reduce(function(a, b) { return a.progress > b.progress ? a : b; }, goals[0]);
      insights.push("Your top goal '" + topGoal.name + "' is at " + topGoal.progress + "% — keep pushing!");
    }
    if (weeklyStats.habitsDoneToday > 0) {
      insights.push("You've completed " + weeklyStats.habitsDoneToday + " habit" + (weeklyStats.habitsDoneToday > 1 ? "s" : "") + " today. Momentum is building!");
    }
    var maxStreak = habits.reduce(function(m, h) { return h.streak > m ? h.streak : m; }, 0);
    if (maxStreak >= 7) {
      insights.push("Your " + maxStreak + "-day streak is impressive — you're building real consistency.");
    }
    if (!hasCheckinToday) {
      insights.push("You haven't checked in today yet. A quick check-in earns 20 XP and helps track your wellbeing.");
    }
    if (weeklyStats.checkins < 3) {
      insights.push("Check in more this week to track your mood trends and earn XP!");
    }
    if (insights.length === 0) {
      insights.push("You're on track this week. Keep building those habits and your goals will follow!");
    }
    return insights[0];
  }

  function dismissBriefing() {
    setBriefingDismissed(true);
    var today2 = new Date().toISOString().split("T")[0];
    if (typeof window !== "undefined") {
      localStorage.setItem("dex-briefing-dismissed-" + today2, "1");
    }
  }

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TimeIcon size={14} />
            <span>{greeting}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white">
            Welcome back, <span className="text-gradient-gold font-display">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm italic opacity-80">{quote}</p>
        </div>
        <div className="text-right relative shrink-0 ml-4">
          <div className="relative inline-flex items-center justify-center">
            <CircularProgress size={90} strokeWidth={5} progress={lifeScore} color="var(--app-primary)" />
            <div className="absolute">
              <div className="text-3xl font-black text-gradient-gold font-display">{lifeScore}</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Life Score</div>
        </div>
      </div>

      {/* Life OS Overview */}
      <EnhancedCard intensity={8}>
        <div className="glass-card p-6 rounded-2xl border border-theme-primary/20 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-theme-primary to-theme-secondary flex items-center justify-center shrink-0 shadow-lg shadow-theme-primary/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-2">Your Personal Life OS</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Life OS is your personalized AI-powered life operating system designed to help you achieve your goals, build lasting habits, and optimize your wellbeing. Track everything that matters, get intelligent insights from Dex (your AI coach), and watch your life score grow as you progress.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 text-theme-primary">
                  <Target size={12} /> Goals
                </div>
                <div className="flex items-center gap-2 text-theme-secondary">
                  <Flame size={12} /> Habits
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <BookOpen size={12} /> Journal
                </div>
                <div className="flex items-center gap-2 text-pink-400">
                  <Heart size={12} /> Check-In
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Bot size={12} /> AI Coach
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Trophy size={12} /> Achievements
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Dex Morning Briefing */}
      {!briefingDismissed && (morningBriefing || briefingLoading) && (
        <div className="glass-card p-5 rounded-2xl border border-theme-primary/20 bg-theme-primary/[0.03] animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 bg-theme-primary" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg shadow-theme-primary/20 shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-theme-primary uppercase tracking-[0.15em]">Dex</span>
                <span className="text-[10px] text-gray-600">Morning Briefing</span>
                {briefingLoading && (
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
              {morningBriefing && (
                <p className="text-sm text-gray-300 leading-relaxed">{morningBriefing}</p>
              )}
              {briefingLoading && !morningBriefing && (
                <p className="text-sm text-gray-600 italic">Preparing your daily briefing...</p>
              )}
            </div>
            <button onClick={dismissBriefing} className="text-gray-700 hover:text-gray-500 transition-colors shrink-0 ml-2">
              <Star size={14} />
            </button>
          </div>
        </div>
      )}

      {/* XP Level + Today's check-in */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {/* XP Card */}
        <EnhancedCard className="stagger-children" intensity={10}>
          <Link href="/dashboard/achievements" className="glass-card p-5 rounded-2xl border border-theme-primary/15 hover:border-theme-primary/30 transition-all duration-300 group block h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-yellow-400" />
              <span className="text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Level {level_} — {levelTitle}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} className="text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400 font-display">{xp} XP</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3 flex-1">Earn XP by completing habits, goals, check-ins, and journal entries. Level up to unlock achievements and showcase your progress.</p>
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-theme-primary to-theme-secondary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(70,240,210,0.4)]"
              style={{ width: mounted ? xpInLevel + "%" : "0%" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">{xpInLevel}/100 to next level</span>
            <div className="flex items-center gap-1 text-xs text-theme-primary group-hover:text-theme-primary transition-colors">
              <Trophy size={11} />
              <span>{badges.length} badges</span>
              <ChevronRight size={11} />
            </div>
          </div>
          </Link>
        </EnhancedCard>

        {/* Mood/Energy today */}
        <EnhancedCard className="stagger-children" intensity={10}>
          <div className="glass-card p-5 rounded-2xl border border-white/[0.06] h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-theme-primary" />
              <span className="text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Today's Vibe</span>
            </div>
            <Link href="/dashboard/checkin" className="text-xs text-theme-primary hover:text-theme-primary/80 transition-colors flex items-center gap-1">
              Add Check-In <ChevronRight size={11} />
            </Link>
          </div>
          <p className="text-xs text-gray-500 mb-3 flex-1">Track your daily mood (1-10) and energy levels to understand your emotional patterns and get personalized insights from Dex.</p>
          {!hasCheckinToday && (
            <Link href="/dashboard/checkin" className="text-[10px] text-green-400 hover:text-green-300 bg-green-500/10 px-2 py-1 rounded-full transition-colors">
              Check in now
            </Link>
          )}
          {hasCheckinToday ? (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl mb-1">{MOOD_EMOJIS[todayMood] || "😊"}</div>
                <div className="text-xs text-gray-500">Mood {todayMood}/10</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Mood</span>
                  <span className="text-xs text-theme-primary font-bold font-display">{todayMood}/10</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full mb-2">
                  <div className="h-full bg-gradient-to-r from-theme-primary to-pink-500 rounded-full" style={{ width: (todayMood * 10) + "%" }} />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Energy</span>
                  <span className="text-xs text-theme-secondary font-bold font-display">{todayEnergy}/10</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full">
                  <div className="h-full bg-gradient-to-r from-theme-secondary to-blue-500 rounded-full" style={{ width: (todayEnergy * 10) + "%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="text-4xl opacity-30">😐</div>
              <div>
                <div className="text-sm text-gray-500">No check-in yet today</div>
                <div className="text-xs text-gray-700 mt-0.5">Check in to track your wellbeing (+20 XP)</div>
              </div>
            </div>
          )}
          </div>
        </EnhancedCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        {quickActions.map(function(action) {
          var Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={"py-3.5 px-4 rounded-xl bg-gradient-to-r " + action.color + " text-white text-sm font-semibold text-center hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"}
            >
              <Icon size={15} />
              {action.label}
            </Link>
          );
        })}
      </div>

      {/* Weekly Report Card */}
      <EnhancedCard className="w-full" intensity={8}>
        <div className="glass-card p-5 rounded-2xl border border-theme-secondary/10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-theme-secondary" />
            <h2 className="text-base font-bold text-white">This Week's Report Card</h2>
          </div>
          <span className="text-xs text-gray-600">Last 7 days</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">See how consistently you're tracking habits, check-ins, journals, and focus time. Grades are based on your weekly targets.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Check-ins", value: weeklyStats.checkins, max: 7, color: "from-green-500 to-emerald-500", icon: "📅" },
            { label: "Journals", value: weeklyStats.journalEntries, max: 7, color: "from-theme-primary to-theme-primary", icon: "📖" },
            { label: "Habits Today", value: weeklyStats.habitsDoneToday, max: weeklyStats.totalHabits || 1, color: "from-orange-500 to-red-500", icon: "🔥" },
            { label: "Focus Hours", value: Math.round(weeklyStats.focusMinutes / 60 * 10) / 10, max: 20, color: "from-theme-secondary to-blue-500", icon: "⚡" },
          ].map(function(stat) {
            var pct = Math.min(stat.max > 0 ? Math.round((stat.value / stat.max) * 100) : 0, 100);
            var grade = stat.value === 0 ? "—" : pct >= 90 ? "S" : pct >= 70 ? "A" : pct >= 50 ? "B" : pct >= 30 ? "C" : "D";
            var gradeColor = stat.value === 0 ? "text-gray-700" : pct >= 90 ? "text-theme-primary" : pct >= 70 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : pct >= 30 ? "text-orange-400" : "text-theme-secondary";
            return (
              <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className={"text-xl font-black font-display " + gradeColor}>{grade}</span>
                </div>
                <div className="text-lg font-black text-white font-display">{stat.value}</div>
                <div className="text-xs text-gray-600 mb-2">{stat.label}</div>
                <div className="h-1 bg-white/[0.04] rounded-full">
                  <div
                    className={"h-full rounded-full bg-gradient-to-r " + stat.color}
                    style={{ width: pct + "%", transition: "width 1s ease-in-out" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {moodChartData.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 uppercase tracking-[0.12em]">7-Day Trend</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "var(--app-primary)", boxShadow: "0 0 4px rgba(70,240,210,0.7)" }} />
                  <span className="text-[10px] text-gray-600">Mood</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "var(--app-secondary)", boxShadow: "0 0 4px rgba(251,226,180,0.7)" }} />
                  <span className="text-[10px] text-gray-600">Energy</span>
                </div>
                {weeklyStats.avgMood > 0 && (
                  <span className="text-[10px] text-gray-600">avg <span className="text-theme-primary font-bold">{weeklyStats.avgMood}</span> / <span className="text-theme-secondary font-bold">{weeklyStats.avgEnergy}</span></span>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-2 py-1">
              <MoodChart data={moodChartData} />
            </div>
          </div>
        )}
        </div>
      </EnhancedCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <EnhancedCard className="w-full" intensity={8}>
          <div className="glass-card p-6 rounded-2xl border border-white/[0.06] h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-theme-primary" />
              <h2 className="text-lg font-bold text-white">Goals</h2>
            </div>
            <Link href="/dashboard/goals" className="text-xs text-theme-primary hover:text-theme-primary flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex-1">Set and track meaningful goals. Break them down into milestones, monitor progress, and celebrate achievements as you work toward your vision.</p>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map(function(_, i) {
                return <div key={i} className="h-8 bg-white/[0.03] rounded-lg animate-pulse" />;
              })}
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-6 text-gray-600">
              <Target size={24} className="mx-auto mb-2 opacity-30" />
              <div className="text-sm">No goals yet</div>
              <Link href="/dashboard/goals" className="text-xs text-theme-primary mt-1 block">Add your first goal →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 4).map(function(goal) {
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-gray-300 truncate pr-2">{goal.name}</span>
                      <span className="text-sm text-gray-500 font-display font-semibold shrink-0">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={"h-full rounded-full transition-all duration-1000 " + (goal.color || "bg-gradient-to-r from-theme-primary to-theme-secondary")}
                        style={{ width: mounted ? goal.progress + "%" : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </EnhancedCard>

        {/* Habits */}
        <EnhancedCard className="w-full" intensity={8}>
          <div className="glass-card p-6 rounded-2xl border border-white/[0.06] h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">Habits</h2>
            </div>
            <Link href="/dashboard/habits" className="text-xs text-theme-secondary hover:text-theme-secondary flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex-1">Build a streak of daily habits. Check off habits each day to maintain consistency and watch your compound progress grow over time.</p>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map(function(_, i) {
                return <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />;
              })}
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-6 text-gray-600">
              <Flame size={24} className="mx-auto mb-2 opacity-30" />
              <div className="text-sm">No habits yet</div>
              <Link href="/dashboard/habits" className="text-xs text-orange-400 mt-1 block">Add your first habit →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {habits.slice(0, 4).map(function(habit) {
                var today = new Date().toISOString().split("T")[0];
                var isDone = habit.last_done_date === today;
                return (
                  <div
                    key={habit.id}
                    className={"p-3.5 rounded-xl border transition-all duration-300 " + (
                      isDone
                        ? "border-green-500/30 bg-green-500/[0.06] shadow-inner"
                        : "border-white/[0.06] bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white truncate">{habit.name}</div>
                      {isDone && <span className="text-green-400 text-xs shrink-0 ml-1">Done</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Flame size={12} className={"transition-colors " + (habit.streak > 7 ? "text-orange-400 animate-streak-fire" : "text-gray-600")} />
                      <span className="text-xs text-gray-500 font-display">{habit.streak}d streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </EnhancedCard>
      </div>

      {/* Dex Insight */}
      <EnhancedCard className="w-full" intensity={8}>
        <div className="glass-card p-6 rounded-2xl border border-theme-primary/15 bg-theme-primary/[0.03] animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <p className="text-xs text-gray-500 mb-4">Your personal AI coach analyzes your activity patterns and provides intelligent insights to help you optimize your progress.</p>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-primary to-theme-secondary flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-theme-primary/20 animate-pulse-glow">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-theme-primary mb-1.5 flex items-center gap-2">
              Dex says
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {getDexInsight()}
            </p>
            <Link href="/dashboard/coach" className="inline-flex items-center gap-1.5 mt-3 text-xs text-theme-primary hover:text-theme-primary transition-colors">
              Talk to Dex <ChevronRight size={12} />
            </Link>
          </div>
        </div>
        </div>
      </EnhancedCard>
    </div>
  );
}
