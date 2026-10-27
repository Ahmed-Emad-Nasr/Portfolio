import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import ScrambleText from "@/app/core/components/ScrambleText";
import FadeIn from "@/app/core/components/FadeIn";

export default function MilestonesSection() {
  const items = PORTFOLIO_DATA.milestones;

  return (
    <section aria-label="Milestones" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeIn x={-40} y={0} duration={0.8}
  className="max-w-3xl"
>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                <ScrambleText text="Milestones // How it compounded" />
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="歩み" />
            </div>
            <h2 className="font-display title-fit [--title-n:8] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">The</span> <br />
              <span className="text-primary italic">Path.</span>
            </h2>
            <p className="mt-5 text-foreground/60 max-w-xl font-light leading-relaxed">
              Every step below is documented somewhere above — experience, work, or credentials.
            </p>
          </FadeIn>

          <FadeIn y={20} duration={0.6} delay={0.3}
>
            <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary-ink text-2xl font-black tabular-nums">
                  {String(items.length).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Stops
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    So far
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        <div className="max-w-4xl">
          <ol className="relative flex flex-col">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-foreground/10" aria-hidden="true" />
            {items.map((m, idx) => (
              <FadeIn as="li" x={-24} y={0} duration={0.6} delay={idx * 0.06}
  key={`${m.year}-${m.title}`}
  className="relative flex gap-6 pb-10 last:pb-0"
>
                <span
                  className={`relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rotate-45 border-2 transition-colors ${idx === items.length - 1
                      ? "border-primary bg-primary"
                      : "border-primary/60 bg-background"
                    }`}
                  aria-hidden="true"
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5">
                  <span className="font-mono text-sm font-black text-accent tabular-nums shrink-0 w-12">
                    {m.year}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-black uppercase tracking-tight text-foreground">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/60 font-light leading-relaxed">
                      {m.detail}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
