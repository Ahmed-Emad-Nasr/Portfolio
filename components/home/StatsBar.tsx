import { CountUp } from "@/components/ui/CountUp";
import type { Stat } from "@/data/types";
import FadeIn from "@/components/ui/FadeIn";

/* Every number comes from the data (cases.ts, certifications.ts) or the CV —
   computed on the server (live-copy.ts) and passed in, so the case data
   itself never ships to the browser. */

export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <section aria-label="Highlights" className="relative px-6 md:px-20 bg-background">
      <div className="max-w-7xl mx-auto -mt-2 grid grid-cols-2 lg:grid-cols-4 border border-foreground/10 bg-surface/50 backdrop-blur-md divide-x divide-foreground/5 divide-y lg:divide-y-0">
        {stats.map((s, i) => (
          <FadeIn as="a" y={16} duration={0.55} delay={i * 0.07}
            key={s.label}
            href={s.href ?? "#"}
            className="group relative px-6 py-5 flex items-center gap-4 overflow-hidden hover:bg-foreground/[0.03] transition-colors duration-300"
          >
            <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
            <span className="font-mono text-xl md:text-2xl font-black text-accent tabular-nums">
              <CountUp target={s.target} suffix={s.suffix} />
            </span>
            <span className="flex flex-col">
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{s.label}</span>
              <span className="jp-eyebrow text-[0.5625rem] text-foreground/25" lang="ja" aria-hidden="true" data-jp={s.japanese} />
            </span>
            <span className="ml-auto font-mono text-xs text-foreground/20 group-hover:text-accent transition-all duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
