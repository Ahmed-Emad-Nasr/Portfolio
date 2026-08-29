# نتيجة `npm run check:assets` — تحليل الـ 33

أول حاجة، خبر كويس: **`Assets/cv/AhmedEmadNasr_CV.pdf` مش في القايمة.**
يعني الملف موجود، والسؤال اللي كنا بنلف حواليه من كام رسالة اتحسم.

الـ 33 الباقيين تلات أنواع مختلفة تماماً.

---

## النوع الأول: غلطة في السكربت بتاعي — اتصلحت ✅

```
Assets/...     referenced in app/components/art_gallery/sensei-art.tsx
Assets/…       referenced in app/layout.tsx
```

دول مش ملفات. دول **تعليقات أنا كاتبها** بتشرح مسارات، والسكربت حسبها
مراجع حقيقية. ضوضاء كانت بتغطي على المشاكل الحقيقية.

السكربت بقى بيشيل التعليقات قبل الفحص.

---

## النوع التاني: أخطاء حقيقية في الكود — اتصلحت ✅

### 1. مسافة زايدة في اسم ملف

```ts
image: "Assets/Cases/Malware Analysis and Prevention Strategy/ 21.webp"
                                                             ↑ مسافة
```

صورة الغلاف بتاعة الـ case ده كانت 404. اتشالت المسافة.

### 2. Serpent Stealer معرّف بترقيمين مختلفين 🔴

نفس الـ case، مكانين، أرقام مختلفة:

```ts
// سطر 124 — caseScreenshotsByEvidenceId
Array.from({ length: 12 }, (_, i) => `…/Screenshot (${135 + i}).webp`)   // 135–146

// سطر 566 — caseEvidenceLibrary[].screenshots
"…/Screenshot (1).webp",  "…/Screenshot (2).webp",  …  "(15).webp"      // 1–15
```

الملفات الحقيقية هي **135–146** (نسخة الـ 135 عدّت الفحص، ونسخة الـ 1–15 لأ).

يعني شبكة الصور في صفحة الـ case دي كانت بتعرض **15 صورة مكسورة**.

الليستة اليدوية اتشالت واتحطّ نفس التعبير بتاع سطر 124، فمستحيل الاتنين
يفترقوا تاني. و`image:` بقت `Screenshot (135).webp`.

### 3. صورة Twitter card لسه على المسار الغلط

```ts
// og:image — أنا ظبّطتها قبل كده
images: [toAbsoluteAssetUrl("/Assets/art-gallery/Images/logo/My_Logo.webp")]

// twitter:image — دي فاتتني
images: [toAbsoluteAssetUrl("/Assets/art-gallery/logo/logo.png")]   ❌
```

نفس المسار الغلط كان متكرر مرتين في نفس الملف، وأنا ظبّطت واحدة بس. اتظبطت.

---

## النوع التالت: ملفات ناقصة عندك — دي محتاجة قرارك ⚠️

السكربت مش قادر يعرف هل الملف مش متكوميت، ولا اسمه اتغيّر، ولا المسار في
الكود قديم. لكل واحد فيهم، افتح المجلد وشوف:

### أ) اللوجو — وده أخطرهم 🔴

```
Assets/art-gallery/Images/logo/My_Logo.webp
    مذكور في: layout.tsx (٣ مرات) · blog/page.tsx · sensei-home.tsx
```

**الملف ده مستخدم في كل صور الـ Open Graph في الموقع كله** — يعني كل
مشاركة على لينكدإن أو تويتر أو واتساب بتطلع من غير صورة. وكمان هو صورة
الاحتياط بتاعة الـ hero.

لاحظ إن السكربت **مقالش "اختلاف حروف"**، يعني مفيش ملف بنفس الاسم بحروف
مختلفة. الاحتمالات:

- الملف اسمه حاجة تانية خالص (`logo.webp`؟ `My_Logo.png`؟)
- المجلد `logo` مش تحت `Images/`

افتح `public/Assets/art-gallery/` وقولي إيه اللي جواه بالظبط.

### ب) صور الجاليري بالحجم الكامل

```
Assets/art-gallery/Images/image_display/     ← مش موجود
Assets/art-gallery/Images/image_display_thumb/  ← موجود (معدّاش في الفحص)
```

**الـ thumbnails موجودة والأصلية لأ.**

وده بيفسّر حاجة: الجاليري بيعرض الـ thumb افتراضياً وبيرجع للأصلية عند
الخطأ بس — عشان كده الحيطة شكلها سليم، والمشكلة بتبان في الـ lightbox
لما حد يكبّر صورة.

### ج) ستة ملفات PDF

```
Assets/Cases/Amazon GuardDuty/Amazon_GuardDuty.pdf
Assets/Cases/Bounty_Hacker/AhmedEmad_BountyHacker.pdf
Assets/Cases/Easy_Peasy/AhmedEmad_EasyPeasy.pdf
Assets/Cases/IAM_Access_Control/AhmedEmad_IAM_Access_Control.pdf
Assets/Cases/Offensive_Security_Intro/AhmedEmad_Offensive_Security_Intro.pdf
Assets/Cases/Simple_CTF/AhmedEmad_SimpleCTF.pdf
```

ستة تقارير زراير "View PDF" و"Download" بتوعهم بتوديك على 404.

المجلدات نفسها موجودة (مبلّغش عنها كمجلدات ناقصة)، يعني الـ PDF جواها
اسمه مختلف أو مش متكوميت.

---

## اللي محتاجه منك

شغّل الأمر ده وابعتلي الناتج:

```bash
ls "public/Assets/art-gallery"
ls "public/Assets/art-gallery/Images"
ls "public/Assets/Cases/Simple_CTF"
ls "public/Assets/Cases/Amazon GuardDuty"
```

من الأربع سطور دول هقدر أقولك أنهي منهم مسار غلط في الكود (أصلّحه أنا)
وأنهي منهم ملف ناقص فعلاً (ده عندك).

---

## ملحوظة عن `check:links`

الفحص التاني اللي وقع بيبلّغ عن **نفس** الملفات دي — لأنه بيفحص الروابط
في الصفحات المبنية، والصفحات بتشاور على نفس الأصول.

يعني مش مشكلتين، دي مشكلة واحدة بتظهر من مكانين. أول ما تتصلح الأصول،
الاتنين هيبقوا أخضر.
