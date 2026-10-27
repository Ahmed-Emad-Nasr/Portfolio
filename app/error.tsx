"use client";

/* Route-level error boundary: a message and a retry instead of a blank page */

import { useEffect } from "react";
import Link from "next/link";
import PageLink from "@/components/ui/PageLink";
import { RotateCcw } from "lucide-react";
import {
  statusActions, statusCode, statusInner, statusLede, statusPage, statusReport, statusTitle,
} from "@/components/ui/kit";
import { PageShell, ctaPrimary, ctaSecondary } from "@/components/ui/kit";

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
            <PageLink href="/blog#cases" className={ctaSecondary}>Case library</PageLink>
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
