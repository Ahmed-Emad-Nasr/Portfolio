/*
 * SiteFooter.tsx
 *
 * Server Component — zero JavaScript.
 *
 * ── Why it was added ──
 *
 * The privacy and terms pages were created, but the site had no footer at all
 * (the only one was inside the CV page). So the two pages would have existed in
 * the sitemap with nobody able to reach them by browsing.
 *
 * A legal document that can't be reached = a document that effectively doesn't exist. Its purpose is for
 * the visitor to find it, so it must have a link on every page.
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

        {/* aria-label so screen readers can tell it apart from the main navigation */}
        <nav className={styles.links} aria-label="Legal and contact">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <a href={`mailto:${LEGAL_CONTACT.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  );
}
