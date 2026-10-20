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
import type { Metadata } from "next";
import { startHere } from "@/app/core/config/start-here";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found — Ahmed Emad Nasr",
  // noindex: there's no point indexing an error page
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
          <Link href="/" data-fx="btn" data-btn="solid">Portfolio</Link>
          <Link href="/blog" data-fx="btn" data-btn="outline">Case library</Link>
          <Link href="/cv" data-fx="btn" data-btn="outline">CV</Link>
        </nav>

        {SUGGESTIONS.length > 0 && (
          <section className={styles.suggest} aria-labelledby="nf-suggest">
            <h2 className={styles.suggestTitle} id="nf-suggest">
              Or start with one of these
            </h2>
            <ul className={styles.suggestList} data-links="inline">
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
