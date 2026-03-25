"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", abbr: "HM" },
  { href: "/dashboard/goals", label: "Goals", abbr: "GL" },
  { href: "/dashboard/checkin", label: "Check In", abbr: "CI" },
  { href: "/dashboard/journal", label: "Journal", abbr: "JN" },
  { href: "/dashboard/habits", label: "Habits", abbr: "HB" },
  { href: "/dashboard/coach", label: "AI Coach", abbr: "DX" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <aside className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 flex flex-col bg-gray-900/80 backdrop-blur-xl border-r border-white/10`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <div>
              <div className="text-xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Life OS</div>
              <div className="text-xs text-gray-500">Second Brain</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-bold"
          >
            {collapsed ? ">>" : "<<"}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/30 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`text-xs font-black w-6 text-center ${isActive ? "text-purple-400" : "group-hover:text-purple-400"}`}>
                  {item.abbr}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                D
              </div>
              <div>
                <div className="text-xs font-medium text-white">Dhanush</div>
                <div className="text-xs text-gray-500">Berlin, DE</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
