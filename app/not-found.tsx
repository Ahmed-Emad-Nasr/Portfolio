/*
 * app/not-found.tsx
 *
 * The site used to use Next's default 404 page — the small black text
 * in the middle of an empty screen.
 *
 * And this isn't a marginal page here: GitHub Pages returns `404.html` for any path that
 * doesn't exist, so this is the page anyone sees coming from an old link, from a URL
 * with a typo, or from a URL that changed (exactly what happened with
 * /blog/soc-analyst-cv). In those cases the visitor is usually someone looking for your work
 * — the worst thing you can give them is a dead end.
 *
 * This page gives them real ways to continue.
 *
 * Server Component: zero JavaScript.
 */

import Link from "next/link";
import PageLink from "@/app/components/shared/PageLink";
import type { Metadata } from "next";
import { startHere } from "@/app/core/config/start-here";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { Home, FolderSearch, FileText } from "lucide-react";
import {
  statusActions, statusCode, statusInner, statusLede, statusPage, statusReport, statusTitle,
} from "@/app/core/status-page-ui";
import { PageShell, KanjiWatermark, ctaPrimary, ctaSecondary } from "@/app/components/shared/kit";

export const metadata: Metadata = {
  title: "Page not found",
  // noindex: there's no point indexing an error page
  robots: { index: false, follow: true },
};

const KNOWN = new Set(caseEvidenceLibrary.map((item) => item.id));
const SUGGESTIONS = startHere.filter((entry) => KNOWN.has(entry.id)).slice(0, 3);

export default function NotFound() {
  return (
    <PageShell>
      <section className={statusPage}>
        <KanjiWatermark chars="迷子" side="right" />
        <div className={statusInner}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
            <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">Error // Not found</span>
            <span className="jp-eyebrow text-[0.6875rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp="迷子" />
          </div>
          <p className={statusCode} aria-hidden="true">404</p>

          <h1 className={statusTitle}>This page doesn&apos;t <span className="text-primary italic">exist.</span></h1>
          <p className={statusLede}>
            The link may be outdated, or the address may have a typo. Everything
            below still works.
          </p>

          <nav className={statusActions} aria-label="Main destinations">
            <Link href="/" className={ctaPrimary}>
              <Home size={16} /> Portfolio
            </Link>
            <PageLink href="/blog#cases" className={ctaSecondary}>
              <FolderSearch size={14} className="text-primary-ink" /> Case library
            </PageLink>
            <Link href="/cv" className={ctaSecondary}>
              <FileText size={14} className="text-primary-ink" /> CV
            </Link>
          </nav>

          {SUGGESTIONS.length > 0 && (
            <section aria-labelledby="nf-suggest">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-[2px] bg-primary" aria-hidden="true" />
                <h2 id="nf-suggest" className="font-mono text-[0.625rem] text-primary-ink tracking-[0.35em] uppercase font-bold">
                  Or start with one of these
                </h2>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUGGESTIONS.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/blog/${entry.id}`}
                      className="group spotlight relative flex h-full flex-col bg-surface/60 border border-foreground/5 p-6 hover:border-primary/40 transition-colors duration-500"
                    >
                      <span className="font-display text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 mb-3">
                        {entry.label}
                      </span>
                      <span className="text-sm text-foreground/60 font-light leading-relaxed">{entry.why}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={statusReport}>
            Landed here from a link on this site?{" "}
            <a href="mailto:ahmed.em.nasr@gmail.com?subject=Broken%20link%20on%20portfolio">Tell me which one</a>{" "}
            and I&apos;ll fix it.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
