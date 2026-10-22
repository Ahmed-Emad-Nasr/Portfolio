"use client";

import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import SectionHeader from "@/app/core/components/SectionHeader";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";

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
          titleA="Alert to"
          titleB="Report."
          description="Same rhythm on every incident, from the first alert to the write-up. Nothing is closed without a reason on record."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.process.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE }}
              className="relative spotlight bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500"
            >
              <div className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none" aria-hidden="true">
                {p.index}
              </div>
              <div className="font-mono text-[10px] text-primary-ink tracking-[0.3em] uppercase mb-1">{p.index}</div>
              <div className="jp-eyebrow text-[10px] text-foreground/30 mb-3" lang="ja" aria-hidden="true">{p.japanese}</div>
              <h3 className="font-display text-xl font-black uppercase text-foreground mb-3">{p.title}</h3>
              <p className="text-sm text-foreground/60 font-light leading-relaxed">{p.description}</p>
              {idx < PORTFOLIO_DATA.process.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-primary/40" aria-hidden="true" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
