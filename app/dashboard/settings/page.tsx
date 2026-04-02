"use client";
import { useState, useEffect } from "react";
import { Settings, Palette, User, Bell, Shield, ChevronRight, Check, Sparkles, BellRing, BellOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { requestNotificationPermission, registerServiceWorker, scheduleDaily, getNotificationPermission } from "../../../lib/notifications";

import { useTheme } from "../../../lib/ThemeProvider";

var THEMES = [
  {
    key: "midnight",
    name: "Midnight Flow",
    desc: "Deep space purple with a crisp teal glow.",
    from: "var(--app-primary)",
    to: "var(--app-secondary)",
    preview: ["var(--app-primary)", "var(--app-primary)", "var(--app-secondary)"],
  },
  {
    key: "cyberpunk",
    name: "Cyberpunk Edge",
    desc: "Neon yellow and hot pink on dark grey glass.",
    from: "#FBFB25",
    to: "#FF0066",
    preview: ["#FBFB25", "#FBFB25", "#FF0066"],
  },
  {
    key: "synthwave",
    name: "Outrun Synth",
    desc: "Deep violet drives into a retro cyber sunset.",
    from: "#F97316",
    to: "#06B6D4",
    preview: ["#F97316", "#F97316", "#06B6D4"],
  },
];

export default function SettingsPage() {
  var { theme: activeTheme, setTheme: selectTheme } = useTheme();
  var [mounted, setMounted] = useState(false);
  var [userName, setUserName] = useState("Dhanush");
  var [userEmail, setUserEmail] = useState("");
  var [saved, setSaved] = useState(false);
  var [section, setSection] = useState("appearance");
  var [notifPermission, setNotifPermission] = useState("default");
  var [notifToggles, setNotifToggles] = useState({
    checkin: true,
    habits: true,
    weekly: false,
    xp: true,
  });
  var [notifSaved, setNotifSaved] = useState(false);
  var [notifError, setNotifError] = useState("");

  useEffect(function() {
    setMounted(true);
    // Load saved notification toggles
    if (typeof window !== "undefined") {
      try {
        var savedNotifications = localStorage.getItem("life-os-notif-toggles");
        if (savedNotifications) setNotifToggles(JSON.parse(savedNotifications));
      } catch (e) {}
      setNotifPermission(getNotificationPermission());
    }
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        var user = result.data.session.user;
        setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Dhanush");
        setUserEmail(user.email || "");
      }
    });
    registerServiceWorker();
  }, []);

  function handleThemeSelect(key: string) {
    selectTheme(key as any);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
  }

  function toggleNotif(key) {
    var next = Object.assign({}, notifToggles, { [key]: !notifToggles[key] });
    setNotifToggles(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("life-os-notif-toggles", JSON.stringify(next));
    }
  }

  async function enableNotifications() {
    setNotifError("");
    var granted = await requestNotificationPermission();
    if (granted) {
      setNotifPermission("granted");
      // Schedule daily reminders
      if (notifToggles.checkin) {
        await scheduleDaily(9, 0, "Dex - Daily Check-in", "Good morning Dhanush! How are you feeling today?", "/dashboard/checkin", "checkin-reminder");
      }
      if (notifToggles.habits) {
        await scheduleDaily(20, 0, "Dex - Habit Tracker", "Don't forget your habits today! Keep that streak alive.", "/dashboard/habits", "habit-reminder");
      }
      if (notifToggles.weekly) {
        await scheduleDaily(18, 0, "Dex - Weekly Report", "Your weekly progress report is ready. Check your grades!", "/dashboard", "weekly-reminder");
      }
      setNotifSaved(true);
      setTimeout(function() { setNotifSaved(false); }, 3000);
    } else {
      setNotifError("Notifications blocked. Please allow notifications in your browser settings, then reload.");
    }
  }

  async function saveNotifications() {
    if (notifPermission !== "granted") {
      await enableNotifications();
      return;
    }
    if (notifToggles.checkin) {
      await scheduleDaily(9, 0, "Dex - Daily Check-in", "Good morning Dhanush! Time for your daily check-in.", "/dashboard/checkin", "checkin-reminder");
    }
    if (notifToggles.habits) {
      await scheduleDaily(20, 0, "Dex - Habit Tracker", "Evening check: how many habits did you crush today?", "/dashboard/habits", "habit-reminder");
    }
    setNotifSaved(true);
    setTimeout(function() { setNotifSaved(false); }, 3000);
  }

  var currentTheme = THEMES.find(function(t) { return t.key === activeTheme; }) || THEMES[0];

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 stagger-children">
      {/* Save toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-theme-primary to-theme-secondary text-theme-bg text-sm font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <Check size={15} /> Theme saved!
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <Settings size={18} className="text-theme-secondary" />
        <h1 className="text-3xl font-black text-theme-text">Settings</h1>
      </div>
      <p className="text-theme-textMuted text-sm -mt-4">Customize your Dex experience</p>

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
                className={"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all " + (isActive ? "bg-theme-primary/20 border border-theme-primary/25 text-theme-text" : "text-theme-textMuted hover:text-theme-text hover:bg-white/[0.04]")}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? "text-theme-primary" : ""} />
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
                        onClick={function() { handleThemeSelect(theme.key); }}
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
            <div className="glass-card p-5 rounded-2xl border border-theme-glassBorder space-y-4">
              <h3 className="text-xs font-semibold text-theme-textMuted uppercase tracking-[0.15em]">Profile Info</h3>
              <div className="flex items-center gap-4 pb-4 border-b border-theme-glassBorder">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-secondary flex items-center justify-center text-theme-bg text-2xl font-black shadow-lg">
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
            <div className="space-y-4">
              {notifSaved && (
                <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm flex items-center gap-2">
                  <BellRing size={15} /> Reminders scheduled! Dex will remind you at the right time.
                </div>
              )}
              {notifError && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                  {notifError}
                </div>
              )}

              {/* Permission status banner */}
              <div className={"glass-card p-4 rounded-2xl border flex items-center justify-between " + (notifPermission === "granted" ? "border-green-500/20 bg-green-500/[0.04]" : "border-theme-primary/20 bg-theme-primary/[0.03]")}>
                <div className="flex items-center gap-3">
                  {notifPermission === "granted" ? <BellRing size={18} className="text-green-400" /> : <BellOff size={18} className="text-theme-textMuted" />}
                  <div>
                    <div className={"text-sm font-semibold " + (notifPermission === "granted" ? "text-green-400" : "text-gray-300")}>
                      {notifPermission === "granted" ? "Notifications enabled" : notifPermission === "denied" ? "Notifications blocked" : "Notifications off"}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {notifPermission === "granted" ? "Dex will remind you at the right moments." : notifPermission === "denied" ? "Allow in browser settings to enable reminders." : "Enable to get daily reminders from Dex."}
                    </div>
                  </div>
                </div>
                {notifPermission !== "granted" && notifPermission !== "denied" && (
                  <button onClick={enableNotifications}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-theme-primary to-theme-secondary text-theme-bg text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95 filter brightness-110">
                    Enable
                  </button>
                )}
              </div>

              {/* Toggles */}
              <div className="glass-card p-5 rounded-2xl border border-theme-glassBorder space-y-1">
                <h3 className="text-xs font-semibold text-theme-textMuted uppercase tracking-[0.15em] mb-3">Reminder Types</h3>
                {[
                  { key: "checkin", label: "Daily check-in (9:00 AM)", desc: "Morning nudge to log your mood and energy" },
                  { key: "habits", label: "Habit reminder (8:00 PM)", desc: "Evening check to track today's habits" },
                  { key: "weekly", label: "Weekly report (Sunday 6 PM)", desc: "Review your weekly grades and progress" },
                  { key: "xp", label: "XP milestones", desc: "Celebrate level-ups and badge unlocks" },
                ].map(function(item) {
                  var isOn = notifToggles[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <div className="text-sm text-theme-text font-medium">{item.label}</div>
                        <div className="text-xs text-theme-textMuted mt-0.5">{item.desc}</div>
                      </div>
                      <button onClick={function() { toggleNotif(item.key); }}
                        className={"w-11 h-6 rounded-full border transition-all flex items-center px-0.5 " + (isOn ? "bg-theme-primary/30 border-theme-primary/40" : "bg-white/[0.05] border-white/[0.1]")}>
                        <div className={"w-5 h-5 rounded-full transition-all shadow-sm " + (isOn ? "translate-x-5 bg-gradient-to-br from-theme-primary to-theme-secondary" : "translate-x-0 bg-gray-600")} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Save */}
              {notifPermission === "granted" && (
                <button onClick={saveNotifications}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-primary to-theme-secondary text-theme-bg font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl filter brightness-110">
                  Save Notification Schedule
                </button>
              )}
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
