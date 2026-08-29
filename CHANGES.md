# التعديلات المطبّقة

كل اللي تحت **متعمّل فعلاً** في `app/` المرفق، مش اقتراحات. اتأكدت منه بـ:

```
npx tsc --noEmit    → نضيف
npx eslint .        → نضيف (كان فيه error واحد، اتظبط)
npx next build      → نجح، 46 صفحة اتولّدت
```

مسّيتش أي مسار — زي ما قلت، الديبلوي شغال.

---

## 1. صورة الـ LCP كانت `loading="lazy"`

`app/components/home/sensei-home.tsx`

الصورة اللي الـ LCP بيتقاس عليها كان مكتوب عليها للمتصفح إنه يأجّلها،
و`layout.tsx` كان بيعمل preload لملف **تاني** خالص (`My_Logo.webp` بدل
`3omda.webp`) — يعني حجز اتصال لصورة مش على المسار الحرج وأخّر اللي عليه.

- `loading="lazy"` → `priority` + `fetchPriority="high"`
- `<link rel="preload">` اليدوي في `layout.tsx` اتشال، Next بيولّده صح لوحده
- `quality={85}` اتشال — no-op طالما `images.unoptimized: true`

**التحقق من الـ HTML المولّد بعد التعديل:**

```html
<link rel="preload" as="image" href="Assets/art-gallery/Images/logo/3omda.webp" fetchPriority="high"/>
```

---

## 2. الـ `<h2>` بتاع الدور كان فاضي في الـ HTML

نفس الملف + `sensei-home.module.css`

الأدوار كانت بتتكتب من `@keyframes words { content: "..." }`. النص اللي جوه
pseudo-element **مش موجود في الـ DOM**: جوجل كان شايف `<h2>` فاضي، والـ
screen reader مبيقولش حاجة — في أهم مكان في الصفحة.

اتضاف `<span className={styles.roleStatic}>` فيه نفس الكلام كنص حقيقي،
مخفي بصرياً بس (`clip-path: inset(50%)`). الشكل متغيّرش ولا بيكسل.

**بقى في الـ HTML:**

```
Information Security Engineer · Cybersecurity Engineer · SOC/DFIR Engineer ·
Malware Analyst · Cybersecurity Instructor
```

> غيّرت `"Noob Malware Analyst"` لـ `"Malware Analyst"` في الـ keyframes.
> دي أول جملة HR بيقراها بعد اسمك مباشرة. لو كانت مقصودة رجّعها، بس أنا
> شايف إنها بتشتغل ضدك.

---

## 3. الأنيميشنات اللانهائية كانت شغالة طول الجلسة

`sensei-home.tsx`

الـ CSS فيه بلوك كامل بيوقف كل loop في الـ hero (`.ringOuter`, `.ringInner`,
`.badgeDot`, الـ typing ticker, `.speedLine`, `.particle`) لما القسم يخرج من
الشاشة — عن طريق `.home[data-in-view="false"]`. **مفيش حاجة كانت بتكتب
الـ attribute ده**، فالتحسين كان مكتوب ومتنفّذش ولا مرة.

اتضاف `IntersectionObserver` بيكتبه على الـ node مباشرة (مش عن طريق state —
مفيش داعي لـ re-render لقسم بالحجم ده)، بـ `rootMargin: 150px` عشان يرجّع
الحركة قبل ما القسم يبان.

---

## 4. الـ 74 صورة شهادة كلهم `alt="Certification"`

`app/components/art_gallery/sensei-art.tsx` + `app/core/config/certifications.ts` (جديد)

الـ screen reader كان بيقول نفس الكلمة 74 مرة، وجوجل معندوش أي فكرة إن دي
eJPT ودي HCIA.

الملف الجديد بيربط رقم الصورة باسم الشهادة وجهة الإصدار ورابط التحقّق.
دلوقتي كل صورة alt مختلفة (`Certificate 12 of 74` كـ fallback)، ولما تملّى
الـ map يبقى `eJPT v2 certificate issued by INE Security`.

**دي أكبر مكسب سهل في الشغل كله — محتاجة منك البيانات بس.** الملف فيه
مثالين متعلّمين بالتعليق، امسح التعليق واملاهم.

كمان: `delay={index * 0.05}` كان معناه إن الصورة رقم 60 بتستنى 3 ثواني كاملة
بعد ما تدخل الشاشة. اتحطّ سقف عند 6.

---

## 5. `portfolio.ts` — 70KB اتقسمت لخمس ملفات

```
قبل:  portfolio.ts                    70,241 bytes  (موديول واحد)

بعد:  portfolio.ts (barrel)            1,139
      core/config/shared.ts            3,901   ← types + normalizePublicHref + formatDate
      core/config/experience.ts        7,058
      core/config/projects.ts          8,492
      core/config/youtube.ts          12,058
      core/config/cases.ts            41,881
```

`layout.tsx` كان بيستورد `knowledgeEducationItems` من الملف الكبير، فبيجرّ
معاه في نفس الـ module graph الـ 38 case وكل الـ screenshots وكل فيديوهات
اليوتيوب — على **كل** صفحة. الـ tree-shaking المفروض يشيلهم، بس ده رهان
مش ضمانة لما كل حاجة في ملف واحد.

الداتا اتنقلت بالحرف، مفيش سطر داتا اتغيّر. كل الـ imports في المشروع
اتوجّهت للملف المحدد (`config/cases`, `config/experience`, …)، و
`portfolio.ts` فضل barrel فأي import قديم لسه شغّال.

