/*
 * app/not-found.tsx
 *
 * الموقع كان بيستخدم صفحة 404 الافتراضية بتاعة Next — النص الأسود الصغير
 * اللي في نص شاشة فاضية.
 *
 * ودي مش صفحة هامشية هنا: GitHub Pages بيرجّع `404.html` لأي مسار مش
 * موجود، يعني دي الصفحة اللي بيشوفها أي حد جاي من لينك قديم، أو من عنوان
 * فيه خطأ مطبعي، أو من عنوان اتغيّر (زي اللي حصل بالظبط مع
 * /blog/soc-analyst-cv). وفي الحالات دي الزائر غالباً حد بيدوّر على شغلك
 * — أسوأ حاجة تقدمهاله هي طريق مسدود.
 *
 * الصفحة دي بتديله طرق فعلية يكمّل بيها.
 *
 * Server Component: صفر جافاسكريبت.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { startHere } from "@/app/core/config/start-here";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found — Ahmed Emad Nasr",
  // noindex: مفيش فايدة من فهرسة صفحة خطأ
  robots: { index: false, follow: true },
};

const KNOWN = new Set(caseEvidenceLibrary.map((item) => item.id));
const SUGGESTIONS = startHere.filter((entry) => KNOWN.has(entry.id)).slice(0, 3);

export default function NotFound() {
  return (
    <main className={styles.page} id="main-content">
      <div className={styles.inner}>
        <p className={styles.code} aria-hidden="true">404</p>

        <h1 className={styles.title}>This page doesn&apos;t exist</h1>
        <p className={styles.lede}>
          The link may be outdated, or the address may have a typo. Everything
          below still works.
        </p>

        <nav className={styles.actions} aria-label="Main destinations">
          <Link href="/" className={styles.primary}>Portfolio</Link>
          <Link href="/blog" className={styles.secondary}>Case library</Link>
          <Link href="/cv" className={styles.secondary}>CV</Link>
        </nav>

        {SUGGESTIONS.length > 0 && (
          <section className={styles.suggest} aria-labelledby="nf-suggest">
            <h2 className={styles.suggestTitle} id="nf-suggest">
              Or start with one of these
            </h2>
            <ul className={styles.suggestList}>
              {SUGGESTIONS.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/blog/${entry.id}`}>{entry.label}</Link>
                  <span className={styles.suggestWhy}>{entry.why}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className={styles.report}>
          Landed here from a link on this site?{" "}
          <a href="mailto:ahmed.em.nasr@gmail.com?subject=Broken%20link%20on%20portfolio">
            Tell me which one
          </a>{" "}
          and I&apos;ll fix it.
        </p>
      </div>
    </main>
  );
}
