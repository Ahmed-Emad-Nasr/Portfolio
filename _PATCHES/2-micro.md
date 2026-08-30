# ٢ — تفاعلات صغيرة في كل الموقع

الحاجات دي مش بتتلاحظ لوحدها. بتتلاحظ كلها مع بعض — الموقع بيبقى بيرد
عليك بدل ما يستنى.

كلها `transform` و`opacity`، وكلها ليها نسخة لمس ونسخة لوحة مفاتيح.

**ضيف في آخر `app/globals.css`.**

```css
/*--------- 17. تفاعلات صغيرة ---------*/

/* ═══ أ. الخط تحت اللينكات ═══
 *
 * بيترسم من الشمال لليمين بـ scaleX. البديل البديهي — text-decoration
 * أو تغيير عرض الحدود — بيسبب layout. الـ pseudo-element بـ transform
 * مجاني.
 *
 * data-fx="link" مش على كل <a> عن قصد: اللينكات اللي جوه كروت أو
 * أزرار عندها تفاعل خاص بيها والتنين هيتخانقوا.
 */
[data-fx="link"] {
  position: relative;
  display: inline-block;
}

[data-fx="link"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 320ms var(--motion-ease);
}

/* transform-origin بيتقلب بين الحالتين: بيترسم من الشمال، وبيتمسح
   ناحية اليمين. الخط بيحس إنه بيعدّي مش بيظهر ويختفي. */
[data-fx="link"]:hover::after,
[data-fx="link"]:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ═══ ب. السهم في لينكات "شوف أكتر" ═══
 *
 * السهم بيتحرك ناحية اليمين مع الـ hover على الأب. حركة صغيرة جداً
 * (3px) بس بتدّي إحساس الاتجاه.
 *
 * <a data-fx="link"><span>Read case</span> <span data-fx="arrow">→</span></a>
 */
[data-fx="arrow"] {
  display: inline-block;
  transition: transform var(--motion-fast) var(--motion-ease);
}

:is(a, button):hover [data-fx="arrow"],
:is(a, button):focus-visible [data-fx="arrow"] {
  transform: translateX(3px);
}

/* ═══ ج. التاجات والشيبس ═══
 *
 * `.skillTag` و`.chip` و`.attackChip` و`.badge`. الموقع مليان بيهم
 * وكلهم ساكنين دلوقتي.
 */
[data-fx="tag"] {
  transition:
    transform var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease),
    color var(--motion-fast) var(--motion-ease);
}

@media (hover: hover) and (pointer: fine) {
  [data-fx="tag"]:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--accent-color-rgb), 0.5);
    color: var(--accent-color);
  }
}

[data-fx="tag"]:active { transform: scale(0.94); transition-duration: 80ms; }

/* ═══ د. رد فعل الضغط على كل حاجة تفاعلية ═══
 *
 * دي أرخص حاجة في الملف وأكترهم إحساساً.
 *
 * على الموبايل مفيش hover خالص — الزائر بيلمس والموقع بيسكت. الانكماش
 * البسيط ده بيتحوّل من "ضغطت ومستني" لـ "ضغطت وحصل حاجة". ٤٠ms.
 *
 * :where() بيخلي الوزن صفر فمبيزاحمش أي قاعدة موضعية.
 */
:where(a, button, [role="button"], summary):active:not(:disabled) {
  transform: scale(0.97);
}

:where(a, button, [role="button"], summary) {
  transition: transform 120ms var(--motion-ease);
}

/* ═══ هـ. حقول الإدخال ═══
 *
 * فورم التواصل. الحقل بيرتفع شوية عند الفوكس — بيقول للزائر "إنت هنا"
 * من غير ما نغيّر الحدود بشكل يزحلق التخطيط.
 */
:where(input, textarea, select) {
  transition:
    transform var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease),
    background-color var(--motion-fast) var(--motion-ease);
}

:where(input, textarea):focus-visible {
  transform: translateY(-1px);
}

/* ═══ و. أيقونات السوشيال ═══ */
[data-fx="social"] {
  transition: transform var(--motion-fast) var(--motion-ease);
}

@media (hover: hover) and (pointer: fine) {
  [data-fx="social"]:hover { transform: translateY(-3px) rotate(-4deg); }
}

/* ═══ ز. الميزانية ═══ */
html[data-tier="low"] :where([data-fx="tag"], [data-fx="social"]):hover {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-fx="link"]::after,
  [data-fx="arrow"],
  [data-fx="tag"],
  [data-fx="social"],
  :where(a, button, [role="button"], summary),
  :where(input, textarea, select) {
    transition: none;
  }
  :where(a, button, [role="button"], summary):active { transform: none; }
  /* الخط تحت اللينك بيفضل بيظهر — ده معلومة مش زخرفة */
  [data-fx="link"]:hover::after,
  [data-fx="link"]:focus-visible::after { transform: scaleX(1); }
}
```

---

## فين تحطهم

| attribute | فين |
|---|---|
| `data-fx="link"` | لينكات المحتوى، `.proofLink`، `.backLink`، `.subTagLink` |
| `data-fx="arrow"` | `<span>` جوه أي لينك فيه سهم |
| `data-fx="tag"` | `.skillTag` · `.chip` · `.attackChip` · `.badge` · `.tag` |
| `data-fx="social"` | `.iconLinkedin` · `.iconInstagram` · لينكات يوتيوب |

القسمين (د) و(هـ) و(ز) **مش محتاجين أي تعديل في الـ JSX** — بيشتغلوا على
كل الموقع على طول.

---

## ابدأ بده

لو هتضيف حاجة واحدة بس من الملف كله، خليها القسم (د) — رد فعل الضغط.

سطرين، بيشتغلوا على كل زرار ولينك في الموقع من غير أي تعديل، وهما
الفرق الأكبر في الإحساس على الموبايل. باقي الملف تحسينات فوقهم.
