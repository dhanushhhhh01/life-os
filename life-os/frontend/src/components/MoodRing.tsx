"use client";

import { motion } from "framer-motion";

/**
 * Mood Ring — a glowing circle that shifts color based on mood & energy.
 * mood & energy: 1–10 scale.
 */

function getMoodColor(mood: number): string {
  if (mood <= 2) return "#ef4444"; // red
  if (mood <= 3) return "#f97316"; // orange
  if (mood <= 4) return "#eab308"; // yellow
  if (mood <= 5) return "#a3e635"; // lime
  if (mood <= 6) return "#22c55e"; // green
  if (mood <= 7) return "#06b6d4"; // cyan
  if (mood <= 8) return "#8b5cf6"; // violet
  if (mood <= 9) return "#a78bfa"; // light purple
  return "#ec4899"; // pink — peak
}

function getEnergyIntensity(energy: number): number {
  return 0.2 + (energy / 10) * 0.6; // 0.2 to 0.8 opacity
}

export function MoodRing({
  mood,
  energy,
  size = 180,
  label,
}: {
  mood: number;
  energy: number;
  size?: number;
  label?: string;
}) {
  const color = getMoodColor(mood);
  const intensity = getEnergyIntensity(energy);
  const pulseSpeed = 4 - (energy / 10) * 2; // higher energy = faster pulse

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: size, height: size }}
        animate={{
          boxShadow: [
            `0 0 ${20 + energy * 3}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`,
            `0 0 ${40 + energy * 5}px ${color}${Math.round(intensity * 0.7 * 255).toString(16).padStart(2, "0")}`,
            `0 0 ${20 + energy * 3}px ${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`,
          ],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${color}`,
            opacity: intensity,
          }}
        />
        {/* Inner gradient */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          }}
        />
        {/* Center content */}
        <div className="relative z-10 text-center">
          <div className="text-3xl font-bold text-white">{mood}</div>
          <div className="text-xs text-white/50 uppercase tracking-wider mt-1">mood</div>
        </div>
      </motion.div>
      {label && (
        <p className="text-sm text-white/40">{label}</p>
      )}
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <span className="text-white/30 text-xs uppercase tracking-wider">Energy</span>
          <div className="text-white font-semibold">{energy}/10</div>
        </div>
        <div className="text-center">
          <span className="text-white/30 text-xs uppercase tracking-wider">Mood</span>
          <div className="text-white font-semibold">{mood}/10</div>
        </div>
      </div>
    </div>
  );
}

/** Mini mood ring for lists/cards */
export function MoodDot({ mood, size = 12 }: { mood: number; size?: number }) {
  const color = getMoodColor(mood);
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}66`,
      }}
    />
  );
}
