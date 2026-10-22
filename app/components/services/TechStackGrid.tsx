"use client";

import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import SectionHeader from "@/app/core/components/SectionHeader";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { TiltCard } from "@/app/core/components/Motion";

/**
 * Arsenal  static stack grid (no marquee).
 * Same card language as Services: red structure, sky stack chips.
 * Hover edge turns sky to mark it as the "tools" section.
 */
export default function TechStackGrid() {
  return (
    <section aria-label="Tech stack" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute left-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
        lang="ja"
      >
        <span>武</span>
        <span>器</span>
        <span>庫</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Arsenal // The exact tools"
          japanese="武器庫"
          titleA="Tools of"
          titleB="The Trade."
          description="No buzzword bingo. Every item below shows up in the labs and cases you just scrolled past  or the reports in the case library."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.stack.map((g, idx) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE }}
            >
              <TiltCard className="group spotlight spotlight-blue relative bg-surface/60 border border-foreground/5 p-7 h-full hover:border-tertiary/50 transition-colors duration-500"
              >
                <div
                  className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500"
                  aria-hidden="true"
                />
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
                    {g.title}
                  </h3>
                  <span className="brush-jp text-xl text-tertiary" lang="ja" aria-hidden="true">
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
