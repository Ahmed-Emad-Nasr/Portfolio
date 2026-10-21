/*
 * StartHere — three reports to read first, as the numbered cards of the
 * original theme's Process section.
 */

import Link from "next/link";
import { startHere } from "@/app/core/config/start-here";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { Eyebrow } from "@/app/components/shared/kit";

const KNOWN_IDS = new Set(caseEvidenceLibrary.map((item) => item.id));
const ENTRIES = startHere.filter((entry) => KNOWN_IDS.has(entry.id));

export default function StartHere() {
  if (ENTRIES.length === 0) return null;

  return (
    <section className="relative mb-20" aria-labelledby="start-here-title">
      <Eyebrow japanese="入門">Short on time</Eyebrow>
      <h2 id="start-here-title" className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-3">
        Start <span className="text-primary italic">here.</span>
      </h2>
      <p className="mb-10 max-w-2xl text-foreground/55 font-light leading-relaxed">
        Three reports that cover the range of the work. The full library is below.
      </p>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ENTRIES.map((entry, idx) => (
          <li key={entry.id}>
            <Link
              href={`/blog/${entry.id}`}
              className="relative spotlight block h-full bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 group"
            >
              <div className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none" aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase mb-3">
                {String(idx + 1).padStart(2, "0")} • {entry.minutes} min
              </div>
              <h3 className="font-display text-xl font-black uppercase text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {entry.label}
              </h3>
              <p className="text-sm text-foreground/55 font-light leading-relaxed">{entry.why}</p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
