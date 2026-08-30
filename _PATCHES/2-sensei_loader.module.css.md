/* ═══════════════════════════════════════════════════════════════════════
   ضيف الكتلة دي في آخر app/components/loader/sensei_loader.module.css
   (متشيلش أي حاجة من اللي فوق — دي إضافات بس)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── 1. الخروج بقى CSS بدل framer-motion ────────────────────────────────
   المدة هنا لازم تساوي EXIT_MS في sensei_loader.tsx (420ms). */
.loader {
  transition: opacity 420ms cubic-bezier(0.76, 0, 0.24, 1),
              transform 420ms cubic-bezier(0.76, 0, 0.24, 1);
  will-change: opacity, transform;
}

.leaving {
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
}

/* ── 2. دوران الحلقة بقى CSS ──────────────────────────────────────────
   كان m.div بـ repeat: Infinity — اشتراك requestAnimationFrame دايم على
   الـ main thread. الـ CSS بيدّي نفس النتيجة على الـ compositor. */
.outerRing {
  animation: loaderSpin 3s linear infinite;
}

@keyframes loaderSpin {
  to { transform: rotate(360deg); }
}

/* ── 3. شريط تقدّم غير محدّد (كان مذكور في التعليقات ومش متكتب) ────────── */
.progressFill {
  width: 40%;
  animation: loaderSweep 1.2s ease-in-out infinite;
}

@keyframes loaderSweep {
  from { transform: translateX(-100%); }
  to   { transform: translateX(350%); }
}

/* ── 4. أهم قاعدة في الملف ده ─────────────────────────────────────────
   السكربت في <head> بيكتب data-tier قبل أول paint، والتليفونات كلها بقت
   "low". يعني زائر الموبايل عمره ما يشوف الـ overlay أصلاً: أول paint هو
   الـ hero نفسه، مش شاشة سودا بتستنى.

   الـ markup لسه بيترندر (نفس اللي على السيرفر، فمفيش hydration mismatch)
   والجافاسكريبت بيشيله بعدها من الـ DOM عادي. */
:global(html[data-tier="low"]) .loader {
  display: none;
}

/* احتياطي لو الجافاسكريبت اتعطّل تماماً: التليفون برضه ميشوفش الـ overlay. */
:global(html:not([data-tier])) .loader {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .loader { transition: opacity 150ms linear; }
  .leaving { transform: none; }
  .outerRing, .progressFill { animation: none; }
}
