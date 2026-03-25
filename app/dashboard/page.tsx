"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function GlassCard({ children, className = "", delay = 0 }: any) {
  return (<div className={`glass-card p-6 animate-fade-in ${className}`} style={{ animationDelay: `${delay}s`, opacity: 0 }}>{children}</div>);
}

function MoodRing({ value, size = 120 }: { value: number; size?: number }) {
  const pct = (value / 10) * 100;
  const circ = 2 * Math.PI * 45;
  const off = circ - (pct / 100) * circ;
  const col = value >= 7 ? "#34d399" : value >= 4 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r="45" fill="none" stroke={col} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute text-center"><div className="text-2xl font-bold" style={{ color: col }}>{value}</div><div className="text-xs text-slate-500">/ 10</div></div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("lifeos_user");
    if (u) setUser(JSON.parse(u));
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      const h = now.getHours();
      setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
    };
    updateTime();
    const iv = setInterval(updateTime, 1000);
    return () => clearInterval(iv);
  }, []);

  const quickActions = [
    { icon: "📝", label: "New Journal", href: "/dashboard/journal", color: "from-indigo-500 to-purple-500" },
    { icon: "🎯", label: "Add Goal", href: "/dashboard/goals", color: "from-purple-500 to-pink-500" },
    { icon: "🧠", label: "Ask Coach", href: "/dashboard/coach", color: "from-emerald-500 to-teal-500" },    { icon: "
  ];

  const goals = [
    { name: "German to B1", progress: 30, icon: "🇩🇪" },    { name: "Master FastAPI & LLMs", progress: 45, icon: "
    { name: "Land AI Internship", progress: 20, icon: "💼" },
    { name: "Build Portfolio Projects", progress: 60, icon: "💻" },
  ];

  const habits = [
    { name: "Morning Coding", streak: 12, done: true, icon: "💻" },
    { name: "German Practice", streak: 3, done: false, icon: "🇩🇪" },    { name: "Read 30min", streak: 8, done: true, icon: "    { name: "Exercise", streak: 5, done: false, icon: "
  ];

  return (
    <div className="space-y-8">
      <GlassCard delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm">{greeting} 👋</p>
            <h1 className="text-3xl font-bold mt-1"><span className="text-gradient">{user?.name || "Explorer"}</span></h1>
            <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold text-indigo-400">{time}</div>
            <div className="text-xs text-slate-500 mt-1">Berlin, Germany</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <Link key={i} href={a.href}>
            <div className="glass-card p-5 text-center hover:scale-105 transition-transform cursor-pointer animate-fade-in" style={{ animationDelay: `${0.1+i*0.1}s`, opacity: 0 }}>
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>{a.icon}</div>
              <p className="text-sm font-medium">{a.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard delay={0.3}>
          <h3 className="text-sm font-medium text-slate-400 mb-4">Today&apos;s Overview</h3>
          <div className="flex items-center justify-around">
            <div><div className="text-5xl font-bold text-gradient">72</div><div className="text-sm text-slate-400 mt-1">Life Score</div><div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{width:"72%"}} /></div></div>
            <MoodRing value={7} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-lg font-bold text-emerald-400">7</div><div className="text-xs text-slate-500">Mood</div></div>
            <div className="bg-white/5 rounded-lg p-3 text-center"><div className="text-lg font-bold text-cyan-400">8</div><div className="text-xs text-slate-500">Energy</div></div>
          </div>
        </GlassCard>

        <GlassCard delay={0.4}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium text-slate-400">Active Goals</h3><Link href="/dashboard/goals" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link></div>
          <div className="space-y-4">
            {goals.map((g, i) => (
              <div key={i}><div className="flex items-center gap-3 mb-1"><span>{g.icon}</span><span className="text-sm flex-1 truncate">{g.name}</span><span className="text-xs text-slate-500">{g.progress}%</span></div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{width:`${g.progress}%`}} /></div></div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium text-slate-400">Today&apos;s Habits</h3><Link href="/dashboard/habits" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link></div>
          <div className="space-y-3">
            {habits.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${h.done?"bg-indigo-500 border-indigo-500":"border-slate-600"}`}>{h.done && <span className="text-xs">✓</span>}</button>
                <span className="text-lg">{h.icon}</span><span className={`text-sm flex-1 ${h.done?"line-through text-slate-500":""}`}>{h.name}</span><span className="text-xs text-orange-400">🔥 {h.streak}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.6} className="border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div><h3 className="font-medium text-indigo-300 mb-1">Dex&apos;s Daily Insight</h3>          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shrink-0">
          <p className="text-sm text-slate-400 leading-relaxed">Your coding streak is strong at 12 days! Consider pairing your German practice with your morning routine to boost that streak too. Your mood tends to be higher on days you exercise early. Try a 20-min workout before your coding session tomorrow.</p></div>
        </div>
      </GlassCard>
    </div>
  );
}
