"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sunrise, Target, Flame, Brain, RefreshCw, Loader2, AlertCircle,
  Sparkles, ChevronRight, Trophy, Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { GlassCard } from "@/components/GlassCard";
import { MoodRing } from "@/components/MoodRing";
import { LifeScoreRing, ScoreBreakdown, ScoreTrendChart } from "@/components/LifeScore";
import {
  ai, goals as goalsApi, habits as habitsApi, checkins,
  lifeScore as lifeScoreApi, nudges as nudgesApi, goalDecompose,
} from "@/lib/api";
import type {
  Goal, Habit, Checkin, BriefingResponse,
  LifeScoreData, ScoreTrend, Nudge, GoalDecomposition,
} from "@/lib/api";

export default function Dashboard() {
  const { loggedIn, user } = useAuth();
  const router = useRouter();

  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [goalsList, setGoals] = useState<Goal[]>([]);
  const [habitsList, setHabits] = useState<Habit[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null);
  const [score, setScore] = useState<LifeScoreData | null>(null);
  const [scoreTrend, setScoreTrend] = useState<ScoreTrend[]>([]);
  const [nudgesList, setNudges] = useState<Nudge[]>([]);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decomposing, setDecomposing] = useState<string | null>(null);
  const [decomposition, setDecomposition] = useState<GoalDecomposition | null>(null);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
    loadData();
  }, [loggedIn]);

  async function loadData() {
    setLoading(true);
    try {
      const [g, h, c, s, t, n] = await Promise.all([
        goalsApi.list({ status: "active" }),
        habitsApi.list(),
        checkins.today(),
        lifeScoreApi.get().catch(() => null),
        lifeScoreApi.trend(30).catch(() => []),
        nudgesApi.check().catch(() => []),
      ]);
      setGoals(g);
      setHabits(h);
      setTodayCheckin(c);
      setScore(s);
      setScoreTrend(t);
      setNudges(n);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  }

  async function loadBriefing() {
    setLoadingBriefing(true);
    try {
      setBriefing(await ai.briefing());
    } catch (err) {
      console.error("Briefing error:", err);
    }
    setLoadingBriefing(false);
  }

  async function handleCompleteHabit(id: string) {
    try {
      await habitsApi.complete(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDecompose(goalId: string) {
    setDecomposing(goalId);
    try {
      const result = await goalDecompose.decompose(goalId);
      setDecomposition(result);
    } catch (err) {
      console.error(err);
    }
    setDecomposing(null);
  }

  if (!loggedIn) return null;
  const greeting = getGreeting(user?.full_name || user?.username || "there");

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-64 p-8 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">{greeting}</h1>
          <p className="text-white/40 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-accent-light animate-spin" />
          </div>
        ) : (
          <>
            {/* Nudges Banner */}
            <AnimatePresence>
              {nudgesList.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 space-y-2"
                >
                  {nudgesList.map((n) => (
                    <div
                      key={n.habit_id}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-white/80">{n.nudge}</p>
                        <p className="text-[10px] text-white/30 mt-1">
                          {n.habit_name} · {n.missed_days} days missed
                        </p>
                      </div>
                      <button
                        onClick={() => handleCompleteHabit(n.habit_id)}
                        className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 text-xs hover:bg-orange-500/20 transition-all shrink-0"
                      >
                        Do it now
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* ── Column 1-2: Main Content ── */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Briefing */}
                <GlassCard delay={0.1}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Sunrise className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Daily Briefing</h2>
                        <p className="text-xs text-white/30">AI-generated morning plan</p>
                      </div>
                    </div>
                    <button
                      onClick={loadBriefing}
                      disabled={loadingBriefing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent-light text-sm hover:bg-accent/20 transition-all disabled:opacity-50"
                    >
                      {loadingBriefing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {briefing ? "Refresh" : "Generate"}
                    </button>
                  </div>
                  {briefing ? (
                    <div className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm">{briefing.briefing}</div>
                  ) : (
                    <p className="text-white/30 text-sm italic">Click &ldquo;Generate&rdquo; for your personalized morning plan ✨</p>
                  )}
                </GlassCard>

                {/* Goals with Decompose */}
                <GlassCard delay={0.2}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Active Goals</h2>
                      <p className="text-xs text-white/30">{goalsList.length} goals in progress</p>
                    </div>
                  </div>
                  {goalsList.length === 0 ? (
                    <p className="text-white/30 text-sm italic">No active goals yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {goalsList.slice(0, 5).map((goal) => (
                        <div key={goal.id} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">{goal.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/40">{goal.progress.toFixed(0)}%</span>
                              <button
                                onClick={() => handleDecompose(goal.id)}
                                disabled={decomposing === goal.id}
                                className="opacity-0 group-hover:opacity-100 transition-all"
                                title="AI Decompose"
                              >
                                {decomposing === goal.id ? (
                                  <Loader2 className="w-3.5 h-3.5 text-accent-light animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-accent-light/60 hover:text-accent-light" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, #7c5bf5, ${goal.progress > 70 ? "#22c55e" : "#a78bfa"})` }}
                            />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] text-white/20 uppercase">{goal.category}</span>
                            <span className="text-[10px] text-white/20">•</span>
                            <span className="text-[10px] text-white/20 uppercase">{goal.timeframe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>

                {/* Goal Decomposition Result */}
                <AnimatePresence>
                  {decomposition && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <GlassCard className="border-accent/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent-light" />
                            <h3 className="text-lg font-semibold text-white">AI Roadmap: {decomposition.title}</h3>
                          </div>
                          <button onClick={() => setDecomposition(null)} className="text-white/30 hover:text-white/60 text-sm">✕</button>
                        </div>

                        {/* Milestones */}
                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2 mt-4">📍 Milestones</h4>
                        <div className="space-y-2 mb-4">
                          {decomposition.milestones.map((m, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-300/30">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent-light shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm text-white/80 font-medium">{m.title}</p>
                                {m.description && <p className="text-xs text-white/40 mt-0.5">{m.description}</p>}
                                <p className="text-[10px] text-accent-light/50 mt-1">Due: {m.target_date}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Weekly Tasks */}
                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">📋 Weekly Tasks</h4>
                        <div className="space-y-2 mb-4">
                          {decomposition.weekly_tasks.slice(0, 4).map((w, i) => (
                            <div key={i} className="p-3 rounded-xl bg-surface-300/30">
                              <p className="text-xs text-white/40 mb-1">Week {w.week}</p>
                              <ul className="space-y-1">
                                {w.tasks.map((t, j) => (
                                  <li key={j} className="text-sm text-white/60 flex items-start gap-2">
                                    <span className="text-white/20 mt-0.5">›</span> {t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Daily Habits */}
                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">⚡ Daily Micro-Habits</h4>
                        <div className="space-y-1">
                          {decomposition.daily_habits.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-300/20">
                              <Zap className="w-3.5 h-3.5 text-yellow-400" />
                              <span className="text-sm text-white/70">{h.habit}</span>
                              <span className="text-[10px] text-white/30 ml-auto">{h.time_of_day} · {h.duration_minutes}min</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Column 3: Mood + Habits ── */}
              <div className="space-y-6">
                {/* Mood Ring */}
                <GlassCard delay={0.15} className="flex flex-col items-center py-8">
                  <h2 className="text-sm text-white/40 uppercase tracking-wider mb-6">Today&apos;s Vibe</h2>
                  {todayCheckin ? (
                    <MoodRing mood={todayCheckin.mood} energy={todayCheckin.energy} size={140}
                      label={todayCheckin.notes || undefined} />
                  ) : (
                    <div className="text-center">
                      <MoodRing mood={5} energy={5} size={140} />
                      <p className="text-white/30 text-sm mt-4 italic">No check-in yet</p>
                      <button onClick={() => router.push("/checkin")}
                        className="mt-3 px-4 py-2 rounded-xl bg-accent/10 text-accent-light text-sm hover:bg-accent/20 transition-all">
                        Check in now
                      </button>
                    </div>
                  )}
                </GlassCard>

                {/* Habit Streaks */}
                <GlassCard delay={0.25}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Habits</h2>
                      <p className="text-xs text-white/30">{habitsList.length} active</p>
                    </div>
                  </div>
                  {habitsList.length === 0 ? (
                    <p className="text-white/30 text-sm italic">No habits tracked yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {habitsList.map((habit) => (
                        <div key={habit.id}
                          className="flex items-center justify-between py-2 px-1 border-b border-glass-border last:border-0 group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 truncate">{habit.name}</p>
                            <p className="text-[10px] text-white/30">{habit.frequency} · {habit.time_of_day}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span className="text-sm font-semibold text-orange-300">{habit.current_streak}</span>
                            </div>
                            <button
                              onClick={() => handleCompleteHabit(habit.id)}
                              className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 hover:bg-green-500/20 transition-all text-xs"
                              title="Log completion"
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* ── Column 4: Life Score ── */}
              <div className="space-y-6">
                {/* Life Score */}
                <GlassCard delay={0.2} className="flex flex-col items-center py-6">
                  <h2 className="text-sm text-white/40 uppercase tracking-wider mb-4">Life Score</h2>
                  {score ? (
                    <>
                      <LifeScoreRing score={score.total_score} size={150} />
                      <div className="w-full mt-6 px-2">
                        <ScoreBreakdown scores={{
                          mood: score.mood_score,
                          habits: score.habit_score,
                          goals: score.goal_score,
                          journal: score.journal_score,
                        }} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <LifeScoreRing score={50} size={150} />
                      <p className="text-white/30 text-xs mt-4 italic">Start tracking to see your score</p>
                    </div>
                  )}
                </GlassCard>

                {/* Score Trend */}
                {scoreTrend.length > 1 && (
                  <GlassCard delay={0.3}>
                    <h3 className="text-sm text-white/40 uppercase tracking-wider mb-3">Score Trend</h3>
                    <ScoreTrendChart data={scoreTrend} />
                  </GlassCard>
                )}

                {/* Quick Actions */}
                <GlassCard delay={0.35}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-accent-light" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Quick</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Check In", href: "/checkin", emoji: "💜" },
                      { label: "Journal", href: "/journal", emoji: "✍️" },
                      { label: "Coach", href: "/coach", emoji: "🧭" },
                      { label: "Report", href: "#", emoji: "📊", action: true },
                    ].map((a) => (
                      <button key={a.label}
                        onClick={() => a.action ? {} : router.push(a.href)}
                        className="flex flex-col items-center gap-1 py-3 rounded-xl bg-surface-300/30 hover:bg-surface-300/60 transition-all text-sm">
                        <span className="text-lg">{a.emoji}</span>
                        <span className="text-white/60 text-xs">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name} ☀️`;
  if (hour < 17) return `Good afternoon, ${name} 🌤️`;
  if (hour < 21) return `Good evening, ${name} 🌙`;
  return `Night owl mode, ${name} 🦉`;
}
