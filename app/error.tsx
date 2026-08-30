"use client";

/*
 * error.tsx — حدود الأخطاء على مستوى المسار
 *
 * الموقع كان فيه not-found.tsx وبس. يعني لو أي client component رمى
 * exception — والموقع فيه 28 منهم — الزائر كان بيشوف **صفحة بيضا فاضية**:
 * مفيش رسالة، مفيش زرار رجوع، مفيش حتى إشارة إن حاجة غلط حصلت.
 *
 * App Router بيدوّر على الملف ده تلقائياً. لازم يكون client component
 * (شرط من Next) وبياخد `reset` عشان يحاول يرندر الجزء اللي وقع تاني من
 * غير reload كامل.
 *
 * بيعيد استخدام not-found.module.css عشان الصفحتين يبقوا بنفس الشكل —
 * مفيش سبب لملف CSS تاني لصفحة بنفس التخطيط بالظبط.
 */

import { useEffect } from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /*
     * الموقع مصدَّر ثابت على GitHub Pages — مفيش سيرفر يستقبل تقارير
     * الأخطاء. الـ console هو المكان الوحيد المتاح، وهو كفاية: لو حد
     * بلّغك عن مشكلة تقدر تقوله يفتحه.
     *
     * لو ضفت خدمة مراقبة بعدين (Sentry مثلاً)، مكانها هنا.
     */
    console.error("[portfolio] unhandled error:", error);
  }, [error]);

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.inner}>
        <p className={styles.code} aria-hidden="true">ERR</p>

        <h1 className={styles.title}>Something broke</h1>
        <p className={styles.lede}>
          An unexpected error stopped this section from rendering. The rest of
          the site still works.
        </p>

        <nav className={styles.actions} aria-label="Recovery options">
          {/* reset بيحاول يرندر الجزء اللي وقع تاني من غير reload كامل —
              أغلب الأخطاء العابرة بتتحل بيه. */}
          <button type="button" className={styles.primary} onClick={reset}>
            Try again
          </button>
          <Link href="/" className={styles.secondary}>Portfolio</Link>
          <Link href="/blog" className={styles.secondary}>Case library</Link>
        </nav>

        {/* digest هو الهاش اللي Next بيولّده للخطأ. بيتعرض عشان لو حد
            بلّغك عن مشكلة يقدر يديك الرقم ده بدل وصف مبهم. */}
        {error.digest && (
          <p className={styles.report}>Error reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
