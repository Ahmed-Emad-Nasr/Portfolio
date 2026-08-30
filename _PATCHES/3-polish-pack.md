# ٣ — لمسات إضافية

كلها `opacity` و`transform` بس. صفر layout، صفر paint، وكلها بتقفل
لوحدها على `data-tier="low"` و`prefers-reduced-motion`.

**ضيفها في آخر `app/globals.css`، قبل قسم الطباعة.**

---

## أ — لمعة الزراير (ده بيكمّل حاجة ناقصة أصلاً)

قاعدة `button` في قسم ٣ فيها التلات سطور دول:

```css
position: relative;
overflow: hidden;
z-index: 1;
```

التلاتة دول ملهمش أي معنى لوحدهم. `overflow: hidden` على زرار مفيهوش
حاجة بتخرج بره، و`z-index: 1` من غير عنصر تاني يزاحمه، و`position:
relative` من غير `absolute` جوّه.

ده تجهيز لـ pseudo-element **اتكتب ومحصلش**. الكود بيقول "هنا كان
المفروض يبقى فيه لمعة بتعدّي". تمامها:

```css
/*--------- 12. لمعة الزراير ---------*/
/*
 * الثلاث خصائص في قاعدة `button` (position/overflow/z-index) كانت
 * تجهيز للـ pseudo-element ده. من غيره كانوا بيتحسبوا على كل زرار في
 * الموقع من غير ما يعملوا حاجة.
 *
 * الحركة `transform: translateX` بس — بتتنفّذ على الـ compositor.
 * التدرّج نفسه ثابت ومبيتغيّرش، فالمتصفح بيرسمه مرة واحدة ويكاشه.
 */
button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(var(--accent-color-rgb), 0.18) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 600ms var(--motion-ease);
}

button:hover:not(:disabled)::before {
  transform: translateX(100%);
}

/* الأجهزة اللمسية مفيهاش hover — اللمعة كانت هتتعلّق في نص الحركة بعد
   أول ضغطة وتفضل واقفة هناك. */
@media (hover: none) {
  button::before { display: none; }
}

html[data-tier="low"] button::before { display: none; }
```

---

## ب — رفع الكروت

مش على كل كارت تلقائياً — ده هيتخانق مع الـ hover اللي موجود في ملفات
الـ modules. بيتفعّل بـ attribute:

```css
/*--------- 13. رفع الكروت ---------*/
/*
 * ضيف data-lift على أي كارت عايزه يستجيب:
 *   <article className={styles.card} data-lift>
 *
 * `translate3d` مش `translateY` عن قصد: التلاتية بتضمن إن المتصفح
 * يدّي العنصر طبقة compositor خلال الحركة. مع `translateY` بعض
 * المتصفحات بترسمه من جديد.
 *
 * ومفيش `box-shadow` في الحركة — الظل بيتعاد رسمه في كل فريم لأنه
 * مش خاصية compositor. الإحساس بالارتفاع جاي من الحركة نفسها ومن
 * الحدود اللي بتنوّر.
 */
[data-lift] {
  transition:
    transform var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease);
}

@media (hover: hover) and (pointer: fine) {
  [data-lift]:hover {
    transform: translate3d(0, -4px, 0);
    border-color: rgba(var(--main-color-rgb), 0.45);
  }
}

/* اللمس: رد فعل عند الضغط بدل الـ hover */
@media (hover: none) {
  [data-lift]:active { transform: scale(0.985); }
}

html[data-tier="low"] [data-lift] { transition: none; }
html[data-tier="low"] [data-lift]:hover { transform: none; }
```

---

## ج — رسم الخط تحت عناوين الأقسام

`.title::after` موجود في خمس ملفات modules وبيستخدم توكنز
`--title-underline-*` المشتركة. القاعدة دي بتخلّي الخط **يترسم** بدل ما
يظهر جاهز، وبتشتغل تلقائياً على أي عنوان جوه `<Reveal>`:

```css
/*--------- 14. رسم الخط تحت العناوين ---------*/
/*
 * بتشتغل على أي ::after جوه عنصر Reveal بعرض --title-underline-width.
 * مفيش أي تعديل مطلوب في الـ JSX ولا في ملفات الـ modules.
 *
 * `transform-origin: left` بيخلي الخط يترسم من الشمال لليمين. الحركة
 * بتبدأ بعد ٢٠٠ms عشان تيجي ورا ظهور العنوان نفسه مش معاه.
 */
html[data-tier] [data-reveal="pending"] :is(h1, h2, h3)::after {
  transform: scaleX(0);
  transform-origin: left center;
}

html[data-tier] [data-reveal="in"] :is(h1, h2, h3)::after {
  transform: scaleX(1);
  transform-origin: left center;
  transition: transform 520ms var(--motion-ease) 200ms;
}

html[data-tier="low"] [data-reveal] :is(h1, h2, h3)::after {
  transform: none;
  transition: none;
}
```

> **اختبرها قبل ما تعتمدها.** بعض ملفات الـ modules بتستخدم `::after`
> على العناوين لحاجات تانية غير الخط — أيقونة، رقم، شارة. لو لقيت حاجة
> بتتزحلق أو بتختفي، ضيّق المحدد لكلاس العنوان بتاعك:
>
> ```css
> html[data-tier] [data-reveal="in"] [class*="title"]::after { … }
> ```

---

## الميزانية

| اللمسة | الخاصية | التكلفة |
|---|---|---|
| لمعة الزراير | `transform` | compositor |
| رفع الكروت | `transform` + `border-color` | compositor + paint صغير على الحدود |
| رسم الخط | `transform` | compositor |
| الظهور مع الـ scroll | `opacity` + `transform` | compositor |

`border-color` هو الوحيد اللي بيسبب paint، وهو على شريط ١px حوالين
الكارت — أرخص بمراحل من `box-shadow` اللي كان الاختيار البديهي.

الأربعة كلهم بيتقفلوا على `data-tier="low"` و`prefers-reduced-motion`.

---

## اللي **مقلتش** أضيفه

**Parallax على الـ scroll.** بيحتاج قراءة `scrollY` وكتابة `transform`
في كل فريم — ده شغل جافاسكريبت مستمر طول الـ scroll، وهو بالظبط
العكس من الفكرة كلها.

**عدّادات بتعد لرقم.** بتعيد رندر عنصر ٦٠ مرة في الثانية وبتغيّر عرض
النص، فبتسبب layout في كل فريم.

**`filter: blur` في الظهور.** شكلها حلو، وهي أغلى خاصية ممكن تحركها.

**Magnetic buttons.** `mousemove` + `transform` = شغل مستمر على الـ
main thread طول ما الماوس بيتحرك.

الأربعة دول شايفهم في مواقع كتير، وكلهم بيتكلفوا بالظبط اللي إنت طالب
تتجنبه.
