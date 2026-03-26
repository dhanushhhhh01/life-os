"use client";
import { useState, useEffect } from "react";
import { Flame, Plus, Check, Trophy, TrendingUp, X } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { awardXP, checkAndAwardBadges, XP_AWARDS } from "../../../lib/xp";

var defaultHabits = [
  { name: "Morning Coding", streak: 12, done_today: false, color: "from-purple-500 to-pink-500" },
  { name: "Exercise", streak: 5, done_today: false, color: "from-orange-500 to-red-500" },
  { name: "Read 30min", streak: 8, done_today: false, color: "from-blue-500 to-cyan-500" },
  { name: "German Practice", streak: 3, done_today: false, color: "from-yellow-500 to-orange-500" },
  { name: "Meditate", streak: 2, done_today: false, color: "from-teal-500 to-green-500" },
  { name: "Cold Shower", streak: 7, done_today: false, color: "from-cyan-500 to-blue-500" },
];

function getStreakEmoji(streak) {
  if (streak >= 14) return "Unstoppable";
  if (streak >= 7) return "On fire!";
  if (streak >= 3) return "Building";
  return "Starting";
}

function getStreakColor(streak) {
  if (streak >= 14) return "text-purple-400";
  if (streak >= 7) return "text-orange-400";
  if (streak >= 3) return "text-yellow-400";
  return "text-gray-500";
}

