# ١ — تفاعل الكروت

**ضيف في آخر `app/globals.css`.**

بيشتغل بـ attribute: `data-fx="card"`. مش بمحدد زي `[class*="card"]`
لأن ده بطيء وبيتكسر مع تهشير CSS Modules — نفس السبب اللي شلته عشانه من
قسم ٦ في تنضيف الـ CSS.

```tsx
<article className={styles.pdfCard} data-fx="card">
```

---

## الكود

```css
/*--------- 16. تفاعل الكروت ---------*/
/*
 * أربع حركات بتشتغل مع بعض على الـ hover:
 *
 *   1. الكارت بيرتفع            transform
 *   2. الخط الجانبي بيمتد       transform: scaleY على ::before
 *   3. لمعة بتعدّي              transform: translateX على ::after
 *   4. الحدود بتنوّر            border-color
 *
 * التلاتة الأولى compositor خالص. الرابعة بتسبب paint على شريط ١px —
 * أرخص بمراحل من box-shadow اللي هو الاختيار البديهي، لأن الظل بيتعاد
 * رسمه على مساحة الكارت كلها وحواليه في كل فريم.
 *
 * الإحساس بالارتفاع جاي من الحركة مش من الظل. جرّبه — الفرق البصري
 * أقل بكتير مما تتخيّل، وفرق التكلفة كبير.
 */

[data-fx="card"] {
  position: relative;
  /* ضروري عشان اللمعة متخرجش بره الكارت. أغلب كروت الموقع عندها
     أصلاً — الكروت الجديدة محتاجاها. */
  overflow: hidden;
  transition:
    transform var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease);
}

/* الخط الجانبي.
   ::before مش border-left-width: تغيير عرض الحدود بيحرّك محتوى الكارت
   كله ٣ بكسل — layout في كل فريم. الـ pseudo-element بيتمدّد فوق
   المحتوى من غير ما يلمسه. */
[data-fx="card"]::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--main-color), var(--accent-color));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 380ms var(--motion-ease);
  pointer-events: none;
}

/* اللمعة. زاوية ١٠٥ درجة عشان تعدّي مايلة زي انعكاس ضوء حقيقي. */
[data-fx="card"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(var(--accent-color-rgb), 0.07) 50%,
    transparent 65%
  );
  transform: translateX(-100%);
  transition: transform 700ms var(--motion-ease);
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  [data-fx="card"]:hover {
    transform: translate3d(0, -4px, 0);
    border-color: rgba(var(--main-color-rgb), 0.4);
  }

  [data-fx="card"]:hover::before { transform: scaleY(1); }
  [data-fx="card"]:hover::after  { transform: translateX(100%); }

  /* صورة جوه الكارت بتكبر شوية. الحاوية عندها overflow: hidden
     فالتكبير بيقص من الحواف بدل ما يزحلق التخطيط. */
  [data-fx="card"]:hover :is(img, [data-fx-media]) {
    transform: scale(1.04);
  }
}

[data-fx="card"] :is(img, [data-fx-media]) {
  transition: transform 600ms var(--motion-ease);
  /* من غيرها الصورة بتطلع بره الحواف المدوّرة وقت التكبير */
  will-change: auto;
}

/*
 * لوحة المفاتيح.
 *
 * :focus-within بيمسك حالة إن أي لينك أو زرار جوه الكارت واخد الفوكس.
 * من غيرها الزائر اللي بيتنقّل بالـ Tab مبيشوفش أي رد فعل — الكارت
 * بيبقى تفاعلي للماوس بس.
 */
[data-fx="card"]:focus-within {
  border-color: rgba(var(--main-color-rgb), 0.4);
}
[data-fx="card"]:focus-within::before { transform: scaleY(1); }

/*
 * اللمس.
 *
 * مفيش hover على التليفون — الكارت كان هيفضل ميت. الضغطة بتدّي رد فعل
 * فوري: انكماش بسيط. ده مهم أكتر من الـ hover أصلاً لأن الزائر بيلمس
 * فعلاً، مش بيمرّ.
 */
@media (hover: none) {
  [data-fx="card"]:active {
    transform: scale(0.985);
    transition-duration: 90ms;
  }
  [data-fx="card"]::after { display: none; }
}

/* الأجهزة الضعيفة: الارتفاع والخط الجانبي بس. اللمعة تدرّج بيتحرك على
   مساحة الكارت كلها — أغلى حاجة في المجموعة. */
html[data-tier="low"] [data-fx="card"]::after { display: none; }
html[data-tier="low"] [data-fx="card"] :is(img, [data-fx-media]) { transition: none; }
html[data-tier="low"] [data-fx="card"]:hover :is(img, [data-fx-media]) { transform: none; }

@media (prefers-reduced-motion: reduce) {
  [data-fx="card"],
  [data-fx="card"]::before,
  [data-fx="card"]::after,
  [data-fx="card"] :is(img, [data-fx-media]) {
    transition: none;
    animation: none;
  }
  [data-fx="card"]:hover { transform: none; }
  [data-fx="card"]::after { display: none; }
  /* الحدود بتفضل بتنوّر — دي معلومة مش زخرفة، الزائر لازم يعرف
     إنه واقف على إيه. */
}
```

---

## الكروت اللي في الموقع

ضيف `data-fx="card"` على دول:

| الملف | العنصر |
|---|---|
| `blog/page.module.css` | `.pdfCard` · `.playlistCard` · `.videoCard` · `.insightCard` |
| `blog/BlogCard.module.css` | الكارت الرئيسي |
| `components/projects/` | `.single-project` |
| `components/experience/` | `.content` |
| `components/art_gallery/` | كارت المعرض |
| `blog/[slug]/case.module.css` | `.relatedCard` |

**خد بالك:** `.pdfCard` وإخواته عندهم `:hover` موجود أصلاً في
`blog/page.module.css` سطر ١٤٥ بيعمل `translateY(-3px)`. القاعدة الجديدة
بتعمل `-4px`. الاتنين هيتخانقوا حسب ترتيب التحميل.

امسح الـ hover القديم من `blog/page.module.css` لما تضيف الـ attribute،
أو غيّر القيمة هنا لـ `-3px` عشان تفضل متسقة مع باقي الموقع. أنا أميل
للتاني — `-3px` هي لغة الموقع الحالية ومفيش سبب أغيّرها.
