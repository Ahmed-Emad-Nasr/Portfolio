# تغيير في package.json

حزم `@fortawesome/*` الأربعة **اتنقلوا من `dependencies` لـ `devDependencies`**،
واتضاف سكربت:

```json
"icons": "node scripts/generate-icons.cjs"
```

**ليه:** الموقع مبقاش بيستوردهم وقت التشغيل خالص. الحاجة الوحيدة اللي
بتستخدمهم هي `scripts/generate-icons.cjs` اللي بيطلّع
`app/core/icons/icon-data.ts` — وده بيتشغّل على جهازك لما تضيف أيقونة جديدة،
مش وقت الـ build ولا في المتصفح.

سيبهم متثبّتين عشان تقدر تشغّل `npm run icons`، بس هما مش جزء من اللي
بيتشحن للزائر.
