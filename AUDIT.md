# تقرير فحص وتحسين — Sensei-106 Portfolio

فحص كامل لمشروع Next.js 16 / React 19 / static export.
**23 مشكلة** اتلقت، منها **6 بتكسر الموقع فعلياً**.

---

## القسم الأول — باجات بتكسر الموقع (P0)

### 1. الـ build مش بيعدّي أصلاً
`next.config.mjs` كان فيه `experimental.optimizeCss: true`. الخاصية دي في Next 15+ محتاجة باكدج `beasties`. فحصت الـ `package-lock.json`: مش موجود، ولا `critters` القديم.

**الحل:** اتشالت. لو عايزها ارجعها بعد `npm i -D beasties`.

---

### 2. كل حاجة بتعمل 404 على GitHub Pages
الموقع منشور على `ahmed-emad-nasr.github.io/**Portfolio**` — يعني تحت sub-path. الـ config مكانش فيه `basePath` ولا `assetPrefix`، فكل ملفات `/_next/*` والصور بتضرب 404. وكمان مكانش فيه `trailingSlash`، فلينك `/blog` بيرجع 404 لأن اللي موجود فعلياً على القرص هو `/blog/index.html` و GitHub Pages ملهاش rewrite engine.

**الحل:** الاتنين اتضافوا، والـ base بقى قابل للتحكم من `NEXT_PUBLIC_BASE_PATH`.

---

### 3. `globals.css` متكرر مرتين بالكامل
الملف 27,496 حرف. النص الأول **مطابق حرفياً** للنص التاني — نسخة كاملة اتلزقت مرتين. يعني كل `:root` وكل الـ media queries وكل `@keyframes` معرّفين مرتين، والمتصفح بيقرا الاتنين.

```
قبل:  27,496 حرف
بعد:  13,749 حرف  ← نص الملف كان مكرر
```

**الحل:** اتشال التكرار. (وبعدين اتضاف عليه layer الـ device-tier، فالحجم النهائي 15,739.)

---

### 4. الـ GSAP مش شغال — و 70KB بتتحمّل على الفاضي
في `smooth-scroll.tsx`:

```tsx
export function SmoothScroll({ children }) {
  const lenis = useLenis();          // ← بيقرا context
  useEffect(() => { if (!lenis) return; ... }, [lenis]);
  return <ReactLenis root>{children}</ReactLenis>;  // ← الـ provider هنا
}
```

الـ `useLenis()` بينادى في **نفس الكومبوننت** اللي بيرندر الـ provider. الـ context بيتوفّر للأبناء بس، فالأب مش هيشوفه — `lenis` بيفضل `null` على طول والـ effect مش بيتنفذ ولا مرة. يعني `gsap` + `ScrollTrigger` (~70KB) نازلين على كل زائر **من غير ما يعملوا حاجة**.

**كمان memory leak:** `gsap.ticker.add()` مش بيتشال في الـ cleanup (بيشيل `lenis.off` بس). ومع `reactStrictMode: true` الـ effect بيتنفذ مرتين في dev فالـ callbacks بتتراكم.

**الحل:** الـ hook اتنقل لكومبوننت ابن جوّه الـ provider، والـ ticker بقى بيتشال صح، و GSAP بقى `import()` ديناميكي مش static.

---

### 5. مسارات الصور مكسورة
`next/image` **بيرفض** أي `src` محلي مبيبدأش بـ `/`. اللي كان موجود:

| الملف | كان | بقى |
|---|---|---|
| `sensei-home.tsx` | `"Assets/.../3omda.webp"` | `"/Assets/..."` |
| `sensei-home.tsx` (CV) | `href="Assets/cv/..."` | `href="/Assets/cv/..."` |
| `sensei-art.tsx` | كل الـ 50 صورة بدون `/` | كلها بـ `/` |

لاحظ إن في نفس السطر في `sensei-home.tsx` كان فيه واحدة بـ `/` والتانية من غيرها:
```tsx
src={failed ? "/Assets/.../My_Logo.webp" : "Assets/.../3omda.webp"}
```

> ملاحظة: المسارات النسبية في `portfolio.ts` **سليمة** — دي بتعدّي على `normalizePublicHref()` اللي بيضيف الـ basePath. مالهاش دعوة بالمشكلة دي.

---

### 6. صورة الـ OG في البلوج بتشاور على ملف مش موجود
`blog/page.tsx` كان بيستخدم `/Assets/art-gallery/logo/logo.png`، والمسار الصحيح `/Assets/art-gallery/Images/logo/My_Logo.webp`. (التعليق اللي انت كاتبه جنبها كان بيشك في ده بالظبط.) يعني كل مشاركة للبلوج على LinkedIn أو تويتر بتطلع من غير صورة.

