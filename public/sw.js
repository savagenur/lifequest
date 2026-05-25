self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "LifeQuest", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(clients.claim());
});
