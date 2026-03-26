"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getLevel, getXpProgress, getLevelTitle } from "../../lib/xp";
import {
  LayoutDashboard,
  Target,
  CalendarCheck,
  BookOpen,
  Flame,
  Bot,
  Timer,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

var navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/checkin", label: "Check In", icon: CalendarCheck },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/habits", label: "Habits", icon: Flame },
  { href: "/dashboard/focus", label: "Focus", icon: Timer },
  { href: "/dashboard/coach", label: "AI Coach", icon: Bot },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  var pathname = usePathname();
  var router = useRouter();
  var [collapsed, setCollapsed] = useState(false);
  var [userName, setUserName] = useState("Dhanush");
  var [userXp, setUserXp] = useState(0);
  var [userLevel, setUserLevel] = useState(1);
  var [mounted, setMounted] = useState(false);

  useEffect(function() {
    setMounted(true);
    supabase.auth.getSession().then(async function(result) {
      if (!result.data.session) {
        router.push("/");
      } else {
        var user = result.data.session.user;
        var displayName = user.user_metadata?.name || user.email?.split("@")[0] || "Dhanush";
        setUserName(displayName);

        // Load XP/level from profiles
        var profileRes = await supabase.from("profiles").select("xp, level").eq("id", user.id).single();
        if (profileRes.data) {
          setUserXp(profileRes.data.xp || 0);
          setUserLevel(profileRes.data.level || 1);
        }
      }
    });

    // Listen for profile updates (XP changes from other pages)
    var channel = supabase
      .channel("profile-xp")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, function(payload) {
        if (payload.new) {
          setUserXp(payload.new.xp || 0);
          setUserLevel(payload.new.level || 1);
        }
      })
      .subscribe();

    return function() { supabase.removeChannel(channel); };
  }, [router]);

  var xpInLevel = getXpProgress(userXp);
  var levelTitle = getLevelTitle(userLevel);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#050510] overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className={collapsed ? "w-[72px] transition-all duration-300 ease-out flex flex-col bg-[#080818]/90 backdrop-blur-2xl border-r border-white/[0.06] relative z-10" : "w-[260px] transition-all duration-300 ease-out flex flex-col bg-[#080818]/90 backdrop-blur-2xl border-r border-white/[0.06] relative z-10"}>
        {/* Logo */}
        <div className="p-4 h-16 border-b border-white/[0.06] flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse-glow">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <div className="text-base font-bold text-gradient-cyan font-display">Life OS</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Second Brain</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto animate-pulse-glow">
              <Sparkles size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={function() { setCollapsed(!collapsed); }}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* XP Bar (when expanded) */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">{userLevel}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{levelTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" />
                <span className="text-[10px] text-yellow-400 font-bold font-display">{userXp} XP</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                style={{ width: xpInLevel + "%" }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map(function(item) {
            var isActive = pathname === item.href;
            var Icon = item.icon;
            var isAchievements = item.href === "/dashboard/achievements";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group " + (
                  isActive
                    ? "bg-gradient-to-r from-purple-600/20 to-cyan-600/10 border border-purple-500/20 text-white shadow-lg shadow-purple-500/5"
                    : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  size={18}
                  className={"transition-all duration-200 " + (
                    isActive
                      ? (isAchievements ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-purple-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]")
                      : (isAchievements ? "group-hover:text-yellow-400" : "group-hover:text-purple-400 group-hover:drop-shadow-[0_0_6px_rgba(139,92,246,0.3)]")
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{userName}</div>
                <div className="text-[11px] text-gray-600">Berlin, Germany</div>
              </div>
              <button
                onClick={async function() {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
