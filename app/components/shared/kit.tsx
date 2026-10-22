/*
 * components/shared/kit.tsx
 *
 * The Sensei-Dev design language, gathered for the pages the original theme
 * does not have (case library, case pages, CV, legal pages). Every class here
 * is copied from a component of the original — the source is noted on each —
 * so these pages read as part of the same site.
 */

import type { ReactNode } from "react";
import SiteNav from "@/app/components/header/SiteNav";
import { FooterBar } from "@/app/components/header/ContactFooter";

/* Chips — WorkShowcase / ServicesSection */
export const chipTertiary =
  "px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-tertiary bg-tertiary/10 border border-tertiary/25";
export const chipAccent =
  "px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-accent bg-accent/10 border border-accent/25";
export const chipNeutral =
  "px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-foreground/60 bg-foreground/[0.04] border border-foreground/10";

/* Buttons — WorkShowcase card actions, HeroSection CTAs */
export const btnPrimary =
  "btn-sheen inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors";
export const btnOutline =
  "inline-flex items-center gap-2 px-4 py-2.5 border border-foreground/15 text-foreground/70 font-mono text-[0.625rem] uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors";
export const ctaPrimary =
  "interactive btn-sheen group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-primary text-white font-mono font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-2xl shadow-primary/25 hover:bg-[#d60030] hover:-translate-y-0.5 active:translate-y-0";
export const ctaSecondary =
  "interactive group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0";

/* Filter tabs — WorkShowcase */
export const filterTab = (active: boolean) =>
  `px-5 py-2.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${
    active
      ? "bg-primary text-white border-primary"
      : "bg-foreground/[0.03] text-foreground/70 border-foreground/10 hover:border-primary/50 hover:text-foreground"
  }`;

/* Card surface — WorkShowcase / ProjectCard (used with TiltCard) */
export const cardSurface =
  "spotlight group relative bg-surface/60 border border-foreground/5 hover:border-primary/40 transition-colors duration-500";

/* Small label row — the "eyebrow" inside cards and blocks */
export function Eyebrow({ children, japanese }: { children: ReactNode; japanese?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
      <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">{children}</span>
      {japanese && (
        <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp={japanese} />
      )}
    </div>
  );
}

/* Counter box with corner brackets — ProjectsGrid / FaqSection / ArtGallery */
export function CounterBadge({
  value,
  top,
  bottom,
  tone = "primary",
}: {
  value: string | number;
  top: string;
  bottom: string;
  tone?: "primary" | "accent";
}) {
  const border = tone === "accent" ? "border-accent" : "border-primary";
  const text = tone === "accent" ? "text-accent" : "text-primary-ink";
  return (
    <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm w-fit">
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${border}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${border}`} />
      <div className="flex items-center gap-3">
        <span className={`font-mono ${text} text-2xl font-black tabular-nums`}>
          {typeof value === "number" ? String(value).padStart(2, "0") : value}
        </span>
        <div className="flex flex-col">
          <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">{top}</span>
          <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">{bottom}</span>
        </div>
      </div>
    </div>
  );
}

/* Faded vertical kanji behind a section — every section of the original */
export function KanjiWatermark({ chars, side = "right" }: { chars: string; side?: "left" | "right" }) {
  return (
    <div
      className={`absolute ${side === "right" ? "right-8" : "left-8"} top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text`}
      aria-hidden="true"
      lang="ja"
    >
      {[...chars].map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

/* Page frame for every route except the home page: the floating nav, the
   page itself, and the footer bar. */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <>
      <SiteNav />
      <main id="main-content" className={`relative w-full bg-background text-foreground overflow-x-hidden ${className}`}>
        <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.015] scanlines" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02] neural-grid" aria-hidden="true" />
        {children}
      </main>
      <footer className="relative bg-background px-6 md:px-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <FooterBar />
        </div>
      </footer>
    </>
  );
}
