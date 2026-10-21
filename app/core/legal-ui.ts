/*
 * core/legal-ui.ts — classes for the privacy and terms pages, in the
 * Sensei-Dev design language. The long-form text styling (.legal-copy)
 * lives in globals.css.
 */

export const legalPage = "relative px-6 md:px-20 pt-36 md:pt-44 pb-24 overflow-hidden";
export const legalSheet = "relative z-10 max-w-3xl mx-auto";
export const legalBackLink =
  "inline-flex items-center gap-2 mb-10 font-mono text-[10px] uppercase tracking-[0.3em] text-primary hover:text-foreground transition-colors";
export const legalTitle =
  "font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-foreground";
export const legalUpdated = "mt-5 mb-12 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40";

export const legalSummary =
  "legal-copy relative mb-14 bg-surface/60 border border-foreground/5 border-l-[3px] border-l-primary p-6 md:p-8 " +
  "[&_p]:mb-3 [&_p:last-child]:mb-0";

export const legalSection =
  "legal-copy mb-12 " +
  "[&_h2]:mb-5 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-foreground/10 " +
  "[&_h2]:font-mono [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.35em] [&_h2]:text-primary " +
  "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-black [&_h3]:uppercase [&_h3]:tracking-tight [&_h3]:text-foreground " +
  "[&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-2 " +
  "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-accent";
