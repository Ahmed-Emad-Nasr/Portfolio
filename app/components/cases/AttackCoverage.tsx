/*
 * AttackCoverage — the case library laid out on MITRE ATT&CK.
 *
 * A list of 76 reports says "I've done a lot". The same reports on ATT&CK say
 * "these are the tactics I can work, and here is the evidence for each" —
 * the shape of the question in a SOC interview. The mapping lives in
 * core/config/attack.ts and is computed at build time (library-data.ts).
 *
 * Layout: a kill-chain strip (all 15 Enterprise v19 tactics at a glance,
 * each a jump link), then one ledger row per tactic — the same row language
 * as the FAQ — with its techniques as heat-tinted tiles on an aligned grid.
 * The old layout put each tactic in a card of its own height, so the grid
 * was full of half-empty boxes; rows keep every tactic the same width and
 * the techniques lined up like the real matrix.
 *
 * A Server Component on purpose: each tile opens its evidence in a native
 * popover (popovertarget), so the section ships no JavaScript of its own —
 * only the FadeIn wrappers (the site's standard entrance) run on the client.
 * Styling for the repeated parts lives in globals.css (.attack-*).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import FadeIn from "@/app/core/components/FadeIn";
import { CounterBadge, KanjiWatermark } from "@/app/components/shared/kit";
import ScrambleText from "@/app/core/components/ScrambleText";

export type CoverageTechnique = {
  id: string;
  name: string;
  cases: { id: string; title: string }[];
};

export type CoverageTactic = {
  id: string;
  /** ATT&CK tactic id, e.g. TA0002 */
  ta: string;
  name: string;
  /** Label for the kill-chain strip, where the full name does not fit */
  short: string;
  /** 1-based position in the Enterprise ATT&CK kill chain */
  order: number;
  techniques: CoverageTechnique[];
};

type Props = {
  /** Every tactic in kill-chain order, covered or not */
  tactics: CoverageTactic[];
  techniqueCount: number;
  mappedCaseCount: number;
};

const attackUrl = (id: string) => `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;
const tacticUrl = (ta: string) => `https://attack.mitre.org/tactics/${ta}/`;
const pad = (n: number) => String(n).padStart(2, "0");
const popId = (id: string) => `attack-pop-${id.replace(".", "-")}`;

/* Tint strength for a tile or strip cell: 0 → faint, 1 → the strongest. */
const heat = (value: number, max: number): CSSProperties =>
  ({ "--heat": `${Math.round(5 + (value / max) * 20)}%` }) as CSSProperties;

