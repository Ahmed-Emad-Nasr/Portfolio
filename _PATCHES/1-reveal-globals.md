# ١ — قواعد الظهور في globals.css

الحركة نفسها بتتعرّف مرة واحدة في `globals.css` مش في CSS module، لأنها
بتشتغل على `data-reveal` — وده attribute على عناصر في كل حتة في الموقع،
مش على كلاس مملوك لملف واحد.

**ضيف القسم ده في `app/globals.css` بعد قسم ٩ (ميزانية الحركة).**

```css
/*--------- 9b. ظهور العناصر مع الـ scroll ---------*/
/*
 * الحركة دي هي نفس `fadeInUp` بتاعة الـ hero بالظبط — نفس المسافة،
 * نفس الـ easing، نفس منطق التأخير المتدرّج. الفرق إنها بقت متاحة لكل
 * الموقع بدل ما تكون مكتوبة بالإيد في sensei-home.module.css.
 *
 * كل الحركة هنا `opacity` و`transform` بس. دول الخاصيتين الوحيدتين
 * اللي المتصفح بيحرّكهم على الـ compositor من غير layout ولا paint.
 * ده السبب إن الأنيميشن ده مجاني فعلاً على الموبايل — مش تفضيل جمالي.
 *
 * الجافاسكريبت دوره حاجة واحدة: يغيّر data-reveal من "pending" لـ "in"
 * مرة واحدة لما العنصر يدخل الشاشة. بعدها المتصفح بيكمّل لوحده.
 */

:root {
  --reveal-distance: 24px;
  --reveal-duration: 640ms;
  /* بيتظبط من الـ JSX على مستوى العنصر. الصفر هنا هو الافتراضي. */
  --reveal-delay: 0ms;
  --reveal-stagger: 60ms;
}

/*
 * الحالة الابتدائية.
 *
 * مشروطة بـ html[data-tier] عن قصد: الـ attribute ده بيتكتب بسكربت
 * inline في <head> قبل أول paint. لو الجافاسكريبت مقفول تماماً، الشرط
 * مبيتحققش والمحتوى بيتعرض عادي — مفيش حالة الموقع بيبان فاضي فيها.
 */
html[data-tier] [data-reveal="pending"] {
  opacity: 0;
}

html[data-tier] [data-reveal="pending"][data-reveal-variant="up"]    { transform: translate3d(0, var(--reveal-distance), 0); }
html[data-tier] [data-reveal="pending"][data-reveal-variant="down"]  { transform: translate3d(0, calc(var(--reveal-distance) * -1), 0); }
html[data-tier] [data-reveal="pending"][data-reveal-variant="left"]  { transform: translate3d(calc(var(--reveal-distance) * -1), 0, 0); }
html[data-tier] [data-reveal="pending"][data-reveal-variant="right"] { transform: translate3d(var(--reveal-distance), 0, 0); }
html[data-tier] [data-reveal="pending"][data-reveal-variant="scale"] { transform: scale(0.96); }
/* "fade" مالوش transform — opacity بس. أرخص واحدة، وهي الصح لأي حاجة
   جوه عنصر بيتحرك أصلاً (transform جوه transform بيعمل تداخل). */

/*
 * الظهور.
 *
 * `transform: none` مش `translate3d(0,0,0)`: الأولانية بتسيب المتصفح
 * يفك الطبقة بعد ما الحركة تخلص. التانية بتخلّي العنصر محتفظ بطبقة
 * compositor للأبد — وعلى صفحة فيها ٥٠ عنصر ده ٥٠ طبقة عايشة بتخصم من
 * نفس ميزانية الـ GPU اللي الـ scroll بيتنافس عليها.
 */
html[data-tier] [data-reveal="in"] {
  opacity: 1;
  transform: none;
  transition:
    opacity var(--reveal-duration) var(--motion-ease) var(--reveal-delay),
    transform var(--reveal-duration) var(--motion-ease) var(--reveal-delay);
}

/*
 * التدرّج داخل المجموعات — بـ CSS بالكامل، مفيش مؤقّتات جافاسكريبت.
 * RevealGroup بيحط --i على كل ابن، والحساب هنا.
 */
html[data-tier] [data-reveal-group="true"] > * {
  transition-delay: calc(var(--i, 0) * var(--reveal-stagger));
}

/*
 * سقف للتدرّج. من غيره قايمة ٥٠ عنصر × ٦٠ms يعني ٣ ثواني قبل ما آخر
 * واحد يبان — الزائر بيبقى وصل تحت الصفحة والعناصر لسه بتظهر.
 * بعد العنصر الـ ١٢ الكل بيظهر مع بعض.
 */
html[data-tier] [data-reveal-group="true"] > *:nth-child(n + 13) {
  transition-delay: calc(12 * var(--reveal-stagger));
}

/*
 * الشبكة الأمنية.
 *
 * الحالة الابتدائية (opacity: 0) موجودة في الـ HTML من السيرفر. لو الـ
 * bundle فشل يتحمّل لأي سبب — chunk مكسور، شبكة قطعت — الموقع كان
 * هيفضل **مخفي بالكامل**.
 *
 * القاعدة دي بتظهر كل حاجة بعد ٤ ثواني طول ما الجافاسكريبت مقالش إنه
 * اشتغل. أول ما Reveal يعمل mount بيحط data-reveal-ready على <html>،
 * فالقاعدة بتبطّل تطابق ومبتضربش أبداً في الحالة الطبيعية.
 */
html[data-tier]:not([data-reveal-ready]) [data-reveal="pending"] {
  animation: revealSafety 1ms linear 4s forwards;
}

@keyframes revealSafety {
  to { opacity: 1; transform: none; }
}

/*
 * ═══ الميزانية ═══
 *
 * التليفونات كلها tier="low" (شوف useDeviceTier). بس الظهور هنا مش
 * زخرفة — هو الفرق بين صفحة بتتبني قدام الزائر وصفحة بتظهر فجأة.
 *
 * فبدل ما نقفله خالص: opacity بس، ومدة أقصر. opacity هي أرخص خاصية
 * ممكن تتحرك أصلاً — مفيش layout، مفيش paint، مجرد دمج طبقتين.
 * وشيلنا التدرّج لأن على شاشة تليفون العناصر قريبة من بعض والتدرّج
 * بيبان كتأخير مش كإيقاع.
 */
html[data-tier="low"] [data-reveal="pending"] {
  transform: none;
}

html[data-tier="low"] [data-reveal="in"] {
  transition: opacity 280ms linear;
}

html[data-tier="low"] [data-reveal-group="true"] > *,
html[data-tier="low"] [data-reveal-group="true"] > *:nth-child(n + 13) {
  transition-delay: 0ms;
}

/*
 * reduced-motion: مفيش حركة خالص. مش نسخة أسرع — مفيش.
 * المحتوى بيبقى موجود من أول لحظة.
 */
@media (prefers-reduced-motion: reduce) {
  html[data-tier] [data-reveal="pending"],
  html[data-tier] [data-reveal="in"] {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none;
  }
}
```

---

## ملاحظة على الترتيب

القسم ده لازم ييجي **بعد** قسم ٩، مش قبله. قواعد `html[data-tier="low"]`
في القسمين ليها نفس الوزن، فاللي بعدين هو اللي بيكسب.
