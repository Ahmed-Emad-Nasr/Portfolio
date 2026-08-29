# نتيجة الفحص على `public/` الحقيقي

شغّلت الفحصين على المجلد اللي بعتهولي. خلاص، مفيش تخمين تاني.

---

## اتصلح في الكود ✅

### 1. `My_Logo.webp` مكانش موجود خالص 🔴

```
public/Assets/art-gallery/Images/logo/  →  فيه ملف واحد بس: 3omda.webp
```

والكود كان بيشاور على `My_Logo.webp` في **١٢ مكان**: `layout.tsx` (٦)،
`page.tsx` (٢)، `blog/page.tsx` (٢)، `sensei-home.tsx`، `blog/[slug]/page.tsx`.

ده معناه إن **كل صور الـ Open Graph في الموقع كانت بتشاور على ملف مش
موجود** — كل مشاركة على لينكدإن أو تويتر أو واتساب بتطلع من غير صورة.
وكمان كانت صورة الاحتياط بتاعة الـ hero، وأيقونة الـ startup على iOS.

كلهم بقوا على `3omda.webp`.

### 2. الجاليري: 74 صورة والموجود 73

`image_display_thumb/` فيه `1.webp` لحد `73.webp`. الكود كان بيطلب 74.
الصورة رقم 74 كانت 404 على كل تحميل لقسم الشهادات.

`GALLERY_IMAGE_COUNT` بقى 73.

### 3. مسار احتياطي ميت في الجاليري

```
Assets/art-gallery/Images/image_display/       ← المجلد ده مش موجود أصلاً
Assets/art-gallery/Images/image_display_thumb/ ← ده الموجود
```

الكومبوننت بيعرض الـ thumb وبيرجع لـ `src` عند الخطأ — و`src` كان بيشاور
على مجلد مش موجود. يعني أول ما أي thumb يفشل، البديل بيعمل 404 كمان.

الاتنين بقوا على المجلد الموجود. لو رفعت الصور بالحجم الكامل بعدين، رجّع
السطر وهيشتغل.

### 4. + اللي اتصلح قبل كده من نفس الفحص

- مسافة زايدة في `.../ 21.webp`
- Serpent Stealer بترقيمين مختلفين (15 صورة مكسورة في صفحة الـ case)
- صورة Twitter card على مسار قديم
- `CaseShot` — حماية للـ thumbnails في صفحة الـ case

---

## اللي محتاج منك: ٦ ملفات PDF ⚠️

الست مجلدات دي **فيها صور بس، مفيهاش أي PDF**:

| الـ case | المجلد | فيه |
|---|---|---|
| AWS GuardDuty | `AWS-GaurdDuty/` | 9 صور |
| Bounty Hacker | `Bounty_Hacker/` | 16 صورة |
| Easy Peasy | `Easy_Peasy/` | 14 صورة |
| IAM Access Control | `IAM_Access_Control/` | 12 صورة |
| Offensive Security Intro | `Offensive_Security_Intro/` | 9 صور |
| Simple CTF | `Simple_CTF/` | 11 صورة |

يعني ست حالات على الموقع فيها زراير **"View PDF"** و**"Download"** بتوديك
على 404.

ملحوظة: `Amazon GuardDuty/` مش موجود خالص — صور الـ case دي في
`AWS-GaurdDuty/`، فمسار الـ PDF في الكود بيشاور على مجلد تاني أصلاً.

**قرارك:** ترفع الـ PDFs، ولا أخلي الزراير تختفي لما مفيش PDF؟ الحل
التاني شغل ٢٠ دقيقة وبيخلي الموقع سليم دلوقتي.

---

## أكبر مشكلة أداء في الموقع 🔴

```
⚠ 511 thumbnail(s) missing across 37 folder(s)
```

**ولا صورة واحدة في مكتبة الـ cases ليها نسخة مصغّرة.** صفر من ٧٦٢.

`getThumbnail()` بيحوّل `1.webp` لـ `1-thumb.webp`، والكومبوننتس بتعرض
النسخة دي. مفيش ولا واحدة موجودة، فكلها بترجع للصورة الكاملة.

يعني **صفحة البلوج بتحمّل ٧٨ صورة بالحجم الكامل** (39 كارت × صورتين).

| | |
|---|---|
| صور الـ cases بالحجم الكامل | **32.2 MB** |
| منها ليها thumbnails | **صفر** |

ودي بالظبط الحاجة اللي بقولك عليها من أول تقرير. دلوقتي عندي الرقم:
**32 ميجا من الصور بتتقدّم كـ thumbnails.**

**أكبر المجلدات:**

```
  5.5 MB  Malware Analysis and Prevention Strategy/
  2.9 MB  Data Exfiltiration Investigation/
  1.4 MB  BruteForce_Room/
  1.2 MB  AWS KMS/
  1.2 MB  Hidden Backdoor/
```

**الحل:** شغّل سكربت الصور بتاعك على `public/Assets/Cases/` كلها. هو
موجود عندك أصلاً (الـ README بيذكره) — محتاج بس يطلّع `X-thumb.webp` جنب
كل `X.webp`.