---

## القسم التاني — الأداء

### 7. الموقع بيطلّع HTML فاضي ⭐ أهم مشكلة

في `page-client.tsx` و `blog/page-client.tsx` **كل** السكاشن كانت:
```tsx
dynamic(() => import(...), { ssr: false })
```

مع `output: "export"` ده معناه إن الـ HTML المولّد **مفيهوش محتوى** — divs فاضية بس. النتايج:

- **LCP** مربوط بتحميل + تحليل + تنفيذ الـ bundle كله. على موبايل متوسط = 3+ ثواني شاشة سودا.
- **جوجل بيفهرس صفحة فاضية.** كل الـ JSON-LD اللي في `layout.tsx` و `page.tsx` و `blog/page.tsx` بيوصف محتوى الكرولر مش شايفه.
- `ssr: false` بيلغي **الفايدة الأساسية** من الـ static export.

وكمان كان فيه gate تاني فوق ده: `isAppReady` بيخبّي كل المحتوى بـ `opacity: 0` لحد ما `requestAnimationFrame` يضرب.

**الحل:** الهيدر والـ hero بقوا static imports (دول اللي الـ LCP بيتقاس عليهم). الباقي فضل `dynamic()` **بس من غير `ssr: false`** — يعني الـ code-splitting لسه شغال والـ JS chunk لسه منفصل، بس الـ markup بيتولّد وقت الـ build. الـ `isAppReady` gate اتشال.

---

### 8. الـ Loader بيقفل الشاشة 2.2 ثانية إجبارية

```tsx
const handleLoad = () => setTimeout(() => setLoading(false), 2200);
```

دي بتتنفذ **بعد** حدث `load` ما يكون خلص. يعني لو الموقع حمّل في 800ms، المستخدم لازم يستنى 2.2 ثانية زيادة. مع مشكلة رقم 7 = أول محتوى حقيقي بعد 3+ ثواني.

وكمان مكانش فيه escape hatch: لو `load` معلّق بسبب أصل واحد بايظ، المستخدم محبوس ورا الـ overlay للأبد.

**الحل:** بيقفل فوراً لما الصفحة تجهز. `MIN_VISIBLE_MS = 400` بس عشان مايبقاش فيه ومضة مزعجة، و `MAX_VISIBLE_MS = 4000` كـ safety timeout. وبار التقدم بقى sweep حقيقي بدل ما يكون تمثيل لمدة ثابتة.

---

### 9. `KanjiDivider` — أكبر مصدر للـ jank

4 نسخ على الصفحة الرئيسية، كل واحدة كان فيها:

1. **`backdropFilter: blur(4px)`** على عنصر full-width — أغلى خاصية في CSS كلها. بتجبر الـ compositor يعيد أخذ عيّنة من كل اللي وراها كل فريم.
2. **`useScroll()` خاص بيها** → 4 scroll listeners منفصلين بيشغّلوا 4 سلاسل `useTransform`.
3. **`willChange: "transform"` دايم** → 4 compositor layers محجوزين في ذاكرة الـ GPU طول الجلسة، شايفهم أو مش شايفهم.
4. **8 نسخ مكررة من النص**، كل واحدة 3 spans متداخلة = ~200 عقدة DOM زيادة.
5. **~40 كائن inline style** بيتعاد تخصيصهم كل render.

**الحل:** اتبنى من الأول كـ **CSS marquee خالص**. لا JS، لا scroll listener، لا framer-motion، لا backdrop-filter. الأنيميشن بيشتغل على الـ compositor بالكامل وبيوقف لوحده لما يخرج من الشاشة عن طريق `content-visibility`. الشكل تقريباً نفسه. التكرارات نزلت من 8 لـ 4.

---

### 10. `LazyMotion` متكرر عشرات المرات
`MotionInView` كان بيلف **كل نسخة** منه في `<LazyMotion>` خاص بيها. معرض الصور لوحده بيرندر لحد 50 نسخة، زايد كل عنصر timeline وكل كارت مشروع. الـ `LazyMotion` مصمم إنه يتركّب **مرة واحدة** قريب من الجذر.

**الحل:** `<MotionProvider>` اتصدّر واتركّب مرة واحدة في `layout.tsx`.

**وكمان:** الـ viewport الافتراضي كان `{ once: false }` — يعني كل عنصر بيعيد أنيميشن الدخول **كل مرة** يرجع للشاشة. على صفحة طويلة ده شغل أنيميشن مستمر طول الـ scroll. بقى `once: true`.

