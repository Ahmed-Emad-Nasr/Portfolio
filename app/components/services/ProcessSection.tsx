import SectionHeader from "@/app/core/components/SectionHeader";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { rv } from "@/app/core/reveal";

export default function ProcessSection() {
  return (
    <section id="process" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute right-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
        lang="ja"
      >
        <span>手</span>
        <span>順</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Process // How I work"
          japanese="手順"
          titleA="Risk to"
          titleB="Response."
          description="One loop for every engagement — the NIST CSF functions, from the risk register to the incident report. Nothing is closed without a reason on record."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.process.map((p, idx) => (
            <div
  key={p.id}
  className="relative spotlight bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500"
  data-reveal={rv({ y: 28, duration: 0.65, delay: idx * 0.08 })}
>
              <div className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none" aria-hidden="true">
                {p.index}
              </div>
              <div className="font-mono text-[0.625rem] text-primary-ink tracking-[0.3em] uppercase mb-1">{p.index}</div>
              <div className="jp-eyebrow text-[0.625rem] text-foreground/30 mb-3" lang="ja" aria-hidden="true" data-jp={p.japanese} />
              <h3 className="font-display text-xl font-black uppercase text-foreground mb-3">{p.title}</h3>
              <p className="text-sm text-foreground/60 font-light leading-relaxed">{p.description}</p>
              {idx < PORTFOLIO_DATA.process.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-primary/40 overflow-visible" aria-hidden="true">
                  {/* A packet travelling to the next step */}
                  <span className="process-packet absolute -top-[2px] left-0 h-[6px] w-[6px] bg-primary" style={{ animationDelay: `${idx * 0.45}s` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
