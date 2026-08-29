# مشاكل في README.md — محتاجة قرارك

مغيرتش الـ README لأن دي حاجات إنت اللي تقررها، بس كلها هتلخبط أي حد
بيقيّم المشروع.

## 1. الترخيص متناقض داخل نفس الملف 🔴

```
سطر 133:  This project is licensed under the GPL-3.0 license
سطر 278:  This project is released under the MIT License.
```

وملف `LICENSE` نفسه **GPL-3.0** (674 سطر، GNU GPL v3).

الفرق بينهم كبير: GPL بتفرض على أي حد يستخدم الكود إنه يفتح مشروعه، وMIT
مبتفرضش. حد بيفكر يستخدم أي حتة من الكود ده مش هيعرف يقرر — وده بيخلي
المشروع غير قابل للاستخدام عملياً.

**اختار واحد**، وخلي الملف والسطرين متطابقين.

## 2. تعليمات التثبيت بتوديك على ريبو تاني 🔴

```bash
git clone https://github.com/MostafaSensei106/Sensei-Dev.git
cd Sensei-Dev
```

ده مش الريبو بتاعك. أي حد بيتبع الخطوات هيحمّل مشروع حد تاني.

الصح:

```bash
git clone https://github.com/Ahmed-Emad-Nasr/Portfolio.git
cd Portfolio
```

## 3. اسم المشروع مش متسق

الملف بيقول **"Sensei-Dev Portfolio"** في العنوان وفي قسم المساهمة، و
`package.json` بيقول `sensei-106`، والموقع نفسه **"Ahmed Emad Nasr
Portfolio"**. تلات أسماء لمشروع واحد.

## 4. معلومات تقنية قديمة

```
سطر 114:  **Next.js 14**: For server-side rendering
```

المشروع على **Next.js 16** بـ **static export** — مفيش server-side
rendering أصلاً. والشارة اللي تحت في نفس الملف بتقول `Next.js-16` صح،
فالسطر ده متناقض مع الشارة اللي فوقه بأسطر.

## 5. خطوات مش موجودة في المشروع

```
cd app/image_optmization
pip install -r requirements.txt
python image_optimizer.py
```

المجلد ده مش موجود في اللي بعتهولي. لو السكربت اتشال أو اتنقل، الخطوات
دي لازم تتحدّث — خصوصاً إن ده بالظبط السكربت اللي محتاجينه للـ `srcset`.

## 6. حاجات ناقصة من الـ README

الحاجات الجديدة مش مذكورة:

- صفحة `/cv`
- خريطة تغطية ATT&CK
- `npm run check:assets` و `npm run check:links` — وهما أهم أمرين
  للحفاظ على الموقع سليم
- `npm run icons` لما تضيف أيقونة
- إن `caseEvidenceLibrary[].id` لازم يكون slug صالح (فيه حارس بيفشّل
  الـ build غير كده)
