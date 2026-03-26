// Life OS - Daily Reminder Notification System

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    var reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("SW registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  var result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): string {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// Schedule a reminder at a specific hour today (or tomorrow if time has passed)
export async function scheduleDaily(hourOfDay: number, minuteOfDay: number, title: string, body: string, url: string, tag: string) {
  var granted = await requestNotificationPermission();
  if (!granted) return false;

  var reg = await registerServiceWorker();
  if (!reg || !reg.active) {
    // Fallback: use setTimeout directly (only works while tab is open)
    var now = new Date();
    var target = new Date();
    target.setHours(hourOfDay, minuteOfDay, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    var delay = target.getTime() - now.getTime();
    setTimeout(function() {
      if (Notification.permission === "granted") {
        new Notification(title, { body: body, tag: tag, icon: "/icon-192.png" });
      }
    }, delay);
    return true;
  }

  var now2 = new Date();
  var target2 = new Date();
  target2.setHours(hourOfDay, minuteOfDay, 0, 0);
  if (target2.getTime() <= now2.getTime()) {
    target2.setDate(target2.getDate() + 1);
  }
  var delay2 = target2.getTime() - now2.getTime();

  reg.active.postMessage({
    type: "SCHEDULE_REMINDER",
    delay: delay2,
    title: title,
    body: body,
    url: url,
    tag: tag,
  });
  return true;
}

// Check if it's been too long since last activity and fire an immediate reminder
export function checkOverdueReminders(lastCheckinAt: string | null, lastHabitAt: string | null) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  var now = Date.now();
  var DAY = 24 * 60 * 60 * 1000;

  if (lastCheckinAt) {
    var checkinAge = now - new Date(lastCheckinAt).getTime();
    if (checkinAge > DAY) {
      new Notification("Life OS - Daily Check-in", {
        body: "You haven't checked in today, Dhanush. How are you feeling? Take 2 minutes to log your mood.",
        tag: "overdue-checkin",
        icon: "/icon-192.png",
      });
    }
  }

  if (lastHabitAt) {
    var habitAge = now - new Date(lastHabitAt).getTime();
    if (habitAge > DAY) {
      new Notification("Life OS - Habit Check", {
        body: "Your habits are waiting! Log today's progress and keep your streak alive.",
        tag: "overdue-habit",
        icon: "/icon-192.png",
      });
    }
  }
}
