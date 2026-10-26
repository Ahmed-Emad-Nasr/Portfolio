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
 * It reads the same classes as not-found.tsx (core/status-page-ui.ts) so both
 * pages look the same.
 */

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import {
  statusActions, statusCode, statusInner, statusLede, statusPage, statusReport, statusTitle,
} from "@/app/core/status-page-ui";
import { PageShell, ctaPrimary, ctaSecondary } from "@/app/components/shared/kit";

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
    <PageShell>
      <section className={statusPage}>
        <div className={statusInner}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
            <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">Error // Runtime</span>
            <span className="jp-eyebrow text-[0.6875rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp="故障" />
          </div>
          <p className={statusCode} aria-hidden="true">ERR</p>

          <h1 className={statusTitle}>Something <span className="text-primary italic">broke.</span></h1>
          <p className={statusLede}>
            An unexpected error stopped this section from rendering. The rest of
            the site still works.
          </p>

          <nav className={statusActions} aria-label="Recovery options">
            {/* reset tries to re-render the part that crashed without a full reload —
                most transient errors are resolved by it. */}
            <button type="button" className={ctaPrimary} onClick={reset}>
              <RotateCcw size={16} /> Try again
            </button>
            <Link href="/" className={ctaSecondary}>Portfolio</Link>
            <Link href="/blog#cases" className={ctaSecondary}>Case library</Link>
          </nav>

          {/* digest is the hash Next generates for the error. It's shown so that if someone
              reports a problem they can give you this number instead of a vague description. */}
          {error.digest && (
            <p className={statusReport}>Error reference: {error.digest}</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
