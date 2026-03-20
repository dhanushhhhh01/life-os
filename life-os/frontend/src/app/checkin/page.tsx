"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Zap, Brain, Moon, Send, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { GlassCard } from "@/components/GlassCard";
import { MoodRing, MoodDot } from "@/components/MoodRing";
import { checkins } from "@/lib/api";
import type { Checkin } from "@/lib/api";

const moodLabels = ["", "Terrible", "Awful", "Bad", "Low", "Meh", "Okay", "Good", "Great", "Amazing", "On Fire"];
const energyLabels = ["", "Dead", "Exhausted", "Drained", "Tired", "So-so", "Decent", "Good", "Energized", "Fired Up", "Unstoppable"];

export default function CheckinPage() {
  const { loggedIn } = useAuth();
  const router = useRouter();

  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
    checkins.list(7).then(setRecentCheckins).catch(console.error);
  }, [loggedIn]);

  async function handleSubmit() {
    setLoading(true);
    try {
      await checkins.create({
        mood,
        energy,
        stress: stress || undefined,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : undefined,
        notes: notes || undefined,
      });
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 2000);
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Daily Check-in</h1>
          <p className="text-white/40 mb-8">How are you feeling today? Be honest — this is just for you.</p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check-in saved! 💜</h2>
            <p className="text-white/40">Redirecting to dashboard...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main Form (3/5) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mood Slider */}
              <GlassCard delay={0.1}>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-semibold text-white">Mood</h2>
                  <span className="ml-auto text-accent-light font-bold text-lg">{mood}/10</span>
                </div>
                <div className="mb-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, #ef4444, #eab308, #22c55e, #8b5cf6, #ec4899)`,
                    }}
                  />
                </div>
                <p className="text-center text-white/60 text-lg">{moodLabels[mood]}</p>
              </GlassCard>

              {/* Energy Slider */}
              <GlassCard delay={0.15}>
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Energy</h2>
                  <span className="ml-auto text-accent-light font-bold text-lg">{energy}/10</span>
                </div>
                <div className="mb-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, #f87171, #fbbf24, #34d399)`,
                    }}
                  />
                </div>
                <p className="text-center text-white/60 text-lg">{energyLabels[energy]}</p>
              </GlassCard>

              {/* Optional: Stress & Sleep */}
              <GlassCard delay={0.2}>
                <h2 className="text-sm text-white/40 uppercase tracking-wider mb-4">Optional</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <Brain className="w-4 h-4 text-red-300" /> Stress
                    </label>
                    <select
                      value={stress ?? ""}
                      onChange={(e) => setStress(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-300/50 border border-glass-border text-white text-sm focus:outline-none focus:border-accent/50"
                    >
                      <option value="">Skip</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}/10</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <Moon className="w-4 h-4 text-blue-300" /> Sleep (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="7.5"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-300/50 border border-glass-border text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Notes */}
              <GlassCard delay={0.25}>
                <label className="text-sm text-white/60 mb-2 block">What&apos;s on your mind?</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything you want to capture about today..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 text-sm resize-none"
                />
              </GlassCard>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-accent hover:bg-accent-dark text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-glow"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Save Check-in
                  </>
                )}
              </motion.button>
            </div>

            {/* Right — Live Preview + Recent */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Mood Ring */}
              <GlassCard delay={0.15} className="flex flex-col items-center py-8">
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Live Preview</h3>
                <MoodRing mood={mood} energy={energy} size={160} />
              </GlassCard>

              {/* Recent Check-ins */}
              <GlassCard delay={0.3}>
                <h3 className="text-sm text-white/40 uppercase tracking-wider mb-4">Last 7 Days</h3>
                {recentCheckins.length === 0 ? (
                  <p className="text-white/30 text-sm italic">No recent check-ins</p>
                ) : (
                  <div className="space-y-2">
                    {recentCheckins.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0">
                        <MoodDot mood={c.mood} />
                        <div className="flex-1">
                          <span className="text-sm text-white/70">{c.date}</span>
                        </div>
                        <span className="text-xs text-white/40">
                          M:{c.mood} E:{c.energy}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