---

### 11. الـ favicon كان 264 كيلوبايت
إطار واحد 256×256 بـ 32-bit. ده بيتحمّل على كل صفحة.

```
قبل:  270,398 bytes
بعد:    9,754 bytes   ← 96% أقل
```
اتبنى من جديد بأحجام 16/32/48.

**وكمان:** `layout.tsx` كان فيه `<link rel="icon">` يدوي **بالإضافة** لـ `app/favicon.ico` اللي Next بيحقنه أوتوماتيك — تعريفين للأيقونة.

---

### 12. `<link rel="preload">` بيحمّل الصورة الغلط
`layout.tsx` كان بيعمل preload لـ `My_Logo.webp`، بس صورة الـ LCP الحقيقية هي `3omda.webp`. يعني كان بيحجز round-trip لملف مش هو ويأخّر الملف الصح. وفوق كده صورة الـ hero نفسها كانت `loading="lazy"` — يعني بيقول للمتصفح **يأجّل** الصورة الوحيدة اللي الدرجة بتتقاس عليها.

**الحل:** الـ `<head>` اليدوي اتشال (كان كمان مش بياخد الـ basePath فبيعمل 404)، وصورة الـ hero بقى عليها `priority` اللي بيطلّع الـ preload الصح لوحده.

---

### 13. تلات مكتبات أيقونات، اتنين منهم مش مستخدمين خالص

| الباكدج | عدد الـ imports في الكود |
|---|---|
| `react-bootstrap-icons` | **0** |
| `@fortawesome/fontawesome-free` | **0** |
| `yet-another-react-lightbox` | **0** |

`fontawesome-free` هي نسخة الـ CSS + webfonts (~1.4MB خطوط). التطبيق بيستخدم مسار React/SVG بس. التلاتة اتشالوا من `package.json`.

كمان `optimizePackageImports` كان فيه `react-fontawesome` بس — وده الـ wrapper الرفيع. باكيتات الأيقونات نفسها (اللي بالميجابايتات) كانت متسابة. اتضافوا.

---

## القسم التالت — منطق وصيانة

### 14. `toBulletItems` كان بيكسّر الكلام
```ts
parts = text.split(/[.;]/);   // بيقسم على كل نقطة
```
ده بيحوّل `Node.js` لـ `["Node", "js"]`، و `v2.0` لـ `["v2", "0"]`، و `10.5%` لـ `["10", "5%"]`. النص بتاعك فيه `NIST 800-61` و `Wazuh, ELK, Splunk`.

**الحل:** `split(/\.(?=\s+[A-Z]|\s*$)/)` — بيقسم على حدود الجُمَل الحقيقية بس. اتّختبر:
```
IN : "Built with Node.js and v2.0 tooling. Follows NIST 800-61. Tuned Wazuh rules."
OUT: ["Built with Node.js and v2.0 tooling", "Follows NIST 800-61", "Tuned Wazuh rules"]
```

---

### 15. `MS_PER_MONTH` رقم مش حقيقي
كان `2629946880`. ده مش أي طول شهر معروف — بيزيح ~يومين في السنة، كفاية إنه يقلب عدد الشهور المعروض في التواريخ الحدّية. بقى `2629746000` (الشهر الجريجوري المتوسط = 365.2425 ÷ 12 يوم).

### 16. تواريخ بايظة بتطلع إجابة غلط بتبان صح
التعليق `PERF BUILD` شال الـ `isNaN` guard. تاريخ بايظ بينتج `NaN`، و `NaN > 0` بترجع `false` دايماً، فالدالة بترجّع `"< 1 mo"` — إجابة غلط شكلها صح. الـ guard رجع.

### 17. الـ scrollspy بيقيس مواضع غلط
بيحسب `getBoundingClientRect()` مرة واحدة عند الـ mount. بس السكاشن code-split، فوقتها معظمها لسه placeholders بارتفاع صفر. الكود كان بيكاش المواضع الغلط دي للأبد — فالـ nav بيضوّي على السكشن الغلط طول الجلسة. اتضاف `ResizeObserver` على `document.body`.

### 18. `localStorage.setItem` جوّه مسار الـ scroll
عملية متزامنة بتلمس القرص، كانت بتتنفذ كل ما السكشن يتغير أثناء scroll سريع. بقت في `requestIdleCallback`.

### 19. `formatDate` معرّفة **3 مرات** بسلوكين مختلفين

| المكان | اللغة |
|---|---|
| `core/config/portfolio.ts` | `en-GB` |
| `blog/blog-utils.ts` | `en-GB` (نسخة تانية + cache تاني) |
| `core/utils/utils.ts` | **`en-US`** |

