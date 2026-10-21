"use client";

import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { TiltCard } from "@/app/core/components/Motion";

export default function UsesSection() {
  const toolCount = PORTFOLIO_DATA.uses.reduce((s, g) => s + g.items.length, 0);

  return (
    <section aria-label="Daily drivers" className="relative pt-4 md:pt-8 pb-24 md:pb-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute right-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
        lang="ja"
      >
        <span>毎</span>
        <span>日</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary text-xs font-black tracking-[0.4em] uppercase font-mono">
                Uses // Daily drivers
              </span>
              <span className="jp-eyebrow text-[11px] text-foreground/30 uppercase" lang="ja">
                道具
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Daily</span> <br />
              <span className="text-primary italic">Drivers.</span>
            </h2>
            <p className="mt-5 text-foreground/55 max-w-xl font-light leading-relaxed">
              The tools behind the work above  detect, investigate, automate, and where the practice happens.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative px-6 py-3 border border-foreground/10 bg-surface/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary text-2xl font-black tabular-nums">
                  {String(toolCount).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-on-surface-variant tracking-[0.3em] uppercase">
                    Tools
                  </span>
                  <span className="font-mono text-[9px] text-on-surface-variant tracking-[0.3em] uppercase">
                    Loaded
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.uses.map((g, idx) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE }}
            >
              <TiltCard className="spotlight spotlight-blue group relative bg-surface/60 border border-foreground/5 p-7 h-full hover:border-tertiary/50 transition-colors duration-500"
              >
                <div
                  className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500"
                  aria-hidden="true"
                />
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
                    {g.title}
                  </h3>
                  <span className="brush-jp text-xl text-tertiary" lang="ja">
                    {g.japanese}
                  </span>
                </div>
                <div className="w-8 h-[2px] bg-tertiary/60 mb-5" aria-hidden="true" />
                <ul className="flex flex-wrap gap-2" aria-label={`${g.title} tools`}>
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground bg-tertiary/10 border border-tertiary/40"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
