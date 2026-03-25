"use client";
import { useState } from "react";

interface Habit {
  id: number;
  name: string;
  streak: number;
  done: boolean;
  color: string;
}

const defaultHabits: Habit[] = [
  { id: 1, name: "Morning Coding", streak: 12, done: false, color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Exercise", streak: 5, done: false, color: "from-orange-500 to-red-500" },
  { id: 3, name: "Read 30min", streak: 8, done: false, color: "from-blue-500 to-cyan-500" },
  { id: 4, name: "German Practice", streak: 3, done: false, color: "from-yellow-500 to-orange-500" },
  { id: 5, name: "Meditate", streak: 2, done: false, color: "from-teal-500 to-green-500" },
  { id: 6, name: "Cold Shower", streak: 7, done: false, color: "from-cyan-500 to-blue-500" },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [newHabit, setNewHabit] = useState("");

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 };
      }
      return h;
    }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const colors = ["from-purple-500 to-pink-500", "from-cyan-500 to-blue-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500"];
    const h: Habit = {
      id: Date.now(), name: newHabit.trim(), streak: 0, done: false,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setHabits([...habits, h]);
    setNewHabit("");
  };

  const doneCount = habits.filter(h => h.done).length;
  const completionRate = Math.round((doneCount / habits.length) * 100);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Habits</h1>
        <p className="text-gray-400 mt-1">Build the discipline to become unstoppable</p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">{doneCount} of {habits.length} done today</span>
          <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{completionRate}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: completionRate + "%" }}
          />
        </div>
        {completionRate === 100 && (
          <div className="mt-3 text-center text-green-400 font-semibold text-sm">
            All habits done! Outstanding day, Dhanush!
          </div>
        )}
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
              habit.done
                ? "border-green-500/40 bg-green-500/10"
                : "border-white/10 glass-card hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  habit.done
                    ? "border-green-400 bg-green-400"
                    : "border-gray-600"
                }`}>
                  {habit.done && <span className="text-xs text-white font-bold">v</span>}
                </div>
                <div>
                  <div className={`font-semibold ${habit.done ? "text-gray-400 line-through" : "text-white"}`}>
                    {habit.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{habit.streak} day streak</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black bg-gradient-to-r ${habit.color} bg-clip-text text-transparent`}>
                  {habit.streak}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Add Habit */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Add New Habit</h2>
        <div className="flex gap-3">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g. Read AI papers, Practice piano..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
          />
          <button
            onClick={addHabit}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
