"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Heart,
  MessageCircle,
  BookOpen,
  BarChart3,
  Shield,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/checkin", icon: Heart, label: "Check-in" },
  { href: "/coach", icon: MessageCircle, label: "Life Coach" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/report", icon: BarChart3, label: "Weekly Report" },
  { href: "/security", icon: Shield, label: "Security" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-glass-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-glass-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            <Sparkles className="w-5 h-5 text-accent-light" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Life OS</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Second Brain</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-accent/15 text-accent-light shadow-glow-sm"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                )}
              >
                <item.icon className={clsx("w-5 h-5", active && "text-accent-light")} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-light"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light">
            {user?.full_name?.[0] || user?.username?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 truncate">{user?.full_name || user?.username}</p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-white/30 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
