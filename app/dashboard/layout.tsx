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
  Settings,
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
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
        var profileRes = await supabase.from("profiles").select("xp, level").eq("id", user.id).single();
        if (profileRes.data) {
          setUserXp(profileRes.data.xp || 0);
          setUserLevel(profileRes.data.level || 1);
        }
      }
    });

    var channel = supabase
      .channel("profile-xp")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, function(payload) {
        if (payload.new) {
          setUserXp((payload.new as any).xp || 0);
          setUserLevel((payload.new as any).level || 1);
        }
      })
      .subscribe();

    return function() { supabase.removeChannel(channel); };
  }, [router]);

  var xpInLevel = getXpProgress(userXp);
  var levelTitle = getLevelTitle(userLevel);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#030308] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-600/[0.05] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-700/[0.03] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <aside className={collapsed ? "w-[72px] transition-all duration-300 ease-out flex flex-col bg-[#07070e]/95 backdrop-blur-2xl border-r border-white/[0.05] relative z-10" : "w-[260px] transition-all duration-300 ease-out flex flex-col bg-[#07070e]/95 backdrop-blur-2xl border-r border-white/[0.05] relative z-10"}>

        <div className="p-4 h-16 border-b border-white/[0.05] flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-400 flex items-center justify-center animate-pulse-gold shadow-lg shadow-amber-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <div className="text-base font-bold text-gradient-gold font-display">Life OS</div>
                <div className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">Second Brain</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-400 flex items-center justify-center mx-auto animate-pulse-gold shadow-lg shadow-amber-500/20">
              <Sparkles size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={function() { setCollapsed(!collapsed); }}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-gray-600 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-400 flex items-center justify-center shadow-sm shadow-amber-400/20">
                  <span className="text-[9px] font-black text-white">{userLevel}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{levelTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                <span className="text-[10px] text-amber-400 font-bold font-display">{userXp} XP</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                style={{ width: xpInLevel + "%" }}
              />
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map(function(item) {
            var isActive = pathname === item.href;
            var Icon = item.icon;
            var isAchievements = item.href === "/dashboard/achievements";
            var isSettings = item.href === "/dashboard/settings";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group " + (
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/25 to-amber-500/10 border border-indigo-500/25 text-white shadow-lg shadow-indigo-500/10"
                    : "text-gray-600 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  size={17}
                  className={"transition-all duration-200 " + (
                    isActive
                      ? (isAchievements ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : isSettings ? "text-gray-300" : "text-indigo-400 drop-shadow-[0_0_8px_rgba(79,70,229,0.6)]")
                      : (isAchievements ? "group-hover:text-amber-400" : isSettings ? "group-hover:text-gray-300" : "group-hover:text-indigo-400")
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span className={"ml-auto w-1.5 h-1.5 rounded-full " + (isAchievements ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.6)]")} />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-400 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-amber-400/15">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{userName}</div>
                <div className="text-[11px] text-gray-700">Berlin, Germany</div>
              </div>
              <button
                onClick={async function() {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
