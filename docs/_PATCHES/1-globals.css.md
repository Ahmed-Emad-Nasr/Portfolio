/* ═══════════════════════════════════════════════════════════════════════════
   تعديلات app/globals.css — تلات حاجات
   ═══════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────────
   [1] إصلاح — ده أهم واحد فيهم على الـ LCP
   ───────────────────────────────────────────────────────────────────────────

   القاعدة الحالية (سطر ~424) بتقول:

       section {
         ...
         contain: layout style;
         content-visibility: auto;
         contain-intrinsic-size: auto 900px;
       }

   `section` بيشمل **كل** section في الصفحة — بما فيها <section id="Home">،
   اللي هو الـ hero، اللي جواه صورة الـ LCP بالظبط.

   `content-visibility: auto` بيقول للمتصفح "متحسبش layout ولا paint للعنصر
   ده لحد ما يقرب من الشاشة". على أي حاجة تحت الطية ده مكسب حقيقي. على عنصر
   **فوق** الطية هو عقوبة مباشرة: الـ subtree بيتأجّل لخطوة render تانية،
   وكروم مبيحسبش LCP لمحتوى جوه subtree متخطّى.

   وكمان `contain-intrinsic-size: auto 900px` بيحجز 900px مؤقتين. الـ hero
   على تليفون (min-height: auto تحت 992px) بيطلع أطول من كده، فأول ما
   الارتفاع الحقيقي يتحسب الصفحة بتتزحلق — CLS من غير سبب.

   الحل: استثني الـ hero. أي section تاني زي ما هو.

   ── بدّل قاعدة `section` بدي: ────────────────────────────────────────────── */

section {
  padding: 7.1rem 5.25% 5.9rem;
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto clamp(6rem, 10vw, 12rem) auto;
  z-index: 1;
  contain: layout style;
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}

/* الـ hero فوق الطية دايماً — لازم يترسم في أول pass.
   `:where()` بيخلّي الـ specificity صفر، فالقاعدة مبتزاحمش أي حاجة تانية. */
section:where(#Home) {
  content-visibility: visible;
  contain-intrinsic-size: none;
  contain: none;
}


/* ───────────────────────────────────────────────────────────────────────────
   [2] إضافة — احتياطي لو الجافاسكريبت اتعطّل
   ───────────────────────────────────────────────────────────────────────────

   السكربت في <head> بيكتب data-tier قبل أول paint، فالحالة دي نادرة
   (جافاسكريبت مقفول، أو السكربت رمى exception). لكن من غيرها الزائر ده
   بياخد الميزانية الكاملة للحركة على تليفون.

   ضيف الكتلة دي بعد قسم "11. Device-tier motion budget". */

html:not([data-tier]) [data-decorative="true"] {
  display: none !important;
}

html:not([data-tier]) *,
html:not([data-tier]) *::before,
html:not([data-tier]) *::after {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}


/* ───────────────────────────────────────────────────────────────────────────
   [3] إضافة — سقف صريح للحركة على التليفونات
   ───────────────────────────────────────────────────────────────────────────

   detectTier() بقى بيرجّع "low" لأي جهاز لمسي بعرض <= 900px، فالقواعد
   الموجودة في قسم 11 كفاية. الكتلة دي بتقفل الحتت اللي مش زخرفية ومحطّش
   عليها data-decorative — يعني مش داخلة في الـ gating الحالي:

   - background-attachment: fixed (متعالج فعلاً فوق، سايبه للتوثيق)
   - transitions طويلة على عناصر بتتحرك مع الـ scroll
   - text-shadow / box-shadow اللي بتجبر repaint في كل فريم */

@media (pointer: coarse) and (max-width: 900px) {
  /* long eases على تليفون معناها إن الطبقة بتفضل عايشة على الـ compositor
     مدة أطول من غير فايدة بصرية حقيقية على شاشة بالحجم ده. */
  :root {
    --motion-fast: 140ms;
    --motion-normal: 220ms;
    --motion-slow: 300ms;
  }

  /* أي عنصر بيحجز طبقة compositor بشكل دايم بيخصم من نفس ميزانية
     الـ GPU اللي الـ scroll نفسه بيتنافس عليها. */
  * {
    will-change: auto !important;
  }

  /* الـ tap highlight الأزرق بتاع الأندرويد بيقطع الهوية اللي كلها أحمر/ذهبي */
  a, button, [role="button"] {
    -webkit-tap-highlight-color: rgba(var(--main-color-rgb), 0.18);
  }
}
