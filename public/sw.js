/*
 * sw.js — offline support by runtime caching (no precache list: build file
 * names change every deploy, so the worker only remembers what was fetched).
 *
 *   · Pages and RSC payloads: network-first (navigation preload), cached copy
 *     offline; a URL with a query falls back to the same page without it.
 *   · /_next/static/ (hashed names): cache-first.
 *   · Images with fixed names: stale-while-revalidate.
 *   · Link prefetches, PDFs and anything else: network only.
 *
 * Every cache is bounded (MAX_*). Bump VERSION when cached pages would be
 * stale in shape — the old caches are dropped on activate. A lazy section
 * whose chunk was never fetched online shows a "could not load" note offline.
 */

const VERSION = "v4";
const PAGE_CACHE = `3omda-pages-${VERSION}`;
const ASSET_CACHE = `3omda-assets-${VERSION}`;
const IMAGE_CACHE = `3omda-images-${VERSION}`;

/* Case screenshots alone are ~225 MB: keep the most recent N images only. */
const MAX_IMAGES = 120;
/* A home page load is ~25 hashed files; this keeps several deploys' worth,
   so a tab still open on an older build can finish loading its chunks. */
const MAX_ASSETS = 150;
/* HTML + RSC payloads of the pages a visitor has opened */
const MAX_PAGES = 60;

/* The registration scope is the site root — /Portfolio/ in production. */
const SCOPE = new URL(self.registration.scope).pathname;

const HASHED_RE = /\/_next\/static\//;
const IMAGE_RE = /\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([PAGE_CACHE, ASSET_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

const trim = async (cacheName, max) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  /* cache.keys() is in insertion order: drop the oldest */
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
};

const put = async (cacheName, request, response, max) => {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  if (max) await trim(cacheName, max);
};

/* Network-first for documents and RSC payloads; the cached copy offline. */
const networkFirst = (event, network) =>
  network
    .then((response) => {
      /* Only real pages: a cached 404 would be served offline as if it
         were the page. */
      if (response && response.ok) event.waitUntil(put(PAGE_CACHE, event.request, response.clone(), MAX_PAGES));
      return response;
    })
    .catch(async () => {
      const cached =
        (await caches.match(event.request)) ??
        (event.request.mode === "navigate" ? await caches.match(event.request, { ignoreSearch: true }) : undefined);
      if (cached) return cached;
      if (event.request.mode !== "navigate") return Response.error();
      const home = (await caches.match(SCOPE)) ?? (await caches.match(`${SCOPE}index.html`));
      return home ?? Response.error();
    });

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  /* Only this site's own scope (github.io hosts other projects too) */
  if (!url.pathname.startsWith(SCOPE)) return;

  // ── Pages: network-first, using the navigation preload response ────────
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(
        event,
        Promise.resolve(event.preloadResponse).then((preloaded) => preloaded || fetch(request)),
      ),
    );
    return;
  }

  // ── RSC payloads for in-site navigation (?_rsc=…) ──────────────────────
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") {
    /* Prefetches are not cached: they would push out pages actually visited */
    if (request.headers.has("Next-Router-Prefetch")) return;
    event.respondWith(networkFirst(event, fetch(request)));
    return;
  }

  // ── Hashed build files: cache-first (the name changes with the content) ──
  if (HASHED_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) event.waitUntil(put(ASSET_CACHE, request, response.clone(), MAX_ASSETS));
            return response;
          }),
      ),
    );
    return;
  }

  // ── Images with fixed names: stale-while-revalidate, bounded ──────────
  if (IMAGE_RE.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then(async (response) => {
            if (response.ok) {
              await cache.put(request, response.clone());
              await trim(IMAGE_CACHE, MAX_IMAGES);
            }
            return response;
          })
          .catch(() => cached ?? Response.error());
        if (cached) {
          event.waitUntil(refresh);
          return cached;
        }
        return refresh;
      }),
    );
  }
  /* Anything else (PDFs, the manifest, security.txt …) goes to the network
     untouched — fixed names, rarely needed offline, and a PDF in the cache
     would only waste the visitor's storage. */
});
