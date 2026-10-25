import type { NowItem } from "@/app/core/types/portfolio";
import { rv } from "@/app/core/reveal";

export default function NowSection({ items }: { items: NowItem[] }) {
  return (
    <section aria-label="What I am doing now" className="relative py-24 md:py-32 px-6 md:px-20 bg-surface/30 border-y border-foreground/5 overflow-hidden">
      <div
        className="absolute left-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
        lang="ja"
      >
        <span>現</span>
        <span>在</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div
  className="max-w-3xl"
  data-reveal={rv({ x: -40, y: 0, duration: 0.8 })}
>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                Now // Loading the present
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="現在" />
            </div>
            <h2 className="font-display title-fit [--title-n:8] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Right</span> <br />
              <span className="text-primary dark:text-primary-ink italic">Now.</span>
            </h2>
            <p className="mt-5 text-foreground/60 max-w-xl font-light leading-relaxed">
              A snapshot, not a promise — updated as the work shifts.
            </p>
          </div>

          <div
  data-reveal={rv({ y: 20, duration: 0.6, delay: 0.3 })}
>
            <div className="relative flex items-center gap-3 px-6 py-3 border border-primary/40 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.35em] text-primary-ink">
                Live
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((n, idx) => (
            <div
  key={n.label}
  className="spotlight spotlight-blue relative bg-background/60 border border-foreground/5 p-7 hover:border-primary/50 transition-colors duration-500"
  data-reveal={rv({ y: 28, duration: 0.65, delay: idx * 0.08 })}
>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 bg-primary" />
                </span>
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">
                  {n.label}
                </span>
              </div>
              <p className="border-l-2 border-primary/70 pl-4 text-sm text-foreground/75 font-light leading-relaxed">
                {n.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
