"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { BADGES, getLevel, getXpProgress, getLevelTitle } from "../../../lib/xp";
import { Trophy, Star, Lock, Zap, ChevronUp } from "lucide-react";

export default function AchievementsPage() {
  var router = useRouter();
  var [userId, setUserId] = useState("");
  var [xp, setXp] = useState(0);
  var [level, setLevel] = useState(1);
  var [unlockedBadges, setUnlockedBadges] = useState([]);
  var [loading, setLoading] = useState(true);
  var [stats, setStats] = useState({ checkins: 0, journals: 0, maxStreak: 0, focusMinutes: 0, goalsCompleted: 0 });

  useEffect(function() {
    supabase.auth.getSession().then(async function(res) {
      if (!res.data.session) { router.push("/"); return; }
      var uid = res.data.session.user.id;
      setUserId(uid);

      // Load profile XP/badges
      var profileRes = await supabase.from("profiles").select("xp, level, badges, total_focus_minutes").eq("id", uid).single();
      if (profileRes.data) {
        setXp(profileRes.data.xp || 0);
        setLevel(profileRes.data.level || 1);
        setUnlockedBadges(profileRes.data.badges || []);
      }

      // Load stats for progress display
      var [checkinsRes, journalsRes, habitsRes, goalsRes] = await Promise.all([
        supabase.from("checkins").select("id", { count: "exact" }).eq("user_id", uid),
        supabase.from("journal_entries").select("id", { count: "exact" }).eq("user_id", uid),
        supabase.from("habits").select("streak").eq("user_id", uid),
        supabase.from("goals").select("progress").eq("user_id", uid),
      ]);

      var maxStreak = 0;
      (habitsRes.data || []).forEach(function(h) { if (h.streak > maxStreak) maxStreak = h.streak; });

      var goalsCompleted = 0;
      (goalsRes.data || []).forEach(function(g) { if (g.progress >= 100) goalsCompleted++; });

      setStats({
        checkins: checkinsRes.count || 0,
        journals: journalsRes.count || 0,
        maxStreak: maxStreak,
        focusMinutes: profileRes.data?.total_focus_minutes || 0,
        goalsCompleted: goalsCompleted,
      });

      setLoading(false);
    });
  }, [router]);

  var xpInLevel = getXpProgress(xp);
  var levelTitle = getLevelTitle(level);
  var totalBadges = BADGES.length;
  var unlockedCount = unlockedBadges.length;

  function getBadgeProgress(badgeId) {
    switch (badgeId) {
      case "first_checkin": return { current: Math.min(stats.checkins, 1), max: 1 };
      case "checkin_7": return { current: Math.min(stats.checkins, 7), max: 7 };
      case "checkin_30": return { current: Math.min(stats.checkins, 30), max: 30 };
      case "first_journal": return { current: Math.min(stats.journals, 1), max: 1 };
      case "journal_10": return { current: Math.min(stats.journals, 10), max: 10 };
      case "journal_30": return { current: Math.min(stats.journals, 30), max: 30 };
      case "habit_7": return { current: Math.min(stats.maxStreak, 7), max: 7 };
      case "habit_30": return { current: Math.min(stats.maxStreak, 30), max: 30 };
      case "first_focus": return { current: Math.min(stats.focusMinutes, 25), max: 25 };
      case "focus_10h": return { current: Math.min(stats.focusMinutes, 600), max: 600 };
      case "goal_50": return { current: 0, max: 1 };
      case "goal_100": return { current: Math.min(stats.goalsCompleted, 1), max: 1 };
      case "level_5": return { current: Math.min(level, 5), max: 5 };
      case "level_10": return { current: Math.min(level, 10), max: 10 };
      case "early_bird": return { current: 0, max: 1 };
      case "night_owl": return { current: 0, max: 1 };
      default: return { current: 0, max: 1 };
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-[#46F0D2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-full">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
          <Trophy size={14} className="text-yellow-400" />
          <span>Your achievements</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-white">
          Achievements <span className="text-gradient-gold font-display">& XP</span>
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">Level up your life — unlock badges and earn XP</p>
      </div>

      {/* XP / Level card */}
      <div className="glass-card p-6 rounded-2xl border border-[#46F0D2]/20 bg-[#46F0D2]/[0.03] animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            {/* Level badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#46F0D2] to-[#FBE2B4] flex items-center justify-center shadow-lg shadow-[#46F0D2]/20">
                <span className="text-3xl font-black text-white font-display">{level}</span>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <ChevronUp size={14} className="text-white" />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-0.5">Level {level}</div>
              <div className="text-2xl font-black text-white">{levelTitle}</div>
              <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Zap size={12} className="text-yellow-400" />
                <span className="text-yellow-400 font-bold font-display">{xp}</span>
                <span>total XP</span>
              </div>
            </div>
          </div>

          {/* XP progress */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress to Level {level + 1}</span>
              <span className="font-display text-[#46F0D2]">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(70,240,210,0.5)]"
                style={{ width: xpInLevel + "%" }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {100 - xpInLevel} XP until next level
            </div>
          </div>
        </div>

        {/* XP earning guide */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { action: "Check-in", xp: "+20 XP", color: "text-green-400" },
            { action: "Habit done", xp: "+10 XP", color: "text-orange-400" },
            { action: "Journal entry", xp: "+30 XP", color: "text-[#46F0D2]" },
            { action: "Focus session", xp: "+25 XP", color: "text-[#FBE2B4]" },
          ].map(function(item) {
            return (
              <div key={item.action} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className={"text-lg font-black font-display " + item.color}>{item.xp}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.action}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge progress summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star size={18} className="text-yellow-400" />
          Badges
          <span className="text-sm font-normal text-gray-500 ml-1">
            {unlockedCount}/{totalBadges} unlocked
          </span>
        </h2>
        <div className="h-1.5 w-32 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
            style={{ width: ((unlockedCount / totalBadges) * 100) + "%" }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map(function(badge) {
          var isUnlocked = unlockedBadges.includes(badge.id);
          var prog = getBadgeProgress(badge.id);
          var progressPct = prog.max > 0 ? Math.round((prog.current / prog.max) * 100) : 0;

          return (
            <div
              key={badge.id}
              className={"p-4 rounded-2xl border transition-all duration-300 " + (
                isUnlocked
                  ? "border-white/10 bg-white/[0.04] shadow-lg"
                  : "border-white/[0.04] bg-white/[0.02]"
              )}
            >
              {/* Icon */}
              <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 " + (
                isUnlocked
                  ? "bg-gradient-to-br " + badge.color + " shadow-lg"
                  : "bg-white/[0.04]"
              )}>
                {isUnlocked ? badge.icon : <Lock size={18} className="text-gray-600" />}
              </div>

              {/* Info */}
              <div className={"text-sm font-bold mb-0.5 " + (isUnlocked ? "text-white" : "text-gray-600")}>{badge.name}</div>
              <div className="text-xs text-gray-600 mb-3 leading-relaxed">{badge.description}</div>

              {/* XP reward */}
              {badge.xp > 0 && (
                <div className={"text-xs font-bold mb-2 " + (isUnlocked ? "text-yellow-400" : "text-gray-700")}>
                  +{badge.xp} XP
                </div>
              )}

              {/* Progress bar for locked badges */}
              {!isUnlocked && prog.max > 1 && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-700 mb-1">
                    <span>{prog.current}/{prog.max}</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={"h-full rounded-full bg-gradient-to-r " + badge.color}
                      style={{ width: progressPct + "%", opacity: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {isUnlocked && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                  <span className="text-[10px] text-green-400">Unlocked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
