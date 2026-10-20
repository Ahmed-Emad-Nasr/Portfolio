"use client";

/*
 * error.tsx — route-level error boundary
 *
 * The site only had not-found.tsx. So if any client component threw an
 * exception — and the site has 28 of them — the visitor saw **a blank white page**:
 * no message, no back button, not even a hint that something went wrong.
 *
 * The App Router looks for this file automatically. It must be a client component
 * (a Next requirement) and it receives `reset` to try re-rendering the part that crashed without
 * a full reload.
 *
 * It reuses not-found.module.css so both pages look the same —
 * there's no reason for another CSS file for a page with exactly the same layout.
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
     * The site is a static export on GitHub Pages — there's no server to receive error
     * reports. The console is the only place available, and it's enough: if someone
     * reports a problem you can ask them to open it.
     *
     * If you add a monitoring service later (Sentry, for example), it goes here.
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
          {/* reset tries to re-render the part that crashed without a full reload —
              most transient errors are resolved by it. */}
          <button type="button" data-fx="btn" data-btn="solid" onClick={reset}>
            Try again
          </button>
          <Link href="/" data-fx="btn" data-btn="outline">Portfolio</Link>
          <Link href="/blog" data-fx="btn" data-btn="outline">Case library</Link>
        </nav>

        {/* digest is the hash Next generates for the error. It's shown so that if someone
            reports a problem they can give you this number instead of a vague description. */}
        {error.digest && (
          <p className={styles.report}>Error reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
