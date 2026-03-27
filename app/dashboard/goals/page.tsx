"use client";
import { useState, useEffect } from "react";
import { Target, Plus, X, Award, Clock, TrendingUp, BarChart2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

var defaultGoals = [
  { name: "Master FastAPI & LLMs", progress: 45, category: "Tech", deadline: "Jun 2026", color: "from-[#46F0D2] to-pink-500", ring: "#a855f7" },
  { name: "German to B1 Level", progress: 30, category: "Language", deadline: "Aug 2026", color: "from-yellow-500 to-orange-500", ring: "#f97316" },
  { name: "Land AI Internship", progress: 20, category: "Career", deadline: "May 2026", color: "from-orange-500 to-red-500", ring: "#ef4444" },
  { name: "Build Portfolio Projects", progress: 60, category: "Tech", deadline: "Apr 2026", color: "from-green-500 to-teal-500", ring: "#14b8a6" },
  { name: "Complete Master Thesis", progress: 10, category: "Academic", deadline: "Dec 2026", color: "from-blue-500 to-[#FBE2B4]", ring: "#FBE2B4" },
  { name: "Read 24 Books This Year", progress: 25, category: "Learning", deadline: "Dec 2026", color: "from-[#46F0D2] to-[#46F0D2]", ring: "#46F0D2" },
];

var ringColors = {
  "from-[#46F0D2] to-pink-500": "#a855f7",
  "from-yellow-500 to-orange-500": "#f97316",
  "from-orange-500 to-red-500": "#ef4444",
  "from-green-500 to-teal-500": "#14b8a6",
  "from-blue-500 to-[#FBE2B4]": "#FBE2B4",
  "from-[#46F0D2] to-[#46F0D2]": "#46F0D2",
  "from-[#FBE2B4] to-blue-500": "#FBE2B4",
};

var categoryColors = {
  Tech: { bg: "bg-[#46F0D2]/15 text-[#46F0D2] border-[#46F0D2]/20", bar: "#46F0D2" },
  Career: { bg: "bg-orange-500/15 text-orange-400 border-orange-500/20", bar: "#f97316" },
  Language: { bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", bar: "#eab308" },
  Academic: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/20", bar: "#3b82f6" },
  Learning: { bg: "bg-[#46F0D2]/15 text-[#46F0D2] border-[#46F0D2]/20", bar: "#46F0D2" },
  Health: { bg: "bg-green-500/15 text-green-400 border-green-500/20", bar: "#22c55e" },
};

function CircularProgress(props) {
  var size = props.size || 56;
  var strokeWidth = props.strokeWidth || 4;
  var progress = props.progress || 0;
  var color = props.color || "#46F0D2";
  var radius = (size - strokeWidth) / 2;
  var circumference = radius * 2 * Math.PI;
  var offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-in-out", filter: "drop-shadow(0 0 4px " + color + ")" }} />
    </svg>
  );
}

function getDaysRemaining(deadline) {
  if (!deadline) return null;
  var d = new Date(deadline);
  if (isNaN(d.getTime())) {
    var months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    var parts = deadline.trim().split(" ");
    if (parts.length === 2) {
      var month = months[parts[0]];
      var year = parseInt(parts[1]);
      if (month !== undefined && !isNaN(year)) {
        d = new Date(year, month, 28);
      }
    }
  }
  if (isNaN(d.getTime())) return null;
  var diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function deadlineColor(days) {
  if (days === null) return "text-gray-600";
  if (days < 0) return "text-red-500";
  if (days <= 30) return "text-red-400";
  if (days <= 90) return "text-orange-400";
  if (days <= 180) return "text-yellow-400";
  return "text-green-400";
}

function deadlineLabel(days) {
  if (days === null) return "";
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today!";
  if (days === 1) return "1 day left";
  if (days <= 7) return days + " days left";
  if (days <= 30) return Math.ceil(days / 7) + " wks left";
  if (days <= 365) return Math.ceil(days / 30) + " mo left";
  return Math.round(days / 365 * 10) / 10 + " yrs";
}

function GoalProgressChart(props) {
  var goals = props.goals;
  var mounted = props.mounted;

  if (!goals || goals.length === 0) return null;

  // Sort goals by progress descending for the chart
  var sorted = [].concat(goals).sort(function(a, b) { return b.progress - a.progress; });

  // Category summary
  var catMap = {};
  goals.forEach(function(g) {
    if (!catMap[g.category]) catMap[g.category] = { sum: 0, count: 0 };
    catMap[g.category].sum += g.progress;
    catMap[g.category].count += 1;
  });
  var cats = Object.keys(catMap).map(function(k) {
    return { name: k, avg: Math.round(catMap[k].sum / catMap[k].count), count: catMap[k].count };
  }).sort(function(a, b) { return b.avg - a.avg; });

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/[0.06] space-y-5">
      <div className="flex items-center gap-2">
        <BarChart2 size={15} className="text-[#46F0D2]" />
        <span className="text-xs font-semibold text-[#46F0D2] uppercase tracking-[0.15em]">Progress Breakdown</span>
      </div>

      {/* Horizontal bar chart — all goals */}
      <div className="space-y-2.5">
        {sorted.map(function(goal) {
          var barColor = goal.ring || "#46F0D2";
          var pct = mounted ? goal.progress : 0;
          var isComplete = goal.progress === 100;
          return (
            <div key={goal.id || goal.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400 truncate max-w-[65%]">{goal.name}</span>
                <span className="text-[11px] font-bold" style={{ color: barColor }}>{goal.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: pct + "%",
                    background: "linear-gradient(90deg, " + barColor + "aa, " + barColor + ")",
                    boxShadow: isComplete ? "0 0 8px " + barColor : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.04]" />

      {/* Category averages */}
      <div>
        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">By Category</div>
        <div className="space-y-2">
          {cats.map(function(cat) {
            var catStyle = categoryColors[cat.name] || { bar: "#46F0D2", bg: "bg-white/10 text-gray-400" };
            var pct = mounted ? cat.avg : 0;
            return (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-16 shrink-0 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{cat.name}</span>
                  <span className="text-[10px] font-semibold" style={{ color: catStyle.bar }}>{cat.avg}%</span>
                </div>
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: pct + "%", background: catStyle.bar + "cc" }}
                  />
                </div>
                <span className="text-[9px] text-gray-700 w-6 text-right">{cat.count}x</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini milestone row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "Not started", value: goals.filter(function(g) { return g.progress === 0; }).length, color: "text-gray-600" },
          { label: "In progress", value: goals.filter(function(g) { return g.progress > 0 && g.progress < 100; }).length, color: "text-[#46F0D2]" },
          { label: "Completed", value: goals.filter(function(g) { return g.progress === 100; }).length, color: "text-yellow-400" },
        ].map(function(item) {
          return (
            <div key={item.label} className="text-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className={"text-lg font-black " + item.color}>{item.value}</div>
              <div className="text-[9px] text-gray-700 uppercase tracking-wider mt-0.5">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GoalsPage() {
  var [goals, setGoals] = useState([]);
  var [loading, setLoading] = useState(true);
  var [userId, setUserId] = useState(null);
  var [showAdd, setShowAdd] = useState(false);
  var [newGoal, setNewGoal] = useState({ name: "", category: "Tech", deadline: "" });
  var [saving, setSaving] = useState(false);
  var [mounted, setMounted] = useState(false);
  var [showChart, setShowChart] = useState(false);

  useEffect(function() {
    setMounted(true);
    setTimeout(function() { setShowChart(true); }, 300);
  }, []);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        var uid = result.data.session.user.id;
        setUserId(uid);
        loadGoals(uid);
      }
    });
  }, []);

  async function loadGoals(uid) {
    setLoading(true);
    var result = await supabase.from("goals").select("*").eq("user_id", uid).order("created_at", { ascending: true });
    if (!result.error && result.data.length === 0) {
      var colorKeys = Object.keys(ringColors);
      var inserts = defaultGoals.map(function(g, i) {
        var colorKey = colorKeys[i % colorKeys.length];
        return Object.assign({}, g, { user_id: uid, color: colorKey, ring: ringColors[colorKey] });
      });
      var seed = await supabase.from("goals").insert(inserts).select();
      if (!seed.error) setGoals(seed.data.map(function(g) { return Object.assign({}, g, { ring: ringColors[g.color] || "#46F0D2" }); }));
    } else if (!result.error) {
      setGoals(result.data.map(function(g) { return Object.assign({}, g, { ring: ringColors[g.color] || "#46F0D2" }); }));
    }
    setLoading(false);
  }

  async function updateProgress(id, delta) {
    var goal = goals.find(function(g) { return g.id === id; });
    if (!goal) return;
    var newP = Math.min(100, Math.max(0, goal.progress + delta));
    await supabase.from("goals").update({ progress: newP, updated_at: new Date().toISOString() }).eq("id", id);
    setGoals(goals.map(function(g) { return g.id === id ? Object.assign({}, g, { progress: newP }) : g; }));
  }

  async function addGoal() {
    if (!newGoal.name.trim() || !userId) return;
    setSaving(true);
    var colorKeys = Object.keys(ringColors);
    var colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    var data = { user_id: userId, name: newGoal.name.trim(), category: newGoal.category, deadline: newGoal.deadline, progress: 0, color: colorKey };
    var result = await supabase.from("goals").insert(data).select();
    if (!result.error) {
      setGoals([].concat(goals, [Object.assign({}, result.data[0], { ring: ringColors[colorKey] })]));
      setShowAdd(false);
      setNewGoal({ name: "", category: "Tech", deadline: "" });
    }
    setSaving(false);
  }

  async function deleteGoal(id) {
    await supabase.from("goals").delete().eq("id", id);
    setGoals(goals.filter(function(g) { return g.id !== id; }));
  }

  var avgProgress = goals.length > 0 ? Math.round(goals.reduce(function(a, g) { return a + g.progress; }, 0) / goals.length) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#46F0D2]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-[#46F0D2]" />
            <h1 className="text-3xl font-black text-white">Goals</h1>
          </div>
          <p className="text-gray-500 text-sm">Track every target on the path to AI Engineer</p>
        </div>
        <button
          onClick={function() { setShowAdd(!showAdd); }}
          className={"px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2 " + (showAdd ? "bg-white/10" : "bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] shadow-[#46F0D2]/20")}
        >
          {showAdd ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Goal</>}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <CircularProgress size={80} strokeWidth={6} progress={mounted ? avgProgress : 0} color="#46F0D2" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-gradient-gold font-display">{avgProgress}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-2">Overall Progress</div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Target size={11} /> {goals.length} total</span>
              <span className="flex items-center gap-1"><Award size={11} /> {goals.filter(function(g) { return g.progress === 100; }).length} complete</span>
              <span className="flex items-center gap-1"><TrendingUp size={11} /> {goals.filter(function(g) { return g.progress > 0 && g.progress < 100; }).length} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {goals.length > 0 && <GoalProgressChart goals={goals} mounted={showChart} />}

      {/* Add Goal Form */}
      {showAdd && (
        <div className="glass-card p-6 rounded-2xl border border-[#46F0D2]/20 animate-slide-up">
          <h2 className="text-xs font-semibold text-[#46F0D2] uppercase tracking-[0.15em] mb-4">New Goal</h2>
          <div className="space-y-3">
            <input
              value={newGoal.name}
              onChange={function(e) { setNewGoal(Object.assign({}, newGoal, { name: e.target.value })); }}
              placeholder="Goal name..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
            />
            <div className="flex gap-3">
              <select
                value={newGoal.category}
                onChange={function(e) { setNewGoal(Object.assign({}, newGoal, { category: e.target.value })); }}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm appearance-none"
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
                onChange={function(e) { setNewGoal(Object.assign({}, newGoal, { deadline: e.target.value })); }}
                placeholder="Deadline (e.g. Jun 2026)"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all"
              />
            </div>
            <button onClick={addGoal} disabled={saving} className="w-full py-3 bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] text-white font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-[#46F0D2]/20 disabled:opacity-50">
              {saving ? "Saving..." : "Add Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(function(goal) {
          var catStyle = categoryColors[goal.category] || { bg: "bg-white/10 text-gray-400 border-white/10" };
          return (
            <div key={goal.id} className="glass-card p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all group">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <CircularProgress size={56} strokeWidth={4} progress={mounted ? goal.progress : 0} color={goal.ring} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white font-display">{goal.progress}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{goal.name}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={"text-[10px] px-2 py-0.5 rounded-full border " + catStyle.bg}>{goal.category}</span>
                    {goal.deadline && (function() {
                      var days = getDaysRemaining(goal.deadline);
                      var label = deadlineLabel(days);
                      var dColor = deadlineColor(days);
                      return (
                        <span className={"text-[10px] flex items-center gap-1 font-medium " + dColor}>
                          <Clock size={9} />
                          <span>{goal.deadline}</span>
                          {label && <span className="opacity-70">({label})</span>}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={function() { updateProgress(goal.id, -10); }}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-500 rounded-lg text-xs transition-all"
                  >-10</button>
                  <button
                    onClick={function() { updateProgress(goal.id, 10); }}
                    className="px-3 py-1.5 bg-[#46F0D2]/10 hover:bg-[#46F0D2]/20 text-[#46F0D2] rounded-lg text-xs transition-all"
                  >+10</button>
                  <button
                    onClick={function() { deleteGoal(goal.id); }}
                    className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-all"
                  ><X size={12} /></button>
                </div>
              </div>
              {goal.progress === 100 && (
                <div className="mt-3 text-center text-green-400 font-semibold text-xs flex items-center justify-center gap-1.5">
                  <Award size={14} /> Goal Achieved!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
