# خطة تحسين الموبايل — دليل التطبيق

كل الملفات في `app/` و `scripts/` بنفس مسارات المشروع — فكّ الضغط في جذر
المشروع على طول. فولدر `_PATCHES` فيه تعليمات تعديل لملفات موجودة، مش
ملفات بديلة، وبيتمسح بعد ما تخلص.

---

## الترتيب

### ١. بدّل الملفات دي بالكامل

```
app/core/hooks/useDeviceTier.ts
app/layout.tsx
app/components/cursor-mount.tsx
app/components/loader/sensei_loader.tsx
```

### ٢. طبّق تعديلات globals

```
_PATCHES/1-globals.css.md
   ← تعديل واحد (قاعدة `section`) + إضافتين على app/globals.css
```

### ٣. ضيف كتلة CSS في آخر ملف الـ loader

```
_PATCHES/2-sensei_loader.module.css.md
   ← انسخ الكتلة في آخر app/components/loader/sensei_loader.module.css
```

### ٤. صورة الـ LCP (اختياري بس مكسبه كبير)

```
npm i -D sharp
node scripts/generate-hero-sizes.mjs
   ← بعدين طبّق _PATCHES/3-sensei-home.tsx.md
```

### ٥. امسح فولدر `_PATCHES` بعد ما تخلص

ملفات الـ patch اتحفظت بامتداد `.md` عن قصد: لو كانت `.tsx` كان
`next build` هيعمل typecheck عليها ويفشل، لأن جواها استيرادات مكرّرة
و JSX على مستوى أعلى — دي تعليمات، مش كود شغّال.

---

## بعد التطبيق — اتأكد من الحاجات دي

```bash
npm run build
```

**١. السكربت موجود في الـ HTML المصدَّر:**

```bash
grep -o 'data-tier' out/index.html | head
```
لازم يطلع نتيجة. لو مطلعش، Next مدمجش الـ `<head>`.

**٢. الـ loader مش بيتشاف على الموبايل:**
افتح الصفحة في DevTools بوضع الموبايل → `<html>` لازم يبقى فيه
`data-tier="low"` من أول فريم، والـ `.loader` مخفي.

**٣. مفيش hydration warning:**
شغّل `npm run dev` وبُص على الـ console. لو ظهر warning عن `<html>`،
اتأكد إن `suppressHydrationWarning` موجودة.

**٤. srcset اتولّد فعلاً (لو عملت خطوة ٤):**
```bash
grep -o 'srcset="[^"]*3omda[^"]*"' out/index.html
```

---

## حاجتين محتاج أتأكد منهم

**`next.config`** مش موجود في الـ rar اللي بعتّه. التعديل بتاع صورة الـ hero
مبني على إن `images.unoptimized: true` موجود فيه (وده إجباري مع
`output: "export"`). لو مش موجود، `unoptimized={failed}` في الـ patch
هيبقى زيادة من غير ضرر — بس الـ loader المخصّص هيشتغل عادي.

كمان اتأكد إن `basePath: "/Portfolio"` موجود، لأن `normalizePublicHref`
بيقرا `NEXT_PUBLIC_BASE_PATH` وبيرجع لـ `"/Portfolio"` في الإنتاج.

**الأرقام التفصيلية من PageSpeed** — اللقطة مقطوعة عند كلمة METRICS.
LCP / TBT / CLS / Speed Index هما اللي هيقولوا إيه اللي اتحسّن فعلاً
وإيه اللي لسه محتاج شغل.

---

## ملخّص التعديلات

| # | المشكلة | التأثير المتوقّع |
|---|---------|------------------|
| ١ | `data-tier` بيتكتب بعد الـ hydration، فميزانية الحركة مبتتفعّلش في النافذة الحرجة | TBT، Speed Index |
| ٢ | `content-visibility: auto` على `<section id="Home">` — الـ hero فوق الطية | LCP، CLS |
| ٣ | الـ loader بيستنى حدث `load` (كل الصور، حتى اللي تحت الطية) | FCP، Speed Index |
| ٤ | صورة الـ LCP بمقاس واحد لكل الأجهزة + `sizes` متعارضة مع الـ CSS | LCP |
| ٥ | chunk المؤشر المخصص بيتحمّل على التليفون وبيرجع من غير ما يعمل حاجة | TBT |
| ٦ | خمس ملفات خطوط بأولوية عالية بتزاحم صورة الـ LCP | LCP |

**تنبيه على المقايضات:** التعديل رقم ١ معناه إن التليفونات كلها بقت
`"low"` — يعني الحلقات الدوّارة والـ particles والـ scanlines في الـ hero
مش هتظهر على الموبايل خالص، والـ backdrop-filter مقفول. ده كان **بالفعل**
سلوك الموقع على الأجهزة الضعيفة؛ اللي اتغيّر هو إن التليفونات دلوقتي كلها
داخلة في الفئة دي. لو عايز ترجع الزخرفة للتليفونات القوية، غيّر
`PHONE_MAX_WIDTH` أو شيل شرط `isCoarse && innerWidth <= 900` من
`detectTier()` **والسكربت** مع بعض — لازم يفضلوا متطابقين.
