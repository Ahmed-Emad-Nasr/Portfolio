const CACHE_PREFIX = "portfolio-cache-";
const CURRENT_CACHE = `${CACHE_PREFIX}v1`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CURRENT_CACHE).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CURRENT_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});