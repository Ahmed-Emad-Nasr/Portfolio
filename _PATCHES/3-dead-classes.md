# ٣ — كلاسات معرّفة ومحدش بيستخدمها

تمن كلاسات في تلات ملفات. كلهم متأكّد منهم: مفيش `styles.X` ولا
`styles["X"]` ولا تركيب ديناميكي في أي ملف في المشروع.

> الكلاسات دي **مش** في القايمة، رغم إن الفحص السطحي بيقولها ميتة —
> بتتستخدم بتركيب ديناميكي:
> `difficulty-easy/medium/hard` (`styles[\`difficulty-${x}\`]`)،
> `in`/`out`/`dim` في الترمينال (`styles[line.kind]`)،
> `anchor` في BlogCard (`anchorStyles.anchor`، مش `styles.`).

---

## `app/components/experience/experience-section.module.css`

أربع كلاسات لحقول مالهاش وجود في الـ JSX: `japaneseRole` و`description`.
الغالب إنها بقايا شكل قديم للـ timeline.

امسح `.jpLabel` (سطر ٢١)، `.descIntro` (سطر ١٢٤)، `.jpTag` (سطر ١٤٠)،
و`.jpTagLabel` (سطر ١٥٣).

وامسح ذكر `.descIntro` من الـ media query عند سطر ١٩٤:

```diff
- .desc-list, .descIntro { font-size: 1.3rem; }
+ .desc-list { font-size: 1.3rem; }
```

---

## `app/components/home/sensei-home.module.css`

`.btnLoading` و`.spinner` (سطور ٣٩٦–٤٠٨) كانوا لزرار تحميل الـ CV.
الزرار اتشال خلاص — التعليق في `sensei-home.tsx` بيقول كده صراحةً:

> «handleDownloadClick + isDownloading اتشالوا مع زرار التحميل»

امسح الكتلتين، وكمان امسح معاهم:

* `@keyframes spin` — `.spinner` كان المستخدم الوحيد ليها
* `@keyframes spinnerPulse` (سطر ~٦٦٧) والتعليق اللي فوقها
* الكتلة دي من `@media (prefers-reduced-motion: reduce)` عند سطر ٧١٦:

```diff
-   .spinner {
-     animation: spinnerPulse 1.2s ease-in-out infinite !important;
-   }
```

اتأكد إن مفيش استخدام تاني لـ `spin` الأول:

```bash
grep -rn "animation:[^;]*\bspin\b" app/components/home/
```

---

## `app/components/projects/sensei-projects.module.css`

امسح `.sectionLead` (سطر ٩) و`.section-summary` (سطر ٢٦). سطر واحد لكل
واحدة.

---

## بعد ما تخلص

```bash
node scripts/css-audit.mjs
```

القسم الأول لازم يطلع نضيف.
