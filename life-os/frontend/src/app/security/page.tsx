"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Download, Trash2, Clock, Globe, AlertTriangle,
  Loader2, CheckCircle, X, Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";
import { GlassCard } from "@/components/GlassCard";

interface SecurityLogEntry {
  action: string;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  login: { label: "Login", color: "text-green-400", icon: "🔓" },
  register: { label: "Registration", color: "text-blue-400", icon: "✨" },
  token_refresh: { label: "Token Refresh", color: "text-white/50", icon: "🔄" },
  token_issued: { label: "Token Issued", color: "text-white/50", icon: "🎫" },
  logout: { label: "Logout", color: "text-yellow-400", icon: "👋" },
  logout_all: { label: "Logout All", color: "text-orange-400", icon: "🚪" },
  failed_login: { label: "Failed Login", color: "text-red-400", icon: "⚠️" },
  export: { label: "Data Export", color: "text-cyan-400", icon: "📦" },
  delete_account: { label: "Account Deleted", color: "text-red-500", icon: "💀" },
};

export default function SecurityPage() {
  const { loggedIn, logout } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loggedIn) { router.push("/"); return; }
    loadLogs();
  }, [loggedIn]);

  async function loadLogs() {
    setLoading(true);
    try {
      const token = localStorage.getItem("lifeos_token");
      const res = await fetch("/api/me/security-log", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const token = localStorage.getItem("lifeos_token");
      const res = await fetch("/api/me/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `life-os-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setExporting(false);
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE MY ACCOUNT") return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("lifeos_token");
      const res = await fetch("/api/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: "DELETE MY ACCOUNT" }),
      });
      if (res.ok) {
        logout();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  }

  if (!loggedIn) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-64 p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-light" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Security & Privacy</h1>
              <p className="text-white/40 mt-0.5">Your data, your control</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* ── Data Controls ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <GlassCard delay={0.1}>
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Export My Data</h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Download all your data as a JSON file — goals, check-ins, journal entries, habits, and more.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full py-3 rounded-xl bg-cyan-500/10 text-cyan-300 font-medium flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : exported ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export All Data
                  </>
                )}
              </button>
            </GlassCard>

            {/* Delete Account */}
            <GlassCard delay={0.15}>
              <div className="flex items-center gap-3 mb-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Delete Account</h2>
              </div>
              <p className="text-sm text-white/40 mb-4">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
                Delete My Account
              </button>
            </GlassCard>
          </div>

          {/* ── Encryption Info ── */}
          <GlassCard delay={0.2}>
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Data Protection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "AES-256 Encryption", desc: "Journal entries, notes, and descriptions are encrypted at rest", icon: "🔐" },
                { title: "JWT + Refresh Tokens", desc: "15-min access tokens with 7-day refresh rotation", icon: "🎫" },
                { title: "Row-Level Isolation", desc: "Every query is scoped to your user — no data leaks", icon: "🛡️" },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-surface-300/30">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-sm font-medium text-white mt-2">{item.title}</h3>
                  <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ── Security Audit Log ── */}
          <GlassCard delay={0.25}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent-light" />
                <h2 className="text-lg font-semibold text-white">Security Log</h2>
              </div>
              <span className="text-xs text-white/30">{logs.length} events</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent-light animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-white/30 text-sm italic text-center py-8">No security events recorded yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-glass-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-glass-border bg-surface-300/30">
                      <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider">Event</th>
                      <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider">IP Address</th>
                      <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider">Details</th>
                      <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => {
                      const meta = ACTION_LABELS[log.action] || { label: log.action, color: "text-white/50", icon: "📝" };
                      return (
                        <tr key={i} className="border-b border-glass-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <span className={`flex items-center gap-2 ${meta.color}`}>
                              <span>{meta.icon}</span>
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5 text-white/40">
                              <Globe className="w-3 h-3" />
                              {log.ip_address || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white/30 max-w-[200px] truncate">
                            {log.details || "—"}
                          </td>
                          <td className="py-3 px-4 text-white/30 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString(undefined, {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        {/* ── Delete Confirmation Modal ── */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-red-500/20 bg-surface-100 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Delete Account</h2>
                  </div>
                  <button onClick={() => setShowDeleteModal(false)} className="text-white/30 hover:text-white/60">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-white/60 mb-3">
                    This will <span className="text-red-400 font-semibold">permanently delete</span> everything:
                  </p>
                  <ul className="space-y-1 text-sm text-white/40 ml-4">
                    <li>• All goals and progress</li>
                    <li>• All mood check-ins</li>
                    <li>• All journal entries</li>
                    <li>• All habits and streaks</li>
                    <li>• All weekly reports</li>
                    <li>• Your account and profile</li>
                  </ul>
                  <p className="text-sm text-red-400/80 mt-3 font-medium">This action cannot be undone.</p>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">
                    Type DELETE MY ACCOUNT to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-red-500/20 text-white placeholder:text-white/15 focus:outline-none focus:border-red-500/50 text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-xl bg-surface-300/50 text-white/60 font-medium hover:text-white/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirm !== "DELETE MY ACCOUNT" || deleting}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Forever
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
