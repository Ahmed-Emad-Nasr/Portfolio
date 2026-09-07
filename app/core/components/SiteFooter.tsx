/*
 * SiteFooter.tsx
 *
 * Server Component — صفر جافاسكريبت.
 *
 * ── ليه اتضاف ──
 *
 * صفحتي الخصوصية والشروط اتعملوا، بس الموقع مكانش فيه footer خالص
 * (الوحيد كان جوه صفحة الـ CV). يعني الصفحتين كانوا هيبقوا موجودين في
 * الـ sitemap ومحدش يقدر يوصلهم بالتصفح.
 *
 * وثيقة قانونية مش قابلة للوصول = وثيقة مش موجودة عملياً. الغرض منها إن
 * الزائر يلاقيها، فلازم يبقى ليها لينك في كل صفحة.
 */

import Link from "next/link";
import { LEGAL_CONTACT } from "@/app/core/config/legal";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} {LEGAL_CONTACT.name}
        </p>

        {/* aria-label عشان قارئ الشاشة يفرّق بينها وبين التنقّل الرئيسي */}
        <nav className={styles.links} aria-label="Legal and contact">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <a href={`mailto:${LEGAL_CONTACT.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  );
}