> `check:links` بقى بيعد دي **تحذير مش خطأ**، لأن فيه fallback فالصفحة
> شغالة. أي فحص بيفضل أحمر على حاجة مش كاسرة، الناس بتتجاهله.

---

## حاجتين تانيين لقيتهم في `public/`

### 452 ملف PNG مالهمش أي استخدام — 35 ميجا

```
png    35.0 MB   عبر 452 ملف
```

مفيش ولا واحد منهم مذكور في أي كود. كل الكود على `.webp`. دول نسخ قديمة
قاعدة جنب الـ webp في نفس المجلدات، بتتحمّل في الريبو وبتتنشر على GitHub
Pages من غير أي فايدة.

امسحهم بعد ما تتأكد إن الـ webp سليمة.

### الـ PDFs 100 ميجا

```
pdf   100.7 MB   عبر 36 ملف
```

دي أكبر حاجة في `public/` (من إجمالي 189 ميجا). مش مشكلة في حد ذاتها —
الزائر بيحمّل واحد بس لما يدوس — بس تستاهل تعدية بضاغط PDF، غالباً هينزلوا
للنص من غير فرق في الجودة.

---

## الحالة دلوقتي

```
Lint                    ✅
Type check              ✅
Build                   ✅  47 صفحة
Assets exist in public/ ⚠️  6 PDFs ناقصة (منك)
Internal links          ⚠️  نفس الـ 6 + تحذير الـ thumbnails
```

من 33 مشكلة، **27 اتصلحوا في الكود**. الباقي ٦ ملفات ناقصة عندك.

---

# تحديث أخير — الـ PDF بقى اختياري ✅

قلت إن الست حالات دي معملتش ليها تقارير. فبدل ما أشيل الزراير بإيدي من كل
مكان، خليت **وجود الـ PDF نفسه اختياري في النظام كله** — فالحالة الطبيعية
بقت "مفيش تقرير" مش "تقرير مكسور".

## اللي اتغيّر

**`href` بقى اختياري** في النوعين `PdfResource` و `CaseEvidence` (لازم
يفضلوا متطابقين، لأن مكتبة الـ cases بتترندر بنفس الكومبوننت).

**واتشال من الست حالات** في `cases.ts`.

وبعدها TypeScript نفسه هو اللي وقف عند كل مكان بيفترض وجود الـ PDF —
ودي فايدة الأنواع الصريحة: مكنش عندي أي فرصة أنسى مكان.

| المكان | قبل | بعد |
|---|---|---|
| `BlogCard` | زرارين دايماً | بيظهروا لو فيه PDF |
| `CaseArticle` | زرارين دايماً | بيظهروا لو فيه PDF |
| `BlogPdfLibrarySection` (الكارت المميز) | زرارين دايماً | بيظهروا لو فيه PDF |
| `sitemap.xml` | 39 PDF، منهم 6 مش موجودين | 33 PDF، كلهم موجودين |
| `blog/page.tsx` JSON-LD | `DigitalDocument` لكل case | للحالات اللي ليها ملف بس |
| `[slug]/page.tsx` JSON-LD | `associatedMedia` دايماً | بيتحط لو فيه ملف بس |

الـ sitemap مهم بالذات: عناوين بترجّع 404 جوه sitemap بتقلّل ثقة محرك
البحث في **باقي** العناوين اللي فيه.

## التأكيد من الـ HTML المولّد

```
— الحالات من غير PDF —
simple-ctf-writeup          View PDF: NO   Download: NO   Open case: yes
easy-peasy-ctf-writeup      View PDF: NO   Download: NO   Open case: yes
bounty-hacker-ctf-writeup   View PDF: NO   Download: NO   Open case: yes
iam-access-control-room     View PDF: NO   Download: NO   Open case: yes
offensive-security-intro    View PDF: NO   Download: NO   Open case: yes
aws-guardduty-setup         View PDF: NO   Download: NO   Open case: yes

— الحالات اللي ليها PDF —
soc127-pdf                  View PDF: yes  Download: yes  Open case: yes
lockbit-ransomware-forensics View PDF: yes Download: yes  Open case: yes
autopsy                     View PDF: yes  Download: yes  Open case: yes

— sitemap —
dead PDFs still listed: none
real PDFs listed: 33
```

الست حالات لسه ليها صفحاتها وصورها وتكنيكات ATT&CK بتاعتها — الزراير بس
هي اللي راحت.

## النتيجة النهائية

```
Lint                    ✅
Type check              ✅
Build                   ✅  47 صفحة
Assets exist in public/ ✅  Every referenced asset exists
Internal links          ✅  No broken internal links
```

**كل الـ 33 اتقفلوا.** فاضل تحذير واحد مش كاسر:

```
⚠ 511 thumbnail(s) missing across 37 folder(s)
```

وده الحاجة الوحيدة اللي محتاجة شغل منك: شغّل سكربت الصور على
`public/Assets/Cases/` عشان يطلّع `X-thumb.webp` جنب كل `X.webp`.
**32 ميجا من الصور بتتقدّم للزائر كـ thumbnails دلوقتي** — وده أكبر مكسب
أداء متبقّي في الموقع.
