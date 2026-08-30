# ١ — هيدر البلوج بيستخدم نفس ملف CSS بتاع الهيدر الرئيسي

**المكسب:** ٥٬٠٥٠ بايت CSS أقل، وإصلاح باج في سفاري.

---

## المشكلة

الملفين دول:

```
app/components/header/sensei-header.module.css      5,235 بايت
app/blog/blog_header/sensei-header.module.css       5,050 بايت
```

**٩٨٪ متطابقين.** الفرق كله تلات سطور:

```
< -webkit-clip-path: polygon(0 0, 100% 0, calc(100% - 35px) 100%, 35px 100%);
< -webkit-clip-path: polygon(0 0, 100% 0, calc(100% - 34px) 100%, 34px 100%);
< -webkit-clip-path: none;
```

التلاتة دول **ناقصين من نسخة البلوج**. يعني شكل الـ trapezoid بتاع الهيدر
مكسور على سفاري في صفحات البلوج بس. ده مش اختلاف تصميم — ده الملف اتنسخ
ونسي جزء منه، وبعدين اتصلّح في نسخة واحدة بس. ده بالظبط اللي بيحصل لما
يبقى فيه مصدرين لنفس الحاجة.

## الحل

في `app/blog/blog_header/sensei-header.tsx` سطر ١٥، غيّر:

```diff
- import styles from "./sensei-header.module.css";
+ import styles from "@/app/components/header/sensei-header.module.css";
```

وبعدين امسح الملف:

```bash
rm app/blog/blog_header/sensei-header.module.css
```

**اتأكدت إن ده آمن:** الـ TSX بتاع البلوج بيستخدم ١٣ كلاس، وكلهم موجودين
في الملف الرئيسي. ومفيش كلاس في ملف البلوج مش موجود في الرئيسي.

---

## باج تاني ظهر في الفحص

سطر ١٢٠ في `app/blog/blog_header/sensei-header.tsx`:

```tsx
<span className={styles.navDivider} aria-hidden="true" />
```

`navDivider` **مش موجود في أي واحد من الملفين**. يعني الـ span ده بيترندر
دلوقتي بـ `class="undefined"` من غير أي ستايل — وده كان الحال قبل التعديل
ده كمان، مش نتيجة له.

قرّر إنت: يا إما تضيف القاعدة في الملف المشترك، يا إما تمسح الـ span.
الغالب إنك عايز الأولانية:

```css
/* فاصل بصري بين مجموعات اللينكات في الـ nav */
.navDivider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}
```
