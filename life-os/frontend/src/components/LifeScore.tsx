"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

function getScoreColor(score: number): string {
  if (score < 25) return "#ef4444";
  if (score < 40) return "#f97316";
  if (score < 55) return "#eab308";
  if (score < 70) return "#22c55e";
  if (score < 85) return "#06b6d4";
  return "#8b5cf6";
}

function getScoreLabel(score: number): string {
  if (score < 25) return "Needs Attention";
  if (score < 40) return "Getting There";
  if (score < 55) return "On Track";
  if (score < 70) return "Doing Well";
  if (score < 85) return "Thriving";
  return "Peak Performance";
}

export function LifeScoreRing({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}66)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Life Score</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

export function ScoreBreakdown({
  scores,
}: {
  scores: { mood: number; habits: number; goals: number; journal: number };
}) {
  const items = [
    { label: "Mood", value: scores.mood, color: "#ec4899", emoji: "💜" },
    { label: "Habits", value: scores.habits, color: "#f97316", emoji: "🔥" },
    { label: "Goals", value: scores.goals, color: "#3b82f6", emoji: "🎯" },
    { label: "Journal", value: scores.journal, color: "#22c55e", emoji: "✍️" },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/50">
              {item.emoji} {item.label}
            </span>
            <span className="text-xs font-medium text-white/70">{Math.round(item.value)}</span>
          </div>
          <div className="h-1.5 bg-surface-300 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.value}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreTrendChart({
  data,
}: {
  data: { date: string; total: number }[];
}) {
  if (data.length < 2) {
    return <p className="text-white/30 text-sm italic text-center">Need more data for trend</p>;
  }

  const maxScore = Math.max(...data.map((d) => d.total), 1);
  const height = 80;
  const width = data.length * 20;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.total / maxScore) * 100,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5bf5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c5bf5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#trendGrad)" />
        <path d={pathD} fill="none" stroke="#7c5bf5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* Latest point dot */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3"
            fill="#a78bfa"
            style={{ filter: "drop-shadow(0 0 4px #7c5bf5)" }}
          />
        )}
      </svg>
      <div className="flex justify-between text-[9px] text-white/20 mt-1">
        <span>{data[0].date.slice(5)}</span>
        <span>{data[data.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
}
