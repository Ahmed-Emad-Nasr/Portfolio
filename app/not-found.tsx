/*
 * File: not-found.tsx
 * Purpose: Custom cinematic 404 page for missing routes
 */

"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.glow} aria-hidden="true" />
      <section className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Page Not Found</h1>
        <p className={styles.description}>
          The page you’re looking for doesn’t exist or may have been moved.
          Let’s get you back to the main portfolio flow.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>Back to Home</Link>
          <Link href="/#Projects" className={styles.secondaryBtn}>View Projects</Link>
          <Link href="/#Contact" className={styles.secondaryBtn}>Contact Me</Link>
        </div>
      </section>
    </main>
  );
}
