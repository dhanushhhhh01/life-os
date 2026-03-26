"use client";
import { useState, useEffect } from "react";
import { Settings, Palette, User, Bell, Shield, ChevronRight, Check, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabase";

var THEMES = [
  {
    key: "quantum",
    name: "Quantum Gold",
    desc: "Deep indigo meets molten gold",
    from: "#4f46e5",
    to: "#f59e0b",
    preview: ["#4f46e5", "#6366f1", "#f59e0b"],
  },
  {
    key: "aurora",
    name: "Aurora",
    desc: "Electric cyan meets rose",
    from: "#06b6d4",
    to: "#f43f5e",
    preview: ["#06b6d4", "#22d3ee", "#f43f5e"],
  },
  {
    key: "emerald",
    name: "Matrix",
    desc: "Deep green neural network",
    from: "#10b981",
    to: "#6366f1",
    preview: ["#10b981", "#34d399", "#6366f1"],
  },
  {
    key: "volcano",
    name: "Volcano",
    desc: "Intense orange lava energy",
    from: "#f97316",
    to: "#dc2626",
    preview: ["#f97316", "#fb923c", "#dc2626"],
  },
  {
    key: "nebula",
    name: "Nebula",
    desc: "Cosmic violet and pink",
    from: "#7c3aed",
    to: "#ec4899",
    preview: ["#7c3aed", "#a78bfa", "#ec4899"],
  },
];

export default function SettingsPage() {
  var [mounted, setMounted] = useState(false);
  var [activeTheme, setActiveTheme] = useState("quantum");
  var [userName, setUserName] = useState("Dhanush");
  var [userEmail, setUserEmail] = useState("");
  var [saved, setSaved] = useState(false);
  var [section, setSection] = useState("appearance");

  useEffect(function() {
    setMounted(true);
    var saved = typeof window !== "undefined" ? localStorage.getItem("life-os-theme") || "quantum" : "quantum";
    setActiveTheme(saved);
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        var user = result.data.session.user;
        setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Dhanush");
        setUserEmail(user.email || "");
      }
    });
  }, []);

  function selectTheme(key) {
    setActiveTheme(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("life-os-theme", key);
    }
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
  }

  var currentTheme = THEMES.find(function(t) { return t.key === activeTheme; }) || THEMES[0];

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 stagger-children">
      {/* Save toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 text-white text-sm font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Check size={15} /> Theme saved!
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <Settings size={18} className="text-amber-400" />
        <h1 className="text-3xl font-black text-white">Settings</h1>
      </div>
      <p className="text-gray-500 text-sm -mt-4">Customize your Life OS experience</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <div className="glass-card rounded-2xl p-3 border border-white/[0.06] h-fit space-y-0.5">
          {[
            { key: "appearance", label: "Appearance", icon: Palette },
            { key: "profile", label: "Profile", icon: User },
            { key: "notifications", label: "Notifications", icon: Bell },
            { key: "privacy", label: "Privacy", icon: Shield },
          ].map(function(item) {
            var Icon = item.icon;
            var isActive = section === item.key;
            return (
              <button
                key={item.key}
                onClick={function() { setSection(item.key); }}
                className={"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all " + (isActive ? "bg-indigo-600/20 border border-indigo-500/25 text-white" : "text-gray-500 hover:text-white hover:bg-white/[0.04]")}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? "text-indigo-400" : ""} />
                  {item.label}
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {section === "appearance" && (
            <>
              {/* Active theme banner */}
              <div
                className="glass-card p-5 rounded-2xl border overflow-hidden relative"
                style={{ borderColor: currentTheme.from + "40" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-20"
                  style={{ background: "radial-gradient(" + currentTheme.to + ", " + currentTheme.from + ")" }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg," + currentTheme.from + "," + currentTheme.to + ")" }}>
                      <Sparkles size={15} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{currentTheme.name}</div>
                      <div className="text-xs text-gray-500">Active Theme</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme grid */}
              <div className="glass-card p-5 rounded-2xl border border-white/[0.06]">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] mb-4">Color Themes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEMES.map(function(theme) {
                    var isActive = activeTheme === theme.key;
                    return (
                      <button
                        key={theme.key}
                        onClick={function() { selectTheme(theme.key); }}
                        className={"relative p-4 rounded-xl border text-left transition-all duration-200 group " + (isActive ? "bg-white/[0.04]" : "bg-white/[0.02] hover:bg-white/[0.03]")}
                        style={{
                          borderColor: isActive ? theme.from + "50" : "rgba(255,255,255,0.06)",
                          boxShadow: isActive ? "0 0 20px " + theme.from + "20, 0 4px 12px rgba(0,0,0,0.3)" : "none",
                        }}
                      >
                        {/* Gradient preview bar */}
                        <div className="h-2 rounded-full mb-3 w-full"
                          style={{ background: "linear-gradient(to right, " + theme.preview.join(",") + ")" }} />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-white">{theme.name}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{theme.desc}</div>
                          </div>
                          {isActive && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "linear-gradient(135deg," + theme.from + "," + theme.to + ")" }}>
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note about themes */}
              <div className="text-xs text-gray-600 text-center py-1">
                Theme colors apply to gradients, XP bars, and accent elements. Refresh to see full effect.
              </div>
            </>
          )}

          {section === "profile" && (
            <div className="glass-card p-5 rounded-2xl border border-white/[0.06] space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Profile Info</h3>
              <div className="flex items-center gap-4 pb-4 border-b border-white/[0.05]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-400/15">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-bold">{userName}</div>
                  <div className="text-sm text-gray-500">{userEmail}</div>
                  <div className="text-xs text-gray-700 mt-1">Berlin, Germany - SRH University</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-500 uppercase tracking-[0.15em] mb-1.5 block">Display Name</label>
                  <input type="text" defaultValue={userName} disabled
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 text-gray-400 text-sm opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 uppercase tracking-[0.15em] mb-1.5 block">Email</label>
                  <input type="email" defaultValue={userEmail} disabled
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 text-gray-400 text-sm opacity-60 cursor-not-allowed" />
                </div>
                <p className="text-xs text-gray-700">Profile editing coming soon.</p>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="glass-card p-5 rounded-2xl border border-white/[0.06] space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Notifications</h3>
              {[
                { label: "Daily check-in reminder", desc: "Remind me to check in each morning", enabled: true },
                { label: "Habit streak alerts", desc: "Alert when a streak is at risk", enabled: true },
                { label: "Weekly report", desc: "Summary every Sunday evening", enabled: false },
                { label: "XP milestones", desc: "Celebrate level-ups and achievements", enabled: true },
              ].map(function(item, i) {
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <div>
                      <div className="text-sm text-white font-medium">{item.label}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{item.desc}</div>
                    </div>
                    <div className={"w-11 h-6 rounded-full border transition-all cursor-pointer flex items-center px-0.5 " + (item.enabled ? "bg-indigo-600/40 border-indigo-500/40" : "bg-white/[0.05] border-white/[0.1]")}>
                      <div className={"w-5 h-5 rounded-full transition-all shadow-sm " + (item.enabled ? "translate-x-5 bg-gradient-to-br from-indigo-400 to-amber-400" : "translate-x-0 bg-gray-600")} />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-700">Push notification integration coming in Phase 4.</p>
            </div>
          )}

          {section === "privacy" && (
            <div className="glass-card p-5 rounded-2xl border border-white/[0.06] space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Privacy & Security</h3>
              <div className="p-4 rounded-xl bg-green-500/[0.06] border border-green-500/20">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <Shield size={15} />
                  Your data is protected
                </div>
                <p className="text-xs text-gray-600 mt-1.5">All data is stored in your private Supabase instance with Row Level Security (RLS) enabled. Nobody else can access your data.</p>
              </div>
              {[
                { label: "Data encrypted at rest", status: true },
                { label: "Row Level Security active", status: true },
                { label: "No third-party analytics", status: true },
                { label: "Private data export", status: false },
              ].map(function(item, i) {
                return (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-400">{item.label}</span>
                    <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + (item.status ? "text-green-400 bg-green-500/10" : "text-gray-500 bg-white/[0.05]")}>
                      {item.status ? "Active" : "Soon"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
