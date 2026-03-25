"use client";
import { useState } from "react";

interface Goal {
  id: number;
  name: string;
  progress: number;
  category: string;
  deadline: string;
  color: string;
}

const defaultGoals: Goal[] = [
  { id: 1, name: "Master FastAPI & LLMs", progress: 45, category: "Tech", deadline: "Jun 2026", color: "from-purple-500 to-pink-500" },
  { id: 2, name: "German to B1 Level", progress: 30, category: "Language", deadline: "Aug 2026", color: "from-yellow-500 to-orange-500" },
  { id: 3, name: "Land AI Internship", progress: 20, category: "Career", deadline: "May 2026", color: "from-orange-500 to-red-500" },
  { id: 4, name: "Build Portfolio Projects", progress: 60, category: "Tech", deadline: "Apr 2026", color: "from-green-500 to-teal-500" },
  { id: 5, name: "Complete Master Thesis", progress: 10, category: "Academic", deadline: "Dec 2026", color: "from-blue-500 to-cyan-500" },
  { id: 6, name: "Read 24 Books This Year", progress: 25, category: "Learning", deadline: "Dec 2026", color: "from-indigo-500 to-purple-500" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(defaultGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", category: "Tech", deadline: "" });

  const updateProgress = (id: number, delta: number) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const p = Math.min(100, Math.max(0, g.progress + delta));
        return { ...g, progress: p };
      }
      return g;
    }));
  };

  const addGoal = () => {
    if (!newGoal.name.trim()) return;
    const colors = ["from-purple-500 to-pink-500", "from-cyan-500 to-blue-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500", "from-yellow-500 to-orange-500"];
    const g: Goal = {
      id: Date.now(), progress: 0,
      name: newGoal.name.trim(), category: newGoal.category, deadline: newGoal.deadline,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setGoals([...goals, g]);
    setShowAdd(false);
    setNewGoal({ name: "", category: "Tech", deadline: "" });
  };

  const avgProgress = Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Goals</h1>
          <p className="text-gray-400 mt-1">Track every target on the path to AI Engineer</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          + New Goal
        </button>
      </div>

      {/* Overall Progress */}
      <div className="glass-card p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{avgProgress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
            style={{ width: avgProgress + "%" }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>{goals.length} total goals</span>
          <span>{goals.filter(g => g.progress === 100).length} completed</span>
          <span>{goals.filter(g => g.progress > 0 && g.progress < 100).length} in progress</span>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <div className="glass-card p-5 rounded-2xl border border-purple-500/30">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">New Goal</h2>
          <div className="space-y-3">
            <input
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              placeholder="Goal name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
            <div className="flex gap-3">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-sm"
              >
                <option value="Tech">Tech</option>
                <option value="Career">Career</option>
                <option value="Language">Language</option>
                <option value="Academic">Academic</option>
                <option value="Learning">Learning</option>
                <option value="Health">Health</option>
              </select>
              <input
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                placeholder="Deadline (e.g. Jun 2026)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={addGoal} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm">
                Add Goal
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-white">{goal.name}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{goal.category}</span>
                  {goal.deadline && <span className="text-xs text-gray-500">{goal.deadline}</span>}
                </div>
              </div>
              <div className={`text-2xl font-black bg-gradient-to-r ${goal.color} bg-clip-text text-transparent`}>
                {goal.progress}%
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-300`}
                style={{ width: goal.progress + "%" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateProgress(goal.id, -10)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
              >
                -10%
              </button>
              <button
                onClick={() => updateProgress(goal.id, 10)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
              >
                +10%
              </button>
              {goal.progress === 100 && (
                <span className="ml-auto text-xs text-green-400 font-semibold flex items-center gap-1">
                  Complete!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
