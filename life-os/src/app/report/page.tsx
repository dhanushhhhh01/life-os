"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Lightbulb, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { GlassCard } from "@/components/GlassCard";
import { LifeScoreRing } from "@/components/LifeScore";
import { MoodDot } from "@/components/MoodRing";
import { weeklyReports } from "@/lib/api";
import type { WeeklyReportData } from "@/lib/api";

export default function ReportPage() {
  const { loggedIn } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
  }, [loggedIn]);

  async function generateReport(offset: number) {
    setLoading(true);
    try {
      const r = await weeklyReports.generate(offset);
      setReport(r);
      setWeekOffset(offset);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-64 p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">Weekly Reflection</h1>
          <p className="text-white/40 mt-1">Your AI-generated weekly summary</p>
        </motion.div>

        {/* Week navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => generateReport(weekOffset + 1)}
            className="p-2 rounded-xl bg-surface-200 text-white/40 hover:text-white/70 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => generateReport(weekOffset)}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-accent text-white font-semibold flex items-center gap-2 hover:bg-accent-dark transition-all disabled:opacity-50 shadow-glow">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
            {report ? `Week of ${report.week_start}` : weekOffset === 0 ? "Generate This Week" : `Generate (${weekOffset} weeks ago)`}
          </button>
          {weekOffset > 0 && (
            <button onClick={() => generateReport(weekOffset - 1)}
              className="p-2 rounded-xl bg-surface-200 text-white/40 hover:text-white/70 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary + Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="lg:col-span-2" delay={0.1}>
                <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
                <p className="text-white/70 leading-relaxed text-sm">{report.summary || "No summary available."}</p>

                {/* Wins */}
                {report.wins && report.wins.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" /> Wins This Week
                    </h3>
                    <div className="space-y-2">
                      {report.wins.map((w, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                          <span className="text-yellow-400">🏆</span>
                          <p className="text-sm text-white/70">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insight */}
                {report.ai_insight && (
                  <div className="mt-6">
                    <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-accent-light" /> AI Insight
                    </h3>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/15">
                      <p className="text-sm text-white/70 leading-relaxed">{report.ai_insight}</p>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Score */}
              <GlassCard delay={0.15} className="flex flex-col items-center justify-center py-6">
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Week Score</h3>
                <LifeScoreRing score={report.life_score || 0} size={130} />
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{report.avg_mood?.toFixed(1) || "—"}</p>
                    <p className="text-[10px] text-white/30 uppercase">Avg Mood</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{report.avg_energy?.toFixed(1) || "—"}</p>
                    <p className="text-[10px] text-white/30 uppercase">Avg Energy</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{report.journal_count}</p>
                    <p className="text-[10px] text-white/30 uppercase">Journal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{report.mood_data?.length || 0}/7</p>
                    <p className="text-[10px] text-white/30 uppercase">Check-ins</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Mood Chart */}
            {report.mood_data && report.mood_data.length > 0 && (
              <GlassCard delay={0.2}>
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Mood Through The Week</h3>
                <div className="flex items-end gap-2 h-32">
                  {report.mood_data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{d.mood}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.mood / 10) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="w-full max-w-[30px] rounded-t-lg"
                        style={{
                          background: `linear-gradient(to top, #7c5bf5, ${d.mood >= 7 ? "#22c55e" : d.mood >= 4 ? "#eab308" : "#ef4444"})`,
                          opacity: 0.7,
                        }}
                      />
                      <span className="text-[9px] text-white/30">
                        {new Date(d.date).toLocaleDateString("en", { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Habits + Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Habit Completion */}
              {report.habit_completion && report.habit_completion.length > 0 && (
                <GlassCard delay={0.25}>
                  <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Habit Completion</h3>
                  <div className="space-y-3">
                    {report.habit_completion.map((h, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white/70">{h.name}</span>
                          <span className="text-xs text-white/40">{h.completed}/{h.target} ({h.rate}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, h.rate)}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            className="h-full rounded-full"
                            style={{
                              background: h.rate >= 80 ? "#22c55e" : h.rate >= 50 ? "#eab308" : "#ef4444",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Goal Progress */}
              {report.goals_progress && report.goals_progress.length > 0 && (
                <GlassCard delay={0.3}>
                  <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Goal Progress</h3>
                  <div className="space-y-3">
                    {report.goals_progress.map((g, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white/70">{g.title}</span>
                          <span className="text-xs text-white/40">{g.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${g.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </motion.div>
        )}

        {!report && !loading && (
          <GlassCard className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">No report yet</h3>
            <p className="text-white/30 text-sm">Click the button above to generate your weekly reflection.</p>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
