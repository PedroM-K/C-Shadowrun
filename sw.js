/**
 * SHADOWRUN: ANARCHY - SERVICE WORKER (OFFLINE PWA)
 * Caches application shell for 100% offline client-side execution.
 * Character data is kept separate in browser localStorage.
 */

const CACHE_NAME = "sr-anarchy-sheet-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon.svg",
  "./css/theme.css",
  "./css/animations.css",
  "./css/layout.css",
  "./css/components.css",
  "./js/bundle.js",
  "./js/constants.js",
  "./js/rules.js",
  "./js/dice.js",
  "./js/storage.js",
  "./js/importer-exporter.js",
  "./js/state.js",
  "./js/ui.js",
  "./js/app.js"
];

// Install event: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event: purge outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-First strategy with Network fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same origin or fonts
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache external fonts or valid assets dynamically
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.startsWith("http") || event.request.url.includes("fonts.gstatic.com"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to offline index if navigation fails
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
