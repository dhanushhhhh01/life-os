// Life OS Service Worker - Daily Reminders
var CACHE_NAME = "life-os-v1";

self.addEventListener("install", function(event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(clients.claim());
});

// Listen for messages from the app to schedule notifications
self.addEventListener("message", function(event) {
  if (event.data && event.data.type === "SCHEDULE_REMINDER") {
    var data = event.data;
    var delay = data.delay || 0;
    if (delay > 0) {
      setTimeout(function() {
        self.registration.showNotification(data.title || "Life OS", {
          body: data.body || "Time for your daily check-in!",
          icon: "/icon-192.png",
          badge: "/icon-96.png",
          tag: data.tag || "life-os-reminder",
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: data.url || "/dashboard/checkin" }
        });
      }, delay);
    }
  }
});

// Handle notification click - open the app
self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
