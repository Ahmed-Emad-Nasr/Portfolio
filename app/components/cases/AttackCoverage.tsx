/*
 * AttackCoverage — the case library laid out on MITRE ATT&CK.
 *
 * A list of 76 reports says "I've done a lot". The same reports on ATT&CK say
 * "these are the tactics I can work, and here is the evidence for each" —
 * the shape of the question in a SOC interview. The mapping lives in
 * core/config/attack.ts and is computed at build time (library-data.ts).
 *
 * A Server Component on purpose: each technique opens with a native
 * <details>, so the section ships no JavaScript of its own and adds nothing
 * to hydration — only the FadeIn wrappers (the site's standard entrance) run
 * on the client. Design: the Sensei-Dev card language used by the sections
 * around it — surface cards, mono labels, the red top rule.
 */

import Link from "next/link";
import FadeIn from "@/app/core/components/FadeIn";
import { CounterBadge, KanjiWatermark } from "@/app/components/shared/kit";

export type CoverageTechnique = {
  id: string;
  name: string;
  cases: { id: string; title: string }[];
};

export type CoverageTactic = {
  id: string;
  name: string;
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
const pad = (n: number) => String(n).padStart(2, "0");

function TechniqueRow({ technique, max }: { technique: CoverageTechnique; max: number }) {
  const count = technique.cases.length;
  /* Repeated ~30 times with ~90 case links, so the styling lives in
     globals.css (.attack-row …) instead of long utility lists and an SVG
     icon per link — this section is server HTML, every byte ships. */
  return (
    <li className="attack-row">
      <details>
        <summary>
          <span className="attack-head">
            <span className="min-w-0">
              <span className="attack-id">{technique.id}</span>
              <span className="attack-name">{technique.name}</span>
            </span>
            <span className="attack-count">
              {count} {count === 1 ? "case" : "cases"}
              <span className="attack-chev" aria-hidden="true" />
            </span>
          </span>
          {/* Heat: how much evidence stands behind this technique */}
          <span className="attack-heat" aria-hidden="true">
            <span style={{ width: `${Math.max(12, Math.round((count / max) * 100))}%` }} />
          </span>
        </summary>

        <ul className="attack-cases">
          {technique.cases.map((c) => (
            <li key={c.id}>
              <Link href={`/blog/${c.id}`}>{c.title}</Link>
            </li>
          ))}
          <li>
            <a className="attack-ext" href={attackUrl(technique.id)} target="_blank" rel="noopener noreferrer">
              {technique.id} on attack.mitre.org
            </a>
          </li>
        </ul>
      </details>
    </li>
  );
}

export default function AttackCoverage({ tactics, techniqueCount, mappedCaseCount }: Props) {
  const covered = tactics.filter((t) => t.techniques.length > 0);
  const max = Math.max(1, ...covered.flatMap((t) => t.techniques.map((x) => x.cases.length)));

  return (
    <section
      id="attack"
      aria-labelledby="attack-title"
      className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden"
    >
      <KanjiWatermark chars="網羅" side="left" />

      <div className="max-w-7xl mx-auto relative z-10">
        <FadeIn
          x={-32}
          y={0}
          duration={0.7}
          className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary-ink text-[11px] font-mono font-bold tracking-[0.35em] uppercase">
                Coverage // MITRE ATT&amp;CK
              </span>
              <span className="jp-eyebrow text-[11px] text-foreground/30 uppercase" lang="ja" aria-hidden="true">
                網羅
              </span>
            </div>
            <h2
              id="attack-title"
              className="font-display title-fit [--title-n:9] font-black tracking-tighter uppercase leading-[0.85]"
            >
              <span className="text-foreground">Mapped to</span> <br />
              <span className="text-primary italic">ATT&amp;CK.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/60 font-light leading-relaxed">
              {techniqueCount} techniques across {covered.length} tactics, in kill-chain order — each one backed by a
              report in the library below ({mappedCaseCount} cases mapped so far). Open a technique to see the evidence.
            </p>
          </div>
          <CounterBadge value={techniqueCount} top="Techniques" bottom="Mapped" />
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {covered.map((t, idx) => (
            <FadeIn
              key={t.id}
              delay={(idx % 4) * 0.06}
              className="group relative bg-surface/60 border border-foreground/5 hover:border-primary/40 transition-colors duration-500 p-5"
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-70"
                aria-hidden="true"
              />
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                  <span className="text-primary-ink tabular-nums">{pad(t.order)}</span> {t.name}
                </h3>
                <span className="font-mono text-[10px] tabular-nums text-foreground/60">
                  {t.techniques.length}
                  <span className="sr-only"> techniques</span>
                </span>
              </div>
              <ul>
                {t.techniques.map((technique) => (
                  <TechniqueRow key={technique.id} technique={technique} max={max} />
                ))}
              </ul>
            </FadeIn>
          ))}
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
          Mapping per report · technique names from ATT&amp;CK Enterprise ·{" "}
          <a
            href="https://attack.mitre.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-primary/50 hover:text-primary-ink"
          >
            attack.mitre.org
          </a>
        </p>
      </div>
    </section>
  );
}
