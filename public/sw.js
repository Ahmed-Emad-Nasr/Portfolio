/*
 * sw.js — offline support by runtime caching (no precache list: build file
 * names change every deploy, so the worker only remembers what was fetched).
 *
 *   · Pages (HTML) and RSC payloads: network-first (navigation preload),
 *     separated into distinct caches so ignoreSearch on document navigation
 *     never serves an RSC payload as a page.
 *   · /_next/static/ (hashed names): cache-first.
 *   · Images with fixed names: stale-while-revalidate.
 *   · Link prefetches, PDFs and anything else: network only.
 *
 * Every cache is bounded (MAX_*) using true LRU order (delete before put).
 */

const VERSION = "v4";
const PAGE_CACHE = `3omda-pages-${VERSION}`;
const RSC_CACHE = `3omda-rsc-${VERSION}`;
const ASSET_CACHE = `3omda-assets-${VERSION}`;
const IMAGE_CACHE = `3omda-images-${VERSION}`;

/* Case screenshots alone are ~225 MB: keep the most recent N images only. */
const MAX_IMAGES = 120;
/* A home page load is ~25 hashed files; this keeps several deploys' worth,
   so a tab still open on an older build can finish loading its chunks. */
const MAX_ASSETS = 150;
/* HTML documents and RSC payloads of the pages a visitor has opened */
const MAX_PAGES = 60;
const MAX_RSC = 60;

/* The registration scope is the site root — /Portfolio/ in production. */
const SCOPE = new URL(self.registration.scope).pathname;

const HASHED_RE = /\/_next\/static\//;
const IMAGE_RE = /\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([PAGE_CACHE, RSC_CACHE, ASSET_CACHE, IMAGE_CACHE]);
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

const trim = async (cache, max) => {
  const keys = await cache.keys();
  /* cache.keys() is in insertion order: drop the oldest */
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
};

const put = async (cacheName, request, response, max) => {
  const cache = await caches.open(cacheName);
  /* Delete first so re-insertion moves the entry to the newest position (LRU) */
  await cache.delete(request);
  await cache.put(request, response);
  if (max) await trim(cache, max);
};

/* Network-first for HTML documents; falls back to cached copy or home page offline. */
const networkFirstPage = (event, network) =>
  network
    .then((response) => {
      if (response && response.ok) {
        event.waitUntil(put(PAGE_CACHE, event.request, response.clone(), MAX_PAGES));
      }
      return response;
    })
    .catch(async () => {
      const pageCache = await caches.open(PAGE_CACHE);
      const cached =
        (await pageCache.match(event.request)) ??
        (await pageCache.match(event.request, { ignoreSearch: true }));
      if (cached) return cached;
      const home = (await pageCache.match(SCOPE)) ?? (await pageCache.match(`${SCOPE}index.html`));
      return home ?? Response.error();
    });

/* Network-first for Next.js RSC payloads in a dedicated cache. */
const networkFirstRsc = (event, network) =>
  network
    .then((response) => {
      if (response && response.ok) {
        event.waitUntil(put(RSC_CACHE, event.request, response.clone(), MAX_RSC));
      }
      return response;
    })
    .catch(async () => {
      const rscCache = await caches.open(RSC_CACHE);
      const cached = await rscCache.match(event.request);
      return cached ?? Response.error();
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
      networkFirstPage(
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
    event.respondWith(networkFirstRsc(event, fetch(request)));
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
          .then((response) => {
            if (response.ok) {
              event.waitUntil(put(IMAGE_CACHE, request, response.clone(), MAX_IMAGES));
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
