"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

var goals = [
  { name: "Master FastAPI & LLMs", progress: 45, color: "from-purple-500 to-pink-500" },
  { name: "German to B1", progress: 30, color: "from-yellow-500 to-orange-500" },
  { name: "Land AI Internship", progress: 20, color: "from-orange-500 to-red-500" },
  { name: "Build Portfolio Projects", progress: 60, color: "from-green-500 to-teal-500" },
];

var habits = [
  { name: "Morning Coding", streak: 12, done: true, icon: "code" },
  { name: "Exercise", streak: 5, done: false, icon: "zap" },
  { name: "Read 30min", streak: 8, done: true, icon: "book" },
  { name: "German Practice", streak: 3, done: false, icon: "globe" },
];

var quickActions = [
  { label: "New Journal", href: "/dashboard/journal", color: "from-indigo-500 to-purple-500", icon: BookOpen },
  { label: "Add Goal", href: "/dashboard/goals", color: "from-purple-500 to-pink-500", icon: Target },
  { label: "Ask Coach", href: "/dashboard/coach", color: "from-emerald-500 to-teal-500", icon: Bot },
];

function CircularProgress(props) {
  var size = props.size || 80;
  var strokeWidth = props.strokeWidth || 6;
  var progress = props.progress || 0;
  var color = props.color || "#8b5cf6";
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

export default function DashboardPage() {
  var [mood, setMood] = useState(7);
  var [energy, setEnergy] = useState(6);
  var [mounted, setMounted] = useState(false);
  var lifeScore = Math.round((mood + energy + 7) / 3 * 10);

  useEffect(function() { setMounted(true); }, []);

  var hour = new Date().getHours();
  var greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  var TimeIcon = hour >= 6 && hour < 18 ? Sun : Moon;

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TimeIcon size={14} />
            <span>{greeting}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white">
            Welcome back, <span className="text-gradient-cyan font-display">Dhanush</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">Berlin, Germany - Your Second Brain is ready</p>
        </div>
        <div className="text-right relative">
          <div className="relative inline-flex items-center justify-center">
            <CircularProgress size={90} strokeWidth={5} progress={lifeScore} color="#8b5cf6" />
            <div className="absolute">
              <div className="text-3xl font-black text-gradient-cyan font-display">{lifeScore}</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-1">Life Score</div>
        </div>
      </div>

      {/* Mood & Energy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-purple-400" />
              <span className="text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Mood Today</span>
            </div>
            <span className="text-xl font-bold text-purple-400 font-display">{mood}/10</span>
          </div>
          <input
            type="range" min="1" max="10" value={mood}
            onChange={function(e) { setMood(Number(e.target.value)); }}
            className="w-full accent-purple-500"
          />
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-xs text-gray-500 uppercase tracking-[0.15em] font-medium">Energy Today</span>
            </div>
            <span className="text-xl font-bold text-cyan-400 font-display">{energy}/10</span>
          </div>
          <input
            type="range" min="1" max="10" value={energy}
            onChange={function(e) { setEnergy(Number(e.target.value)); }}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 stagger-children">
        {quickActions.map(function(action) {
          var Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={"flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r " + action.color + " text-white text-sm font-semibold text-center hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"}
            >
              <Icon size={15} />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-purple-400" />
              <h2 className="text-lg font-bold text-white">Goals</h2>
            </div>
            <Link href="/dashboard/goals" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {goals.map(function(goal) {
              return (
                <div key={goal.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-gray-300">{goal.name}</span>
                    <span className="text-sm text-gray-500 font-display font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={"h-full bg-gradient-to-r " + goal.color + " rounded-full transition-all duration-1000"}
                      style={{ width: mounted ? goal.progress + "%" : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <h2 className="text-lg font-bold text-white">Habits</h2>
            </div>
            <Link href="/dashboard/habits" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {habits.map(function(habit) {
              return (
                <div
                  key={habit.name}
                  className={"p-3.5 rounded-xl border transition-all duration-300 " + (
                    habit.done
                      ? "border-green-500/30 bg-green-500/[0.06] shadow-inner"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{habit.name}</div>
                    {habit.done && <span className="text-green-400 text-xs">Done</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Flame size={12} className={"transition-colors " + (habit.streak > 7 ? "text-orange-400 animate-streak-fire" : "text-gray-600")} />
                    <span className="text-xs text-gray-500 font-display">{habit.streak} day streak</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dex Insight */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/15 bg-purple-500/[0.03] animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-purple-500/20 animate-pulse-glow">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-400 mb-1.5 flex items-center gap-2">
              Dex says
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              You have 4 active goals this week. Your coding streak is strong at 12 days - keep the momentum going!
              German practice is at 30% - consider scheduling 20 minutes daily to hit B1 by summer.
            </p>
            <Link href="/dashboard/coach" className="inline-flex items-center gap-1.5 mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Talk to Dex <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
