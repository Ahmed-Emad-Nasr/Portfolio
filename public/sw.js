/*
 * sw.js — Service Worker بسيط لدعم الأوفلاين
 * Author: Ahmed Emad Nasr
 *
 * ═══ ليه من غير precache list ═══
 *
 * الموقع static export (`next export`)، وأسماء ملفات الـ JS/CSS بتاعت
 * Next بتتغيّر بـ hash كل build. من غير الوصول لـ build manifest وقت
 * التشغيل، أي precache list هنكتبها بالإيد هتبقى قديمة بعد أول build.
 *
 * الحل هنا: runtime caching بس. أول ما المتصفح يطلب أي حاجة same-origin،
 * بنخزّنها. زيارة تانية = أوفلاين شغال لأي حاجة الزائر شافها قبل كده.
 * مفيش "تحميل مسبق" — بس فيه "تذكّر" لأي حاجة اتزارت.
 *
 * ═══ الاستراتيجية ═══
 *
 *   · صفحات (navigation requests): network-first. لو الشبكة موجودة
 *     بتاخد الأولوية عشان الزائر يشوف آخر نسخة. لو الشبكة فشلت، بنرجع
 *     للنسخة المخزّنة من نفس الصفحة، أو أقرب صفحة متخزّنة كبديل أخير.
 *
 *   · أصول ثابتة (JS/CSS/صور/خطوط): cache-first. دول بتتغيّر بـ hash في
 *     اسم الملف، فلو الملف موجود في الكاش يبقى هو نفسه — مفيش داعي
 *     نتأكد من الشبكة كل مرة.
 *
 * ═══ حدود متعمّدة ═══
 *
 *   · same-origin بس — مفيش تخزين لأي حاجة من دومين تاني (فونتات
 *     خارجية، أيقونات CDN..إلخ) عشان منضمنش نتحكم في الـ headers بتاعتهم.
 *   · GET بس — أي طلب POST (فورم التواصل مثلاً) بيعدّي للشبكة زي ما هو.
 *   · (v2) الصور والملفات اللي اسمها ثابت (Assets/...) بقت stale-while-revalidate:
 *     بتظهر من الكاش فوراً، وبتتحدّث في الخلفية — فلو غيّرت صورة بنفس الاسم
 *     الزائر هيشوف الجديدة في الزيارة اللي بعدها، مش أبداً.
 *     cache-first فضل بس لـ /_next/static/ (اسمها فيه hash فمستحيل تتغيّر).
 *   · (v2) الكاش له حد أقصى لعدد الصور (لقطات الكيسز لوحدها 225MB).
 *   · (v2) الـ offline fallback بقى scope الموقع (/Portfolio/) مش "/" —
 *     "/" على github.io هو دومين تاني خالص ومكانش هيبقى في الكاش أبداً.
 *   · skipWaiting/clients.claim: نسخة جديدة من الـ SW بتاخد السيطرة على
 *     طول من غير ما تستنى كل التابات تتقفل. للموقع البسيط ده مقبول؛
 *     أسوأ حالة إن تاب مفتوح ياخد شوية أصول من نسخة جديدة مع صفحة قديمة.
 */

const CACHE_NAME = "3omda-runtime-v2";
const IMAGE_CACHE = "3omda-images-v2";
/* Case screenshots alone are ~225 MB: keep the most recent N images only. */
const MAX_IMAGES = 120;

/* The registration scope is the site root — /Portfolio/ in production. */
const SCOPE = new URL(self.registration.scope).pathname;

const HASHED_RE = /\/_next\/static\//;
const IMAGE_RE = /\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;
const STATIC_RE = /\.(?:js|css|woff2?|ttf)$/i;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const keep = new Set([CACHE_NAME, IMAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const trim = async (cacheName, max) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  /* cache.keys() is in insertion order: drop the oldest */
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
};

const put = async (cacheName, request, response) => {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ── Pages: network-first, the cached copy when offline ────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          /* Only real pages: a cached 404 would be served offline as if it
             were the page. */
          if (response.ok) event.waitUntil(put(CACHE_NAME, request, response.clone()));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const home = (await caches.match(SCOPE)) ?? (await caches.match(`${SCOPE}index.html`));
          return home ?? Response.error();
        }),
    );
    return;
  }

  // ── Hashed build files: cache-first (the name changes with the content) ──
  if (HASHED_RE.test(url.pathname) || STATIC_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) event.waitUntil(put(CACHE_NAME, request, response.clone()));
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
});
