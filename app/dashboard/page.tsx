"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
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
  var color = props.color || "#4f46e5";
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

  // Daily quote
  var [quote, setQuote] = useState("");

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

      setLoading(false);
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
    { label: "New Journal", href: "/dashboard/journal", color: "from-indigo-500 to-indigo-500", icon: BookOpen },
    { label: "Focus Timer", href: "/dashboard/focus", color: "from-amber-500 to-blue-500", icon: Timer },
    { label: "Ask Dex", href: "/dashboard/coach", color: "from-indigo-500 to-pink-500", icon: Bot },
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
            <CircularProgress size={90} strokeWidth={5} progress={lifeScore} color="#4f46e5" />
            <div className="absolute">
              <div className="text-3xl font-black text-gradient-gold font-display">{lifeScore}</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Life Score</div>
        </div>
      </div>

      {/* XP Level + Today's check-in */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {/* XP Card */}
        <Link href="/dashboard/achievements" className="glass-card p-5 rounded-2xl border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300 group">
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
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
              style={{ width: mounted ? xpInLevel + "%" : "0%" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">{xpInLevel}/100 to next level</span>
            <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <Trophy size={11} />
              <span>{badges.length} badges</span>
              <ChevronRight size={11} />
            </div>
          </div>
        </Link>

        {/* Mood/Energy today */}
        <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-indigo-400" />
              <span className="text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Today's Vibe</span>
            </div>
            {!hasCheckinToday && (
              <Link href="/dashboard/checkin" className="text-[10px] text-green-400 hover:text-green-300 bg-green-500/10 px-2 py-1 rounded-full transition-colors">
                Check in now
              </Link>
            )}
          </div>
          {hasCheckinToday ? (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl mb-1">{MOOD_EMOJIS[todayMood] || "😊"}</div>
                <div className="text-xs text-gray-500">Mood {todayMood}/10</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Mood</span>
                  <span className="text-xs text-indigo-400 font-bold font-display">{todayMood}/10</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full mb-2">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: (todayMood * 10) + "%" }} />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Energy</span>
                  <span className="text-xs text-amber-400 font-bold font-display">{todayEnergy}/10</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-blue-500 rounded-full" style={{ width: (todayEnergy * 10) + "%" }} />
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
      <div className="glass-card p-5 rounded-2xl border border-amber-500/10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">This Week's Report Card</h2>
          </div>
          <span className="text-xs text-gray-600">Last 7 days</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Check-ins", value: weeklyStats.checkins, max: 7, color: "from-green-500 to-emerald-500", icon: "📅" },
            { label: "Journals", value: weeklyStats.journalEntries, max: 7, color: "from-indigo-500 to-indigo-500", icon: "📖" },
            { label: "Habits Today", value: weeklyStats.habitsDoneToday, max: weeklyStats.totalHabits || 1, color: "from-orange-500 to-red-500", icon: "🔥" },
            { label: "Focus Hours", value: Math.round(weeklyStats.focusMinutes / 60 * 10) / 10, max: 20, color: "from-amber-500 to-blue-500", icon: "⚡" },
          ].map(function(stat) {
            var pct = Math.min(stat.max > 0 ? Math.round((stat.value / stat.max) * 100) : 0, 100);
            var grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : pct >= 20 ? "D" : "F";
            var gradeColor = pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : pct >= 40 ? "text-orange-400" : "text-red-400";
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
        {weeklyStats.avgMood > 0 && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Avg mood this week: <span className="text-indigo-400 font-bold">{weeklyStats.avgMood}/10</span></span>
            <span>Avg energy: <span className="text-amber-400 font-bold">{weeklyStats.avgEnergy}/10</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Goals</h2>
            </div>
            <Link href="/dashboard/goals" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
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
              <Link href="/dashboard/goals" className="text-xs text-indigo-400 mt-1 block">Add your first goal →</Link>
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
                        className={"h-full rounded-full transition-all duration-1000 " + (goal.color || "bg-gradient-to-r from-indigo-500 to-amber-500")}
                        style={{ width: mounted ? goal.progress + "%" : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Habits */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">Habits</h2>
            </div>
            <Link href="/dashboard/habits" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
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
      </div>

      {/* Dex Insight */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.03] animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-400 mb-1.5 flex items-center gap-2">
              Dex says
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {getDexInsight()}
            </p>
            <Link href="/dashboard/coach" className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Talk to Dex <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