export default function HabitsPage() {
  var [habits, setHabits] = useState([]);
  var [loading, setLoading] = useState(true);
  var [userId, setUserId] = useState(null);
  var [newHabit, setNewHabit] = useState("");
  var [saving, setSaving] = useState(false);
  var [mounted, setMounted] = useState(false);
  var [xpToast, setXpToast] = useState("");

  useEffect(function() { setMounted(true); }, []);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        var uid = result.data.session.user.id;
        setUserId(uid);
        loadHabits(uid);
      }
    });
  }, []);

  async function loadHabits(uid) {
    setLoading(true);
    var today = new Date().toISOString().split("T")[0];
    var result = await supabase.from("habits").select("*").eq("user_id", uid).order("created_at", { ascending: true });
    if (!result.error && result.data.length === 0) {
      var colors = ["from-purple-500 to-pink-500", "from-orange-500 to-red-500", "from-blue-500 to-cyan-500", "from-yellow-500 to-orange-500", "from-teal-500 to-green-500", "from-cyan-500 to-blue-500"];
      var inserts = defaultHabits.map(function(h, i) {
        return Object.assign({}, h, { user_id: uid, color: colors[i % colors.length] });
      });
      var seed = await supabase.from("habits").insert(inserts).select();
      if (!seed.error) setHabits(seed.data.map(function(h) { return Object.assign({}, h, { done: h.last_done_date === today }); }));
    } else if (!result.error) {
      setHabits(result.data.map(function(h) { return Object.assign({}, h, { done: h.last_done_date === today }); }));
    }
    setLoading(false);
  }

  async function toggleHabit(id) {
    var today = new Date().toISOString().split("T")[0];
    var habit = habits.find(function(h) { return h.id === id; });
    if (!habit) return;
    var newDone = !habit.done;
    var newStreak = newDone ? habit.streak + 1 : Math.max(0, habit.streak - 1);
    var update = { done_today: newDone, streak: newStreak, last_done_date: newDone ? today : null };
    await supabase.from("habits").update(update).eq("id", id);
    setHabits(habits.map(function(h) { return h.id === id ? Object.assign({}, h, update, { done: newDone }) : h; }));

    // Award XP when marking done (not when un-marking)
    if (newDone && userId) {
      try {
        var profileRes = await supabase.from("profiles").select("xp, level, badges").eq("id", userId).single();
        var curXp = profileRes.data?.xp || 0;
        var curBadges = profileRes.data?.badges || [];
        var xpResult = await awardXP(userId, XP_AWARDS.HABIT_DONE, curXp, curBadges);
        var maxStreak = Math.max.apply(null, habits.map(function(h) { return h.id === id ? newStreak : h.streak; }));
        await checkAndAwardBadges(userId, xpResult.newBadges, { maxHabitStreak: maxStreak });
        var toastMsg = "+10 XP! Habit done!";
        if (xpResult.leveledUp) toastMsg = "Level Up! Level " + xpResult.newLevel + "! +10 XP";
        setXpToast(toastMsg);
        setTimeout(function() { setXpToast(""); }, 2500);
      } catch(e) {}
    }
  }

  async function addHabit() {
    if (!newHabit.trim() || !userId) return;
    setSaving(true);
    var colors = ["from-purple-500 to-pink-500", "from-cyan-500 to-blue-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500"];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var data = { user_id: userId, name: newHabit.trim(), streak: 0, done_today: false, color: color };
    var result = await supabase.from("habits").insert(data).select();
    if (!result.error) setHabits([].concat(habits, [Object.assign({}, result.data[0], { done: false })]));
    setNewHabit("");
    setSaving(false);
  }

  async function deleteHabit(id) {
    await supabase.from("habits").delete().eq("id", id);
    setHabits(habits.filter(function(h) { return h.id !== id; }));
  }

  var doneCount = habits.filter(function(h) { return h.done; }).length;
  var completionRate = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
  var longestStreak = habits.length > 0 ? Math.max.apply(null, habits.map(function(h) { return h.streak; })) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 stagger-children">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white text-sm font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="text-yellow-300">⚡</span>
          {xpToast}
        </div>
      )}
      <div className="flex items-center gap-2 mb-1">
        <Flame size={18} className="text-orange-400" />
        <h1 className="text-3xl font-black text-white">Habits</h1>
      </div>
      <p className="text-gray-500 text-sm -mt-4">Build the discipline to become unstoppable</p>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black text-gradient-cyan font-display">{doneCount}/{habits.length}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Done Today</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black font-display" style={{ color: "#f97316" }}>{longestStreak}</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Best Streak</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.06] text-center">
          <div className="text-2xl font-black text-gradient font-display">{completionRate}%</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mt-1">Completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <TrendingUp size={14} /> Today&apos;s Progress
          </span>
          <span className="text-lg font-black text-gradient-cyan font-display">{completionRate}%</span>
        </div>
        <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
            style={{ width: mounted ? completionRate + "%" : "0%" }}
          />
        </div>
        {completionRate === 100 && (
          <div className="mt-3 text-center text-green-400 font-semibold text-sm flex items-center justify-center gap-2 animate-slide-up">
            <Trophy size={16} /> All habits done! Outstanding day, Dhanush!
          </div>
        )}
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.map(function(habit) {
          return (
            <div
              key={habit.id}
              className={"w-full p-4 rounded-2xl border text-left transition-all duration-300 group " + (
                habit.done
                  ? "border-green-500/25 bg-green-500/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
              )}
            >
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-4 flex-1" onClick={function() { toggleHabit(habit.id); }}>
                  <div className={"w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all " + (
                    habit.done
                      ? "border-green-400 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                      : "border-gray-700 group-hover:border-gray-500"
                  )}>
                    {habit.done && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="text-left">
                    <div className={"font-semibold transition-all " + (habit.done ? "text-gray-500 line-through" : "text-white")}>
                      {habit.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Flame size={11} className={"transition-all " + (habit.streak >= 7 ? "text-orange-400" : "text-gray-700")} />
                      <span className="text-xs text-gray-600 font-display">{habit.streak} days</span>
                      <span className={"text-[10px] font-medium " + getStreakColor(habit.streak)}>{getStreakEmoji(habit.streak)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  <div className={"text-2xl font-black bg-gradient-to-r " + habit.color + " bg-clip-text text-transparent font-display"}>
                    {habit.streak}
                  </div>
                  <button
                    onClick={function() { deleteHabit(habit.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Plus size={12} /> Add New Habit
        </h2>
        <div className="flex gap-3">
          <input
            value={newHabit}
            onChange={function(e) { setNewHabit(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") addHabit(); }}
            placeholder="e.g. Read AI papers, Practice piano..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
          />
          <button
            onClick={addHabit}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {saving ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
