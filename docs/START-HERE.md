# اقرا ده الأول

## التركيب

فك ضغط الملف ده **في جذر المشروع مباشرة** (نفس المكان اللي فيه
`package.json` و `next.config.mjs`) واسمح بالاستبدال.

```bash
# من D:\Ahmed Projects\Portfolio
unzip -o portfolio-final.zip
```

بعدها على طول:

```bash
npm install        # package.json اتغيّر — شوف docs/PACKAGE-NOTE.md
npm run verify     # lint + types + assets + build + links
```

المفروض تشوف:

```
✔ Every referenced asset exists in public/.
✔ No broken internal links.
```

## اللي في الملف ده

```
app/                    كود المشروع بعد كل التعديلات
scripts/                أربع سكربتات (تحت)
public/Assets/          530 صورة مصغّرة مولّدة — بتندمج مع اللي عندك
.github/workflows/      فحص آلي على كل push
package.json            سكربتات جديدة + FontAwesome اتنقل لـ devDependencies
docs/                   التوثيق
```

**مفيش أي ملف من ملفاتك بيتمسح.** الـ `public/Assets/` جواه صور
`-thumb.webp` بس، بتتحط جنب صورك من غير ما تلمسها.

## الأوامر الجديدة

```bash
npm run verify         السلسلة كاملة — شغّله قبل أي push
npm run check:assets   كل مسار في الكود موجود في public/؟
npm run check:links    كل لينك في الموقع المبني بيوصل؟
npm run thumbs         يولّد الصور المصغّرة الناقصة
npm run icons          يعيد توليد جدول الأيقونات لو ضفت أيقونة
```

## التوثيق

| الملف | فيه إيه |
|---|---|
| `CHANGES.md` | كل التعديلات عبر تسع جولات |
| `ASSET-FINDINGS.md` | الـ 33 مشكلة في الأصول وإزاي اتقفلت |
| `THUMBNAILS.md` | الصور المصغّرة والمكسب |
| `PACKAGE-NOTE.md` | ليه FontAwesome اتنقل لـ devDependencies |
| `CI-DEBUG.md` | لو الـ Verify وقع، ابدأ من هنا |
| `README-ISSUES.md` | **محتاج قرارك** — تناقض الترخيص وتعليمات التثبيت |

---

## ثلاث حاجات محتاجة منك

### 1. الترخيص متناقض 🔴

الـ README بيقول GPL-3.0 في سطر 133 وMIT في سطر 278، وملف `LICENSE` نفسه
GPL. وتعليمات التثبيت فيه بتقول:

```bash
git clone https://github.com/MostafaSensei106/Sensei-Dev.git
```

ده ريبو حد تاني. التفاصيل في `docs/README-ISSUES.md`.

### 2. أرقام الـ CV مختلفة عن الموقع

| | الموقع | الـ CV |
|---|---|---|
| ترتيبك في الدفعة | 5th من 900 | **8th** من 900 |
| تنبيهات DEPI | 150+ | **30+** |
| طلبة iSchool | 150+ | **470+** |

مسّيتش ولا رقم — دي أرقامك. بس أي حد يقرا الاتنين هيلاحظ.

### 3. ملفات ممكن تمسحها

| | الحجم | ليه |
|---|---|---|
| `public/Assets/Cases/thumbnails/` | 1.5 MB | 232 صورة من محاولة سابقة بأسماء `Folder__File.webp` — الكود مبيشاورش عليها |
| 452 ملف PNG في `public/Assets` | 35 MB | نسخ قديمة جنب الـ webp، مش مذكورين في أي كود |

**36 ميجا** بتتوفّر من الريبو ومن كل نشرة.

---

## حاجة لسه مش متأكد منها

أنا **مشفتش الموقع شغال ولا مرة** — كل الشغل مبني على قراءة كود وبناء
محلي واختبار. الجولتين الأخيرتين كانوا تصحيح لحاجات إنت شفتها وأنا
مشفتهاش (السكاشن اللزقة في الحواف، والخط الصغير).

فبعد ما ترفع: افتح `/cv` وقسم ATT&CK وصفحة case وابعتلي صور. ولو شغّلت
Lighthouse وبعتلي النتيجة، نبقى بنشتغل على أرقام حقيقية بدل تقديرات.
