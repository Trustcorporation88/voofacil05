self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("voofacil-static-v2").then((cache) => {
      return cache.addAll(["/", "/manifest.webmanifest", "/logo-voofacil.png", "/favicon.png"]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== "voofacil-static-v1")
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // App-shell style fallback for navigation requests.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open("voofacil-static-v2").then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Novo alerta de preço!",
    icon: "/icons/icon-192.png",
    badge: "/favicon.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    tag: data.tag || "price-alert",
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title || "Voofacil", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});




