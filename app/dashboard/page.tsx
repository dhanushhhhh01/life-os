"use client";
import { useState } from "react";
import Link from "next/link";

const goals = [
  { name: "Master FastAPI & LLMs", progress: 45, color: "from-purple-500 to-pink-500" },
  { name: "German to B1", progress: 30, color: "from-cyan-500 to-blue-500" },
  { name: "Land AI Internship", progress: 20, color: "from-orange-500 to-red-500" },
  { name: "Build Portfolio Projects", progress: 60, color: "from-green-500 to-teal-500" },
];

const habits = [
  { name: "Morning Coding", streak: 12, done: true },
  { name: "Exercise", streak: 5, done: false },
  { name: "Read 30min", streak: 8, done: true },
  { name: "German Practice", streak: 3, done: false },
];

const quickActions = [
  { label: "New Journal", href: "/dashboard/journal", color: "from-indigo-500 to-purple-500" },
  { label: "Add Goal", href: "/dashboard/goals", color: "from-purple-500 to-pink-500" },
  { label: "Ask Coach", href: "/dashboard/coach", color: "from-emerald-500 to-teal-500" },
];

export default function DashboardPage() {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(6);
  const lifeScore = Math.round((mood + energy + 7) / 3 * 10);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            Good morning, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Dhanush</span>
          </h1>
          <p className="text-gray-400 mt-1">Berlin, Germany  -  Your Second Brain is ready</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{lifeScore}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">Life Score</div>
        </div>
      </div>

      {/* Quick mood + energy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Mood Today</div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="1" max="10" value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="flex-1 accent-purple-500"
            />
            <span className="text-2xl font-bold text-purple-400">{mood}/10</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Energy Today</div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="1" max="10" value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="flex-1 accent-cyan-500"
            />
            <span className="text-2xl font-bold text-cyan-400">{energy}/10</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity shadow-lg`}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Goals */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Goals</h2>
          <Link href="/dashboard/goals" className="text-xs text-purple-400 hover:text-purple-300">View All</Link>
        </div>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">{goal.name}</span>
                <span className="text-sm text-gray-400">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all`}
                  style={{ width: goal.progress + "%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Habits</h2>
          <Link href="/dashboard/habits" className="text-xs text-cyan-400 hover:text-cyan-300">View All</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {habits.map((habit) => (
            <div
              key={habit.name}
              className={`p-3 rounded-xl border transition-all ${
                habit.done
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="text-sm font-medium text-white">{habit.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                {habit.streak} day streak {habit.done ? "v" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dex Insight */}
      <div className="glass-card p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            D
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-400 mb-1">Dex says</div>
            <p className="text-sm text-gray-300">
              You have 4 active goals this week. Your coding streak is strong at days 12 keep the momentum going!  
              German practice is at 30%  -  consider scheduling 20 minutes daily to hit B1 by summer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
