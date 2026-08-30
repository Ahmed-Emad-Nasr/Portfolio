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
 *   · skipWaiting/clients.claim: نسخة جديدة من الـ SW بتاخد السيطرة على
 *     طول من غير ما تستنى كل التابات تتقفل. للموقع البسيط ده مقبول؛
 *     أسوأ حالة إن تاب مفتوح ياخد شوية أصول من نسخة جديدة مع صفحة قديمة.
 */

const CACHE_NAME = "3omda-runtime-v1";

const STATIC_ASSET_RE = /\.(?:js|css|png|jpg|jpeg|webp|gif|svg|woff2?|ttf|ico|avif)$/i;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ── الصفحات: network-first مع fallback للكاش ──────────────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // آخر حل: أي صفحة اتخزّنت قبل كده، أفضل من شاشة بيضا فاشلة.
          const fallback = await caches.match("/");
          return fallback ?? Response.error();
        }),
    );
    return;
  }

  // ── الأصول الثابتة: cache-first ───────────────────────────────────────
  if (STATIC_ASSET_RE.test(url.pathname) || url.pathname.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // بعض الاستجابات (opaque من CDN تاني) ملهاش لازمة تتخزّن هنا،
          // بس احنا فلترنا same-origin فوق فمفروض تكون دايماً "basic".
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
  }
});