function TechniqueTile({ technique, tactic, max }: { technique: CoverageTechnique; tactic: CoverageTactic; max: number }) {
  const count = technique.cases.length;
  const id = popId(technique.id);
  return (
    <li>
      <button type="button" popoverTarget={id} className="attack-tile" style={heat(count, max)}>
        <span className="attack-tile-top">
          <span className="attack-id">{technique.id}</span>
          {/* One pip per report — the evidence depth at a glance */}
          <span className="attack-pips" style={{ "--n": count, "--max": max } as CSSProperties} aria-hidden="true" />
        </span>
        <span className="attack-name">{technique.name}</span>
        <span className="attack-tile-foot">
          {count} {count === 1 ? "report" : "reports"}
          <span aria-hidden="true">→</span>
        </span>
      </button>

      <div
        id={id}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-title`}
        className="attack-pop"
        data-lenis-prevent=""
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">
            {`${tactic.ta} // ${tactic.name}`}
          </p>
          <button
            type="button"
            popoverTarget={id}
            popoverTargetAction="hide"
            className="attack-pop-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 font-mono text-xs font-black tracking-[0.2em] text-accent">{technique.id}</p>
        <h4 id={`${id}-title`} className="mt-1 font-display text-2xl md:text-3xl font-black uppercase tracking-tight leading-[0.95]">
          {technique.name}
        </h4>

        <p className="mt-6 mb-3 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-foreground/60">
          Evidence // {count} {count === 1 ? "report" : "reports"}
        </p>
        <ol className="attack-pop-cases">
          {technique.cases.map((c, i) => (
            <li key={c.id}>
              <Link href={`/blog/${c.id}`}>
                <span className="attack-pop-n">{pad(i + 1)}</span>
                <span className="flex-1">{c.title}</span>
                <span className="attack-pop-go" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>

        <a className="attack-pop-ext" href={attackUrl(technique.id)} target="_blank" rel="noopener noreferrer">
          {technique.id} on attack.mitre.org ↗
        </a>
      </div>
    </li>
  );
}

export default function AttackCoverage({ tactics, techniqueCount, mappedCaseCount }: Props) {
  const covered = tactics.filter((t) => t.techniques.length > 0);
  const max = Math.max(1, ...covered.flatMap((t) => t.techniques.map((x) => x.cases.length)));
  const maxPerTactic = Math.max(1, ...tactics.map((t) => t.techniques.length));

  return (
    <section
      id="attack"
      aria-labelledby="attack-title"
      className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden"
    >
      <KanjiWatermark chars="網羅" side="left" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── Header: same layout as every other section ─── */}
        <FadeIn
          x={-32}
          y={0}
          duration={0.7}
          className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
                <ScrambleText text="Coverage // MITRE ATT&amp;CK" />
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="網羅" />
            </div>
            <h2
              id="attack-title"
              className="font-display title-fit [--title-n:9] font-black tracking-tighter uppercase leading-[0.85]"
            >
              <span className="text-foreground">Mapped to</span> <br />
              <span className="text-primary italic">ATT&amp;CK.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/60 font-light leading-relaxed">
              The case library on the Enterprise matrix, in kill-chain order. Every tile is a technique backed by at
              least one report — open it to see the evidence.
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-col lg:items-end gap-3 shrink-0">
            <CounterBadge value={techniqueCount} top="Techniques" bottom="Mapped" />
            <CounterBadge value={`${covered.length}/${tactics.length}`} top="Tactics" bottom="Covered" />
            <CounterBadge value={mappedCaseCount} top="Reports" bottom="As evidence" tone="accent" />
          </div>
        </FadeIn>

        {/* ─── Kill-chain strip: the whole matrix at a glance ─── */}
        <FadeIn className="mb-14 md:mb-16">
          <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-foreground/60">
            <span>Kill chain // Enterprise v19</span>
            <span className="hidden sm:inline">Heat = techniques per tactic</span>
          </div>
          <ol className="attack-strip">
            {tactics.map((t) => {
              const n = t.techniques.length;
              return (
                <li key={t.id}>
                  <a
                    href={`#tactic-${t.id}`}
                    className="attack-seg"
                    data-off={n === 0 ? "" : undefined}
                    style={heat(n, maxPerTactic)}
                    title={`${t.ta} · ${t.name} — ${n} ${n === 1 ? "technique" : "techniques"}`}
                  >
                    <span className="attack-seg-n">{pad(t.order)}</span>
                    <span className="attack-seg-count">{n === 0 ? "—" : n}</span>
                    <span className="attack-seg-label">{t.short}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </FadeIn>

        {/* ─── The ledger: one row per tactic ─── */}
        <div className="border-t border-foreground/10">
          {tactics.map((t) => {
            const n = t.techniques.length;
            return (
              <FadeIn key={t.id} y={16} duration={0.5}>
                <div
                  id={`tactic-${t.id}`}
                  className={`attack-tactic grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-4 md:gap-8 py-6 border-b border-foreground/10 scroll-mt-28`}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[0.625rem] tabular-nums text-foreground/60 w-6 shrink-0">
                        {pad(t.order)}
                      </span>
                      <h3
                        className={`font-display text-lg font-black uppercase tracking-tight leading-tight ${
                          n === 0 ? "text-foreground/60" : "text-foreground"
                        }`}
                      >
                        {t.name}
                      </h3>
                    </div>
                    <p className="mt-2 pl-9 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-foreground/60">
                      <a
                        href={tacticUrl(t.ta)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                      >
                        {t.ta}
                      </a>{" "}
                      · {n === 0 ? "not covered" : `${n} ${n === 1 ? "technique" : "techniques"}`}
                    </p>
                  </div>

                  {n === 0 ? (
                    <p className="attack-empty">No report mapped to this tactic yet</p>
                  ) : (
                    <ul className="attack-grid">
                      {t.techniques.map((technique) => (
                        <TechniqueTile key={technique.id} technique={technique} tactic={t} max={max} />
                      ))}
                    </ul>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-foreground/60">
          <span className="flex items-center gap-3">
            <span className="attack-pips" style={{ "--n": 1, "--max": 1 } as CSSProperties} aria-hidden="true" />
            = one report · tint = depth of evidence
          </span>
          <span>
            Mapping per report · ATT&amp;CK Enterprise v19 ·{" "}
            <a
              href="https://attack.mitre.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-primary/50 hover:text-primary-ink"
            >
              attack.mitre.org
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
