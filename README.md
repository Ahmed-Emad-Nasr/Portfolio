# حزمة التعديلات الكاملة

> **`ARCHITECTURE.md`** جنب الملف ده فيه شرح كامل لبنية المشروع
> بالإنجليزي: حدود Server/Client، نظام الـ tier، نظام الكروت، الأنيميشن،
> الأداء، ومصائد معروفة. اقراه لو هتغيّر حاجة بنيوية.

فك الضغط في **جذر المشروع**. الملفات كلها بمساراتها الحقيقية:

```bash
unzip portfolio-complete.zip -d /path/to/Portfolio
```

بعدين:

```bash
npm run build
```

---

## ⚠️ اقرا ده الأول

**مبنيتش المشروع.** الحزمة اللي بعتّها فيها فولدر `app/` بس — مفيش
`package.json` ولا `next.config` ولا `public/`، فمقدرتش أعمل
`npm install` ولا `next build`.

اللي **اتحقق منه فعلاً**:

| الفحص | النتيجة |
|---|---|
| كل ملف `.ts`/`.tsx` بيـparse | ✅ ٤١ ملف |
| أقواس كل ملف CSS متوازنة | ✅ ٢٤ ملف |
| كل `styles.X` في الـ JSX موجود في الـ module بتاعه | ✅ (ما عدا ٤ مشاكل قديمة، تحت) |
| مفيش `MotionInView` متبقّي في شجرة العرض | ✅ |
| كل توكن CSS في `globals.css` مقروء في مكان | ✅ صفر ميت |

اللي **مااتحققش منه**: أنواع TypeScript، سلوك التشغيل، الشكل البصري.
`esbuild` بيتأكد إن الملف بيـparse مش إن أنواعه مضبوطة.

**اعمل commit قبل ما تفك الضغط.**

---

## ٤ باجات قديمة لقيتها أثناء الفحص (مش من تعديلاتي)

كلاسات مستخدمة في الـ JSX ومش موجودة في الـ CSS — يعني بترندر
`class="undefined"` من غير أي ستايل دلوقتي:

| الملف | الكلاس |
|---|---|
| `app/not-found.tsx` | `.suggest` |
| `app/components/experience/experience-section.tsx` | `.desc` |
| `app/blog/[slug]/CaseArticle.tsx` | `.factBlock` |
| `app/core/components/ShortcutsHelp.tsx` | `.group` |

سبتهم زي ما هم — مش عارف الشكل اللي كنت قاصده. `node scripts/css-audit.mjs`
بيمسكهم.

(خامسة اتصلحت: `.navDivider` في هيدر البلوج — ضفت القاعدة.)

---

## اللي اتعمل

### الأداء
- **سكربت `data-tier` في `<head>` قبل أول paint.** كان `useEffect`، يعني
  ميزانية الحركة في `globals.css` مكانتش بتشتغل غير بعد الـ hydration —
  التليفون بيدفع التكلفة الكاملة في نافذة الـ LCP/TBT بالظبط وبعدين
  يقفلها. وكل التليفونات بقت `"low"` (كانت `"mid"`).
- **`content-visibility: auto` كانت شغّالة على الـ hero** — كروم مبيحسبش
  LCP لمحتوى جوه subtree متخطّى. استثنيت `#Home`.
- **`credentials.tsx` بقى Server Component** — كان `"use client"` بصفر
  hooks، وبيشحن `certifications` + `skills` + `achievements` (~١١.٧
  كيلوبايت) لكل زائر. دلوقتي صفر. مرّرته كـ slot من `page.tsx`.
- **الـ loader بقى CSS + observer مشترك** بدل ٥٠ IntersectionObserver.
- **`preload: false` على JetBrains Mono** — كان خامس ملف خط بأولوية عالية
  بيزاحم صورة الـ LCP.
- **`cursor-mount` بيفحص اللمس قبل الـ dynamic import** — الـ chunk مبقاش
  يتحمّل على التليفون.

### الـ CSS
- `globals.css`: ٢٤٫٥ك → ٢٨٫٩ك بايت، بس ٩١ → ٧١ قاعدة أساسية. شلت ٤٧
  توكن ميت (٤٢٪) و١١ كلاس utility مش مستخدم و١٦ `box-shadow: none`،
  وضفت أقسام الظهور والتفاعلات.
- شلت المحدد العالمي `html[data-tier="low"] *` للـ `backdrop-filter` —
  كان بيجبر إعادة حساب أنماط على كل عنصر عشان يلغي ٤ تصريحات بتقرا
  `var(--card-blur)` أصلاً.
- **هيدر البلوج بقى بيستخدم ملف الهيدر الرئيسي** (كانوا ٩٨٪ نفس الملف،
  والنسخة الثانية ناقصها `-webkit-clip-path` — يعني الشكل مكسور على
  سفاري في صفحات البلوج بس).
- `.scrollBlurOverlay` كان عليه `transition` على `backdrop-filter` بملء
  الشاشة. بقى `opacity` + `var(--ui-blur)`.
- شلت ٨ كلاسات ميتة.

