# ٢ — `.scrollBlurOverlay` أغلى تأثير في الموقع

**الملف:** `app/blog/page.module.css` سطور ٤٨–٦٠

---

## المشكلة

```css
.scrollBlurOverlay {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  backdrop-filter: blur(0px) saturate(100%);
  -webkit-backdrop-filter: blur(0px) saturate(100%);
  transition: backdrop-filter 300ms var(--motion-ease), opacity 300ms var(--motion-ease);
  opacity: 0;
}
.scrollBlurOverlay[data-active="true"] {
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
  opacity: 0.9;
}
```

تلات مشاكل في كتلة واحدة:

**أولاً، `transition` على `backdrop-filter`.** كل فريم في الـ ٣٠٠ms دي
المتصفح لازم يعيد رسم blur على مساحة `inset: 0` كاملة بقيمة blur مختلفة.
مفيش تسريع compositor هنا — كل فريم رسم جديد من الصفر. ده على شاشة كاملة.
`backdrop-filter` أصلاً أغلى خاصية في CSS؛ تحريكها بالـ transition هو أغلى
حاجة ممكن تعملها بيها.

**ثانياً، القيم مكتوبة بالإيد.** `blur(6px)` و`blur(3px)` مش بيمرّوا على
`--ui-blur`، يعني ميزانية الجهاز في `globals.css` مبتلمسهمش. تليفون على
`data-tier="low"` بيقفل كل blur في الموقع — ما عدا ده.

**ثالثاً، هو زخرفة.** تأثير blur بيظهر مع الـ scroll. مفيش معلومة بتضيع
لو اتشال.

---

## الحل

بدّل الكتلتين بدول:

```css
/* Scroll blur overlay (sits between background and content)
 *
 * كان عليه transition على backdrop-filter نفسه — إعادة رسم blur على
 * الشاشة كلها في كل فريم لمدة 300ms. دلوقتي الـ transition على opacity
 * بس (خاصية compositor، ببلاش)، وقيمة الـ blur ثابتة.
 *
 * والقيمة بقت من --ui-blur، فالـ overlay ده بقى داخل في ميزانية الجهاز
 * زي أي سطح زجاجي تاني: على تليفون --ui-blur = 0px والتأثير بيقفل لوحده.
 */
.scrollBlurOverlay {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  backdrop-filter: blur(var(--ui-blur)) saturate(120%);
  -webkit-backdrop-filter: blur(var(--ui-blur)) saturate(120%);
  transition: opacity 300ms var(--motion-ease);
  opacity: 0;
}

.scrollBlurOverlay[data-active="true"] {
  opacity: 0.9;
}
```

وامسح الكتلة دي بالكامل من الـ media query عند سطر ٣٨٠ — مبقاش ليها لازمة،
`--ui-blur` بيتظبط حسب الجهاز في `globals.css`:

```css
  /* امسح دي */
  .scrollBlurOverlay[data-active="true"] {
    backdrop-filter: blur(3px) saturate(120%);
    -webkit-backdrop-filter: blur(3px) saturate(120%);
  }
```

---

## نفس النمط في مكانين تانيين

`transition` على `filter` — أرخص من `backdrop-filter` بكتير لأنه بيشتغل على
العنصر نفسه مش على اللي وراه، بس لسه مش خاصية compositor:

```
app/blog/page.module.css:267    .primaryShot img, .shotThumb img
app/blog/page.module.css:276    .embedPreview img
app/blog/[slug]/case.module.css:170
```

دول grayscale بيتشال عند الـ hover. على الديسكتوب مقبولين. على الموبايل
مفيش hover أصلاً، فالـ transition ميت. لو عايز تقفلهم:

```css
@media (hover: none) {
  .primaryShot img, .shotThumb img, .embedPreview img { transition: none; }
}
```
