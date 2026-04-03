const CACHE_NAME = "portfolio-static-v2";
const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/Assets/art-gallery/Images/logo/My_Logo.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isAssetRequest = /\.(?:js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|pdf|map|json|xml|txt)$/i.test(requestUrl.pathname);

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => undefined);
          });
          return response;
        })
        .catch(() => {
          if (isAssetRequest) return Response.error();
          return caches.match("/");
        });
    })
  );
});
