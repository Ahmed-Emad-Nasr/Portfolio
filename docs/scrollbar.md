# شريط التمرير المخصص

**الملف:** `app/globals.css` — بدّل قسم ١٠ بالكامل بالكتلة اللي تحت.

---

## المشكلة في اللي موجود

```css
*::-webkit-scrollbar-thumb {
  background: rgba(var(--main-color-rgb), 0.45);
  border: 3px solid var(--bg-color);
}
```

عرض الشريط ١٠px، والـ `border: 3px` بلون الخلفية بياكل ٦ منهم. الباقي
**٤ بكسل** أحمر باهت (شفافية ٠.٤٥) على خلفية سودا — وده بالظبط الخيط
الرفيع اللي في اللقطة اللي بعتّها. مفيش track، مفيش hover، مفيش حالة
مضغوط. الافتراضي بتاع ويندوز كان أوضح منه.

وكمان: `scrollbar-color` بتاع فايرفوكس والـ webkit rules مش متطابقين
في اللون، فالموقع بيبان بشكلين مختلفين حسب المتصفح.

---

## البديل

```css
/*--------- 10. شريط التمرير ---------*/
/*
 * الشريط بيتعمله ستايل مرتين لأن المتصفحات اتقسمت:
 *
 *   · فايرفوكس  → scrollbar-width / scrollbar-color (معياري، تحكّم محدود)
 *   · كروم/سفاري/إيدج → ::-webkit-scrollbar (غير معياري، تحكّم كامل)
 *
 * القيمتين مضبوطين على نفس اللون عن قصد. قبل كده كانوا مختلفين،
 * فالموقع كان بيبان بشكلين حسب المتصفح.
 *
 * الشريط ده مقصود يكمّل ScrollProgress اللي فوق الصفحة، مش يزاحمه:
 * ده بيقول "إنت فين في الصفحة"، وده بيقول "إنت في أنهي قسم".
 * فالألوان متبادلة — الأحمر هنا، الذهبي هناك.
 */

/* فايرفوكس — أقصى اللي بيسمح بيه */
html {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--main-color-rgb), 0.55) rgba(255, 255, 255, 0.04);
}

/* كروم / سفاري / إيدج */
:where(*)::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

/*
 * الـ track: خطوط أفقية خفيفة تدّي إحساس المسطرة، وخط عمودي أحمر على
 * الحافة اليسرى بيربط الشريط بحدود الصفحة.
 *
 * التدرّجين ثابتين — مبيتحركوش مع الـ scroll — فالمتصفح بيرسمهم مرة
 * واحدة وبيكاشهم.
 */
:where(*)::-webkit-scrollbar-track {
  background:
    linear-gradient(90deg, rgba(var(--main-color-rgb), 0.35) 0 1px, transparent 1px),
    repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.05) 0 1px,
      transparent 1px 6px
    ),
    rgba(255, 255, 255, 0.03);
}

/*
 * الـ thumb: تدرّج أحمر ← ذهبي بنفس اتجاه الشريط، وفوقه شرطتين بيضتين
 * في النص — نفس فكرة "المقبض" في واجهات الـ HUD.
 *
 * `background-clip: padding-box` مع `border: 2px solid transparent`
 * بيدّي هامش حوالين الـ thumb من غير ما ياكل من عرضه زي ما كان
 * بيحصل مع `border: 3px solid var(--bg-color)` — الحيلة إن الـ border
 * الشفاف بيسيب الـ track يبان من تحته بدل ما يرسم فوقه.
 */
:where(*)::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  background:
    /* الشرطتين */
    linear-gradient(
      180deg,
      transparent calc(50% - 5px),
      rgba(255, 255, 255, 0.5) calc(50% - 5px) calc(50% - 4px),
      transparent calc(50% - 4px) calc(50% + 3px),
      rgba(255, 255, 255, 0.5) calc(50% + 3px) calc(50% + 4px),
      transparent calc(50% + 4px)
    ),
    /* الجسم */
    linear-gradient(
      180deg,
      rgba(var(--main-color-rgb), 0.9),
      rgba(var(--accent-color-rgb), 0.75)
    );
  background-clip: padding-box;
}

:where(*)::-webkit-scrollbar-thumb:hover {
  background:
    linear-gradient(
      180deg,
      transparent calc(50% - 5px),
      rgba(255, 255, 255, 0.75) calc(50% - 5px) calc(50% - 4px),
      transparent calc(50% - 4px) calc(50% + 3px),
      rgba(255, 255, 255, 0.75) calc(50% + 3px) calc(50% + 4px),
      transparent calc(50% + 4px)
    ),
    linear-gradient(180deg, var(--main-color), var(--accent-color));
  background-clip: padding-box;
}

/* الحالة المضغوطة — من غيرها مفيش أي رد فعل وقت السحب */
:where(*)::-webkit-scrollbar-thumb:active {
  background: var(--accent-color);
  background-clip: padding-box;
}

/* المربع اللي بين الشريط الرأسي والأفقي — افتراضياً أبيض على ويندوز */
:where(*)::-webkit-scrollbar-corner {
  background: var(--bg-color);
}

/*
 * الأجهزة الضعيفة: شريط مسطّح بلون واحد.
 *
 * التدرّجات الثلاثة اللي فوق بتترسم من جديد في كل فريم الـ thumb بيتحرك
 * فيه. على ديسكتوب ده صفر، على جهاز ضعيف ده جزء من ميزانية بتتحسب.
 */
html[data-tier="low"] ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
}

html[data-tier="low"] ::-webkit-scrollbar-thumb {
  background: rgba(var(--main-color-rgb), 0.7);
  background-clip: padding-box;
}

/*
 * الموبايل: مالوش شريط ظاهر أصلاً (بيطلع overlay ويختفي)، فالقواعد دي
 * كلها ميتة هناك. سايبينها من غير media query لأن المتصفح مبيحسبش
 * pseudo-element لعنصر مش موجود.
 */
```

---

## حاجة مقصودة

`scrollbar-gutter: stable` موجودة على `html` في قسم ٢. سيبها — من غيرها
الصفحة بتتزحلق أفقياً كل ما الشريط يظهر ويختفي بين صفحة قصيرة وطويلة.

---

## للتجربة

الفرق مبيبانش على شاشة صغيرة. افتح على ديسكتوب وانزل — الـ thumb لازم
يبقى تدرّج أحمر←ذهبي بشرطتين في نصه، والـ track خطوط رفيعة ورا.

وجرّب `data-tier="low"`: افتح DevTools → Rendering → فعّل
`prefers-reduced-motion`، أو غيّر الـ attribute على `<html>` بإيدك.
لازم يبقى أحمر مسطّح.