قيس الفرق بـ `npx @next/bundle-analyzer` — عندك الأرقام قبل وبعد دلوقتي.

---

## 6. `blog-utils.ts` و `blog-types.ts` كانوا نسخ مكررة كاملة

مش re-exports زي ما التعليقات بتقول — نسخ كاملة بالحرف. يعني كان فيه:

- تعريفين لـ `normalizePublicHref` (منطق المسارات مكتوب مرتين)
- `formatDate` مرتين، وكل واحدة **بكاش تواريخ منفصل** في الذاكرة
- `PdfResource` / `GalleryState` / `ChannelVideo` معرّفين مرتين

أي تعديل في واحد من غير التاني = الصفحتين يفترقوا في السلوك من غير ما
TypeScript يزعّق. الاتنين بقوا re-export من `core/config/shared.ts`.

---

## 7. `TimelineItem` كان `any` بالكامل

`app/components/experience/experience-section.tsx`

أكتر كومبوننت بيتكرر في الصفحة الرئيسية كان TypeScript مقفول جوّاه: حقل
اتغيّر اسمه في الداتا، أو تاريخ اتبعت كرقم، أو `tag` ناقص — مفيش حاجة
هتمسكه، هيرندر فاضي في الإنتاج وخلاص.

- `TimelineItemProps` صريح، و `TimelineEntry` مشتق من `knowledgeEducationItems`
  نفسها فمستحيل يفترقوا
- `key={index}` → `key={tag-startDate}` (الـ index بيكسّر الـ reconciliation
  أول ما عنصر يتضاف في النص)
- الـ inline style object اللي كان بيتخصّص كل render بقى class

**وبنية العناوين:** كل دور كان `<h2>` وكل جهة عمل `<h3>`. يعني الصفحة فيها
عشر `<h2>` إخوات تحت `<h2>` القسم نفسه — الـ outline مسطّح. بقى:

```
h1  الاسم
└── h2  経験 • Experience
    ├── h3  Information Security Intern
    │   └── h4  Banque Misr
    └── h3  SOC Analyst Intern …
```

الـ CSS اتحدّث معاها، الأحجام والسلوك زي ما هم بالظبط.

---

## 8. الـ loader كان بيعمل تلات حاجات غلط

`app/components/loader/sensei_loader.tsx`

- **`<LazyMotion>` مكرر.** `layout.tsx` مركّب `<MotionProvider>` فوق كل حاجة،
  والـ loader جوّاه — فده كان provider تاني زيادة، نفس المشكلة اللي اتشالت
  من `MotionInView` بالظبط.
- **`<h2>The Samurai Way.</h2>`** — الـ overlay بيتصدّر جوه الـ HTML، يعني ده
  كان **أول heading** أي crawler بيقابله على كل صفحة، فوق العنوان الحقيقي.
  بقى `<p>`، نفس الستايل.
- **`aria-live="polite"` حوالين ticker بيتغيّر كل 350ms** — الـ screen reader
  كان هيقرا ست سطور boot بصوت عالي قبل ما المستخدم يوصل لأي محتوى. بقى
  `aria-live="off"` والـ `bootText` بقى `aria-hidden`، والـ overlay بيعرّف
  نفسه مرة واحدة بالـ `aria-label`.

---

## 9. الـ cursor كان بيعمل DOM walk على كل pointermove

`app/components/custom-cursor.tsx`

`pointermove` بيتبعت مع كل عيّنة من الجهاز مش مع كل frame — ماوس ألعاب
1000Hz بيبعته ~1000 مرة في الثانية. والـ handler كان بيعمل **اتنين**
`closest()` على كل واحدة منهم، على الـ main thread، في نفس الوقت اللي
المستخدم بيـ scroll فيه.

- الـ motion values لسه بتتحدّث كل event (رخيصة، مفيش React render)
- الـ hit-testing اتلمّ في `requestAnimationFrame` واحد → 60 مرة في الثانية
  كحد أقصى مهما كان معدل الجهاز
- `cancelAnimationFrame` في الـ cleanup
- الـ `rotate: { repeat: Infinity }` كان بيفضل لفّان طول ما الماوس على أي
  لينك — rAF subscription دايم لتأثير محدش بيبصله وهو بيقرا. بقى لفّة
  واحدة 0.6s وبعدين بيقف.

---

## 10. `npm run lint` كان بيفشل

`app/core/components/Terminal.tsx` — الـ lazy initialiser بتاع `useState`
كان بيقرا **ويعدّل** `lineId.current` أثناء الـ render
(`react-hooks/refs`). مع concurrent rendering React ممكن يرمي نتيجة الـ
render، والـ ref بيفضل شايل الزيادات من render متعملش commit — فالـ ids
بتتصادم مع سطور حقيقية بعدين.

الـ banner ids معروفة من الأول، فمفيش داعي للـ ref أصلاً — العدّاد بيبدأ
بعدها.

---

## اللي **مش** متعمّل، وليه

| البند | السبب |
|---|---|
| responsive `srcset` للصور | محتاج تشغّل سكربت الـ Python الأول عشان يطلّع أحجام متعددة. الـ custom loader جاهز في التقرير الأول، سطرين. ده لسه أكبر مكسب متبقّي. |
| ملّي `certifications.ts` | محتاج أسماء الشهادات وروابط التحقّق منك. |
| الـ ATT&CK matrix | محتاج `attack: ["T1566.001", …]` على كل case. لو موافق أعملها. |
| كل حاجة ليها علاقة بالمسارات | قلت سيبها. |
