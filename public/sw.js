/*
 * sw.js — a small service worker for offline support
 * Author: Ahmed Emad Nasr
 *
 * ═══ Why there is no precache list ═══
 *
 * The site is a static export, and Next.js puts a content hash in the name
 * of every JS/CSS file, so the names change on every build. Without the
 * build manifest at runtime, any precache list written by hand would be out
 * of date after the first deploy.
 *
 * So this is runtime caching only: every same-origin request is stored as it
 * is made. A second visit works offline for anything the visitor has already
 * seen. Nothing is downloaded ahead of time — the worker only remembers.
 *
 * ═══ Strategy ═══
 *
 *   · Pages (navigation requests): network-first, with navigation preload.
 *   · /_next/static/ (hashed names): cache-first.
 *   · Images and other fixed-name files (Assets/…): stale-while-revalidate.
 *
 * ═══ v3 ═══
 *
 *   · Navigation preload. Without it every page load waited for the worker
 *     to boot (50–300 ms on a phone) before the HTML request even started —
 *     the worker was slowing down the first byte of every visit. Now the
 *     browser sends the page request in parallel with starting the worker,
 *     and the worker uses that response.
 *
 *   · The build-file cache is bounded. Every deploy produces JS/CSS files
 *     with new names, and the old ones stayed in 3omda-runtime-v2 forever
 *     (the cache name never changed, so it was never cleared) — after a few
 *     deploys the cache grew without limit. Now the oldest entries are
 *     dropped once the count passes MAX_ASSETS.
 *
 *   · Pages have their own bounded cache (MAX_PAGES): 76 case pages at
 *     ~200 KB each would otherwise add up.
 *
 *   · Cache-first applies to /_next/static/ only. Before, any .js/.css/.woff2
 *     on the site — even with a fixed name — was served from the cache
 *     forever, so an edited file with the same name never reached the
 *     visitor.
 *
 *   · RSC payloads (`*.txt?_rsc=…`), which Next.js fetches when navigating
 *     inside the site without a reload: network-first with a copy in the
 *     page cache, so moving between pages already visited works offline too.
 *
 *   · Link prefetches are left to the network. Next.js prefetches every
 *     internal link that scrolls into view (the blog alone has 76 case
 *     links); caching those payloads filled the 60-page cache with pages
 *     nobody opened and pushed out the ones they had.
 *
 *   · Offline, a page opened with a query string (/blog?q=wazuh) falls back
 *     to the same page without it before falling back to the home page.
 *
 * ═══ Deliberate limits ═══
 *
 *   · Same-origin and GET only. A POST (the contact form, for example) goes
 *     to the network untouched.
 *   · skipWaiting / clients.claim: a new version of the worker takes over
 *     immediately. Worst case, an open tab loads a few files from a newer
 *     build next to an older page — harmless here, because the older files
 *     are still in the cache (MAX_ASSETS is generous).
 */

const VERSION = "v3";
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
      /* Drops v2's unbounded runtime cache along with any other old one */
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
    /* Prefetches of links in view: not cached (see v3 notes) */
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
