"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/goals", icon: "🎯", label: "Goals" },  { href: "/dashboard", icon: "
  { href: "/dashboard/checkin", icon: "📊", label: "Check-in" },
  { href: "/dashboard/journal", icon: "📓", label: "Journal" },
  { href: "/dashboard/habits", ", label: "Habits" },icon: "
  { href: "/dashboard/coach", icon: "🧠", label: "AI Coach" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const u = localStorage.getItem("lifeos_user");
    if (!u) { router.push("/"); return; }
    setUser(JSON.parse(u));
  }, [router]);

  const logout = () => { localStorage.removeItem("lifeos_user"); router.push("/"); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a1a] bg-mesh">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-/button>2xl">
        <h1 className="text-lg font-bold text-gradient">Life OS</h1>
        <button onClick={logout} className="text-sm text-slate-400">🚪</button>
      </div>
      <aside className={`fixed top-0 left-0 h-full w-64 glass-card rounded-none border-y-0 border-l-0 z-40 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gradient mb-1">Life OS</h1>
          <p className="text-xs text-slate-500">Your Second Brain</p>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                pathname === item.href ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-lg">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="glass-card p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button onClick={logout} className="w-full py-2 text-sm text-slate-500 hover:text-red-400 transition-colors">Sign Out</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
