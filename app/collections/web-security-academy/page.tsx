/*
 * app/collections/web-security-academy/page.tsx
 *
 * The PortSwigger Web Security Academy labs as one track. Twenty-nine short
 * labs listed one by one in the library read as twenty-nine cases; grouped by
 * vulnerability class they read as what they are — a structured web-security
 * curriculum worked through end to end. Every lab keeps its own page.
 *
 * Server Component, static: built from cases.ts at build time.
 */

import type { Metadata } from "next";
import Link from "next/link";
import PageLink from "@/app/components/shared/PageLink";
import { ArrowLeft, ArrowUpRight, Images } from "lucide-react";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import { WSA_COLLECTION } from "@/app/core/config/shared";
import { PageShell, KanjiWatermark, CounterBadge, btnOutline } from "@/app/components/shared/kit";
import { absoluteUrl } from "@/app/core/config/site";
import { jsonLd, PERSON_REF } from "@/app/core/config/seo";

/* Vulnerability class per lab, in the order the Academy teaches them */
const CLASSES: { name: string; ids: string[] }[] = [
  { name: "SQL injection", ids: ["sqli-login-bypass"] },
  { name: "Authentication", ids: ["2fa-simple-bypass", "password-reset-broken-logic"] },
  { name: "Access control & IDOR", ids: ["unprotected-admin-functionality", "unprotected-admin-unpredictable-url", "user-role-request-parameter", "user-role-modified-profile", "user-id-controlled", "user-id-unpredictable", "user-id-data-leakage", "user-id-password-disclosure", "idor-live-chat"] },
  { name: "OS command injection", ids: ["os-command-injection-simple", "blind-os-injection-time-delays", "blind-os-injection-output"] },
  { name: "File upload", ids: ["rce-web-shell-upload", "web-shell-content-type-bypass"] },
  { name: "Information disclosure", ids: ["information-disclosure-module"] },
  { name: "Server-side request forgery", ids: ["basic-ssrf-local-server"] },
  { name: "XXE injection", ids: ["xxe-retrieve-files", "xxe-ssrf-aws-metadata"] },
  { name: "Cross-site scripting", ids: ["reflected-xss-html-context", "stored-xss-html-context", "dom-xss-document-write", "dom-xss-innerhtml-sink", "dom-xss-jquery-href"] },
  { name: "JWT attacks", ids: ["jwt-unverified-signature", "jwt-flawed-signature"] },
  { name: "OAuth", ids: ["oauth-implicit-flow-bypass"] },
];

const LABS = caseEvidenceLibrary.filter((c) => c.platform === WSA_COLLECTION.platform);
const BY_ID = new Map(LABS.map((c) => [c.id, c]));

/* Any lab added later without a class still shows, under "Other" */
const CLASSIFIED = new Set(CLASSES.flatMap((c) => c.ids));
const GROUPS = [
  ...CLASSES.map((c) => ({ name: c.name, labs: c.ids.map((id) => BY_ID.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x)) })),
  { name: "Other", labs: LABS.filter((c) => !CLASSIFIED.has(c.id)) },
].filter((g) => g.labs.length > 0);

const SHOTS = LABS.reduce((n, c) => n + (caseScreenshotsByEvidenceId[c.id]?.length ?? 0), 0);

const DIFF_TONE: Record<string, string> = {
  Easy: "text-tertiary border-tertiary/30",
  Medium: "text-accent border-accent/30",
  Hard: "text-primary-ink border-primary/40",
};

const DESCRIPTION = `${LABS.length} PortSwigger Web Security Academy labs solved and written up by Ahmed Emad Nasr, grouped by vulnerability class: access control, authentication, injection, XSS, XXE, SSRF, JWT and OAuth.`;

export const metadata: Metadata = {
  title: `${WSA_COLLECTION.title} — ${LABS.length} PortSwigger labs`,
  description: DESCRIPTION,
  alternates: { canonical: `/collections/${WSA_COLLECTION.id}` },
  openGraph: { title: `${WSA_COLLECTION.title} | Ahmed Emad Nasr`, description: DESCRIPTION, url: absoluteUrl(`/collections/${WSA_COLLECTION.id}`) },
};

const STRUCTURED = jsonLd({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: WSA_COLLECTION.title,
  description: DESCRIPTION,
  url: absoluteUrl(`/collections/${WSA_COLLECTION.id}`),
  author: PERSON_REF,
  hasPart: LABS.map((c) => ({ "@type": "TechArticle", headline: c.title, url: absoluteUrl(`/blog/${c.id}`) })),
});

export default function WebSecurityAcademyPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED }} />
      <article className="relative px-6 md:px-20 pt-36 md:pt-44 pb-24 overflow-hidden">
        <KanjiWatermark chars="道場" side="right" />
        <div className="max-w-5xl mx-auto relative z-10">
          <nav className="mb-10 flex flex-wrap items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.3em]" aria-label="Breadcrumb">
            <PageLink href="/blog#cases" className="group flex items-center gap-2 text-primary-ink hover:text-foreground transition-colors">
              <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" /> All cases
            </PageLink>
            <span className="text-foreground/20" aria-hidden="true">/</span>
            <span className="text-foreground/60">Collection</span>
          </nav>

          <header className="mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
                <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">PortSwigger · Collection</span>
                <span className="jp-eyebrow text-[0.6875rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp="修練" />
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95] text-foreground">
                Web Security <span className="text-primary italic">Academy.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/60 font-light leading-relaxed">
                The web-security track, lab by lab: what was broken, the payload that proved it, and the screenshots. Grouped by vulnerability class in the order the Academy teaches them.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <CounterBadge value={String(LABS.length)} top="Labs" bottom="Solved" />
              <CounterBadge value={String(SHOTS)} top="Screens" bottom="Evidence" />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-12 [&>*]:min-w-0">
            {GROUPS.map((g, gi) => (
              <section key={g.name} aria-labelledby={`wsa-${gi}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[0.625rem] font-bold text-primary-ink tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                  <h2 id={`wsa-${gi}`} className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">{g.name}</h2>
                  <span className="font-mono text-[0.625rem] text-foreground/60">{g.labs.length}</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-foreground/10 to-transparent" aria-hidden="true" />
                </div>
                <ul className="border border-foreground/10 divide-y divide-foreground/5 bg-surface/40">
                  {g.labs.map((lab) => (
                    <li key={lab.id}>
                      <Link href={`/blog/${lab.id}`} className="group grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_6rem_5rem_1.5rem] items-center gap-4 px-5 py-4 hover:bg-foreground/[0.03] transition-colors">
                        <span className="text-sm md:text-base text-foreground/85 group-hover:text-foreground transition-colors">{lab.title}</span>
                        <span className={`justify-self-start px-2 py-0.5 border font-mono text-[0.5625rem] uppercase tracking-[0.2em] ${DIFF_TONE[lab.difficulty] ?? "text-foreground/60 border-foreground/20"}`}>{lab.difficulty}</span>
                        <span className="hidden md:flex items-center gap-1.5 font-mono text-[0.625rem] text-foreground/60 tabular-nums">
                          <Images size={12} aria-hidden="true" /> {caseScreenshotsByEvidenceId[lab.id]?.length ?? 0}
                        </span>
                        <ArrowUpRight size={14} className="hidden md:block text-foreground/30 group-hover:text-primary-ink transition-colors" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <PageLink href="/blog#cases" className={btnOutline}>
              <ArrowLeft size={13} /> Back to the library
            </PageLink>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
