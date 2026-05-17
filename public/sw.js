const CACHE_PREFIX = "portfolio-cache-";
const CURRENT_CACHE = `${CACHE_PREFIX}v2`;
const RUNTIME_ASSET_CACHE = `${CACHE_PREFIX}runtime-v2`;

const STATIC_EXTENSIONS = /\.(?:css|js|mjs|webp|png|jpg|jpeg|gif|svg|ico|pdf|woff2?)$/i;

const isCacheableAsset = (url) => {
  const pathname = url.pathname || "";

  if (STATIC_EXTENSIONS.test(pathname)) return true;
  if (pathname.includes("/Assets/")) return true;

  return false;
};

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!isCacheableAsset(url)) return;

  event.respondWith(
    caches.open(RUNTIME_ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // If network fails and we have no cache hit, rethrow.
        throw error;
      }
    })
  );
});