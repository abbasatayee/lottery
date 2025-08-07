const CACHE_NAME = "lottery-pwa-v1";
const urlsToCache = ["/", "/index.html", "/manifest.json"];

// Only cache files that exist
const cacheableUrls = urlsToCache.filter((url) => {
  // In development, skip caching to avoid issues
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1"
  ) {
    return false;
  }
  return true;
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(cacheableUrls);
      })
      .catch((error) => {
        console.log("Cache addAll failed:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch((error) => {
        console.log("Fetch failed:", error);
        // Return a fallback response for navigation requests
        if (event.request.destination === "document") {
          return caches.match("/");
        }
        return new Response("Network error", { status: 503 });
      });
    })
  );
});
