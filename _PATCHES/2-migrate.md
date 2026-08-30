# ٢ — تحويل من MotionInView لـ Reveal

خمس ملفات فيها استخدامات. الـ API متقارب عن قصد عشان التحويل يبقى
استبدال مباشر في أغلب الحالات.

---

## جدول التحويل

| MotionInView | Reveal |
|---|---|
| `variant="slide-up"` | `variant="up"` (أو احذفها — دي الافتراضية) |
| `variant="slide-down"` | `variant="down"` |
| `variant="slide-left"` | `variant="left"` |
| `variant="slide-right"` | `variant="right"` |
| `variant="fade"` | `variant="fade"` |
| `variant="scale"` / `"scale-up"` | `variant="scale"` |
| `variant="stagger"` + أبناء | `<RevealGroup>` |
| `delay={0.3}` (ثواني) | `delay={300}` (ملي ثانية) |

**خد بالك من `delay`.** framer-motion بيقيس بالثواني، والـ CSS بالملي
ثانية. `delay={0.3}` بقى `delay={300}`. لو نسيت، `delay={0.3}` هتبقى
٠.٣ملي ثانية — يعني صفر عملياً، والحركة هتشتغل من غير تأخير بدل ما
تكسر. باج صامت، فراجعها.

---

## الملفات

### `components/experience/experience-section.tsx`

```diff
- import MotionInView from "@/app/core/components/MotionInView";
+ import Reveal from "@/app/core/components/Reveal";
```

سطر ٥٢: `<MotionInView className={...}>` → `<Reveal className={...}>`،
والقفلة في سطر ٩٥.

كل عنصر في الـ timeline بياخد `<Reveal>` لوحده هنا. ده صح — العناصر
متباعدة وكل واحد بيدخل الشاشة في وقت مختلف.

### `components/projects/sensei-projects.tsx`

نفس الحكاية. سطر ٧٠ و١٤٩.

### `components/art_gallery/sensei-art.tsx`

**ده أهم ملف في التحويل.** فيه أربع استخدامات متداخلة، والداخلي بيترندر
لحد ٥٠ مرة — يعني ٥٠ IntersectionObserver و٥٠ اشتراك في محرّك الأنيميشن.

سطر ٤٥ (`variant="stagger"`) بقى `<RevealGroup>`، والأبناء بتاعته
مبيلفّوش في `<Reveal>` — `RevealGroup` بيحط `--i` عليهم لوحده والتدرّج
بيحصل في الـ CSS.

```diff
- <MotionInView variant="stagger" className={styles.grid}>
-   {items.map((item) => (
-     <MotionInView key={item.id} variant="scale">
-       <ArtCard {...item} />
-     </MotionInView>
-   ))}
- </MotionInView>
+ <RevealGroup variant="scale" className={styles.grid}>
+   {items.map((item) => (
+     <ArtCard key={item.id} {...item} />
+   ))}
+ </RevealGroup>
```

النتيجة: **observer entry واحد بدل خمسين**، ونفس الشكل المتدرّج بالظبط.

> `RevealGroup` بيستخدم `React.cloneElement` عشان يحط `--i` — يعني
> الأبناء المباشرين لازم يكونوا عناصر React بتقبل `style`. لو `ArtCard`
> مش بيمرّر `style` للـ DOM، ضيفها:
> ```tsx
> function ArtCard({ style, ...props }) {
>   return <div className={styles.card} style={style}>…</div>;
> }
> ```

### `blog/components/BlogMediaSections.tsx` و `BlogPdfLibrarySection.tsx`

استبدال مباشر. كلهم `variant="fade"` أو بدون variant.

### `layout.tsx`

```diff
- import { MotionProvider } from "@/app/core/components/MotionInView";
```

**متشيلش `MotionProvider` دلوقتي.** لسه الـ loader بيستخدم
`AnimatePresence` و`m.div`. شيله بس لو حوّلت الـ loader كمان لـ CSS.

---

## بعد التحويل

`MotionInView.tsx` هيفضل مستخدم من الـ loader بس. سيبه.

للتأكد إن مفيش حاجة اتنست:

```bash
grep -rn "MotionInView\|motionVariants" app/ --include=*.tsx
```

المفروض يرجّع `core/components/MotionInView.tsx` و`components/loader/`
وبس.

---

## إيه اللي اتوفّر

على صفحة معرض الأعمال، قبل:

```
50 IntersectionObserver
50 اشتراك في محرّك framer-motion
50 عنصر بيتحرّك من الجافاسكريبت فريم بفريم
```

بعد:

```
1  IntersectionObserver (مشترك مع باقي الصفحة)
0  اشتراكات
0  شغل جافاسكريبت لكل فريم — الـ transitions على الـ compositor
```

الجافاسكريبت دوره بقى: يغيّر attribute مرة واحدة لكل عنصر.