### الأنيميشن والتفاعل
- `Reveal.tsx` + `RevealGroup` — CSS transitions + observer واحد للصفحة.
- **شكل موحّد للكروت.** الموقع كان فيه أربع معالجات مختلفة اتكتبوا في
  أوقات مختلفة:

  | | الحدود | الخلفية | نصف القطر |
  |---|---|---|---|
  | `.single-project` | خط **2px فوق** (شفاف → أحمر) | `10,10,10,.6` | `--radius-card` |
  | `.pdfCard` وإخواته | خط **3px شمال** (أحمر باهت) | `10,10,10,.6` | `--radius-card` |
  | `.relatedCard` / `.card` | خط **2px شمال** (أحمر صريح) | `255,255,255,.015` | `--radius-card-sm` |
  | `.art_pic` | **مفيش لمسة لون** | `10,10,10,.6` | `--radius-card` |

  دلوقتي **مفيش ولا تصريح واحد لشكل الكارت في أي ملف module**. لا حدود،
  لا خلفية، لا نصف قطر، لا padding، لا hover. كله من القسم ١٤ في
  `globals.css`.

  ```tsx
  <article data-fx="card">                      {/* 2.5rem */}
  <article data-fx="card" data-card="compact">  {/* 1.8rem 2rem */}
  <article data-fx="card" data-card="tight">    {/* 0.6rem — إطار صورة */}
  ```

  اللي فاضل في الـ modules هو التخطيط الداخلي بس:

  ```css
  /* All appearance comes from html [data-fx="card"] in globals.css */
  .single-project { display: flex; flex-direction: column; }
  ```

  ١٢ كارت في الموقع شايلين الـ attribute، وفيه سكربت فحص أكّد إن مفيش
  كود شكل متبقّي.
- لمعة الزراير، خط اللينكات، التاجات، رد فعل الضغط.
- شريط تمرير مخصص (كان ٤ بكسل أحمر باهت بعد ما الـ border ياكل ٦).
- `Spotlight.tsx` (اختياري، مش مركّب في أي حتة).

### الموثوقية والوصولية
- `error.tsx` + `global-error.tsx` — مكانوش موجودين. أي exception في أي
  من الـ ٢٨ client component كان بيدّي **صفحة بيضا فاضية**.
- `lang="ja"` على النص الياباني في الـ hero والـ loader.
- `icons` + `manifest.ts` — الموقع كان بيقول لـ iOS إنه قابل للتثبيت
  (`appleWebApp.capable`) من غير ما يدّي أيقونة.

---

## خطوتين ناقصين منك

**١. صور الـ hero متعددة المقاسات**

```bash
npm i -D sharp
node scripts/generate-hero-sizes.mjs
```

**مش مطبّق في الكود.** مع `output: "export"` لازم `images.unoptimized`،
وساعتها `<Image>` بترندر `<img>` من غير `srcset` — يعني تليفون ٣٦٠px
بيحمّل نفس ملف شاشة الـ 4K، وهي صورة الـ LCP.

سبته لأنه محتاج `next.config` عشان أتأكد من `images.unoptimized`، وطلبته
تلات مرات ولسه مش شايفه. ابعتهولي وأنا أطبّقه.

**٢. `data-fx` على باقي العناصر**

ضفت `data-fx="card"` على ٨ كروت حقيقية. لسه ينفع تضيف:

- `data-fx="tag"` على `.skillTag` · `.chip` · `.attackChip` · `.badge`
- `data-fx="link"` على `.proofLink` · `.backLink` · `.subTagLink`
- `data-fx="social"` على أيقونات السوشيال

سبتهم لأنهم اختيار جمالي مش إصلاح، وإنت اللي تشوف فين يناسب.

> `.content` في قسم الخبرات اتوحّد كمان بناءً على طلبك. كان عنده
> `translateX(5px)` على الـ hover بدل الارتفاع — الحركة دي اتشالت عشان
> يبقى زي باقي الكروت بالظبط.

### ملاحظة على وزن المحددات

القاعدة المشتركة مكتوبة `html [data-fx="card"]` مش `[data-fx="card"]`
لوحده. السبب إن التاني وزنه (0,1,0) — نفس وزن أي كلاس في ملفات الـ
modules — فاللي بيكسب كان بيبقى حسب ترتيب تحميل الـ CSS، وده مش مضمون.
زيادة `html` بتخلّيه (0,1,1) فبيكسب دايماً.

شلت التصريحات المتعارضة من الـ modules كمان، فالنقطة دي شبكة أمان
لأي كارت أضفته بعدين ونسيت تنضّفه.

---

## بعد البناء، اتأكد من دول

```bash
grep -o 'data-tier' out/index.html | head    # السكربت وصل الـ HTML؟
node scripts/css-audit.mjs                   # فحص CSS
```

وفي المتصفح:

1. **صفحة رئيسية** — الـ loader بيقلع، الشريط بيمشي، السطور بتظهر ورا بعض
2. **إعادة تحميل من الكاش** — الـ loader لازم يقفز لـ ١٠٠٪ ويختفي فوراً
3. **`npm run dev` + الـ console** — لو ظهر hydration warning عن `<html>`،
   اتأكد إن `suppressHydrationWarning` موجودة
4. **اقفل الجافاسكريبت** — كل المحتوى لازم يبان (شبكة أمان الـ Reveal)
5. **اقطع الشبكة بعد أول paint** — كل حاجة تبان خلال ٤ ثواني
6. **موبايل** — `<html>` عليه `data-tier="low"`، مفيش زخرفة متحركة
7. **hover على كارت** — يرتفع ٣px، خط جانبي يمتد، لمعة تعدّي
8. **Tab على كارت** — نفس رد الفعل (`:focus-within`)

لو حاجة اتكسرت: `git diff` وابعتلي الملف.