يعني نفس التاريخ كان بيتعرض بشكلين حسب الصفحة. وكمان `normalizePublicHref`, `getThumbnail`, و 3 types (`PdfResource`, `GalleryState`, `ChannelVideo`) كانوا متكررين.

**الحل:** `blog-utils.ts` و `blog-types.ts` بقوا re-exports من مصدر واحد. اللي في `utils.ts` اتسمّى `formatRepoDate` عشان الاختلاف يبقى مقصود وواضح.

### 20. كود ميت بيكتب في `localStorage` كل تحميل
```tsx
const CV_VARIANT = typeof window !== "undefined"
  ? (localStorage.getItem("cv_var") || (Math.random() < 0.5 ? "A" : "B")) : "A";
if (typeof window !== "undefined") localStorage.setItem("cv_var", CV_VARIANT);
```
`CV_VARIANT` **مش مستخدم في أي حتة**. مجرد `Math.random()` على مستوى الموديول (خطر hydration mismatch) + كتابة في localStorage كل تحميل. اتشال.

---

## القسم الرابع — نظام درجات الأجهزة (جديد)

المشكلة الجوهرية إن الموقع كان بيشغّل **نفس حِمل الأنيميشن على كل جهاز**: 20 عنصر بأنيميشن لانهائي في الـ hero، cursor بمحرك spring، Lenis smooth scroll، و transforms مربوطة بالـ scroll.

اتضاف `app/core/hooks/useDeviceTier.ts` — بيصنّف الجهاز مرة واحدة عند الـ mount حسب `hardwareConcurrency`, `deviceMemory`, `connection.saveData`, `effectiveType`, و `prefers-reduced-motion`. وبيكتب `data-tier` على `<html>` عشان الـ CSS يقدر يقفل الخصائص الغالية **من غير JS في المسار الساخن**.

| | low | mid | high |
|---|---|---|---|
| Lenis smooth scroll | مقفول | `lerp: 0.12` | `lerp: 0.07` |
| Custom cursor | مقفول | شغال | شغال |
| أنيميشن الزينة (20 عنصر) | `display: none` | أبطأ | كامل |
| `backdrop-filter` | `none` | `2px` | `4px` |
| أنيميشن دخول السكاشن | مقفول | شغال | شغال |
| GSAP + ScrollTrigger | مش بيتحمّل | lazy | lazy |

كمان `syncTouch: false` اتضاف لـ Lenis — كان بيتعارك مع الـ momentum scrolling الأصلي على التاتش.

---

## ملخص المكاسب

| البند | قبل | بعد |
|---|---|---|
| `globals.css` | 27,496 حرف | 13,749 (+ tier layer) |
| `favicon.ico` | 270,398 bytes | 9,754 bytes |
| باكدجات مش مستخدمة | 3 | 0 |
| `LazyMotion` providers | ~50+ | 1 |
| `backdrop-filter` full-width | 4 | 0 |
| scroll listeners للـ dividers | 4 | 0 |
| تأخير إجباري قبل المحتوى | ~2.2s | ~0.4s |
| محتوى في الـ HTML | لا | أيوه |

---

## اللي لسه محتاج منك

هي حاجات مقدرتش أعملها من غير الأصول نفسها:

1. **`public/Assets/` مش معايا.** أهم مكسب متبقّي هو ضغط الصور. عندك 172 مسار أصل في `portfolio.ts` — لو دي WebP كبيرة، ده على الأرجح أكبر من كل مكاسب الـ JS مجتمعة. شغّل سكربت الـ Python بتاعك وابعتلي أحجام الملفات.

2. **أكّدلي على الـ basePath.** لو الموقع على دومين خاص مش GitHub Pages، غيّر `REPO_BASE` لـ `""` في `next.config.mjs`.

3. **شغّل `npm run verify`** بعد ما تركّب الملفات. لو TypeScript اشتكى من `formatRepoDate` أو من الـ types المعاد تصديرها، ابعتلي الخطأ.

4. **`experience-section.tsx` بيستخدم `any`** لكل props الـ `TimelineItem`، وده بيلغي كل فايدة الـ TypeScript في أكتر كومبوننت بيتكرر. سيبته عشان محتاج شكل الداتا الفعلي من `portfolio.ts` — أقدر أعملها لو عايز.

5. **مجلدات فيها مسافات** (`SOC Enviroment DEPI R3 Project`, `AWS KMS`). دي شغالة لأن المتصفحات بتعمل encode للمسافات، بس هي مصدر مشاكل. لو هتعيد تنظيم الأصول، استخدم شرطات.
