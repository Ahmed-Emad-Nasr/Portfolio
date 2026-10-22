"use client";

import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import SectionHeader from "@/app/core/components/SectionHeader";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { TiltCard } from "@/app/core/components/Motion";
import { Radar, ShieldAlert, Microscope, GraduationCap } from "lucide-react";

const ICONS = [Radar, ShieldAlert, Microscope, GraduationCap];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute left-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
      >
        <span>役</span>
        <span>務</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Services // What I do"
          japanese="役務"
          titleA="What I"
          titleB="Do."
          description="Four kinds of work. Each one ends with something written down that the next person can use."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.services.map((s, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease: EASE }}
              >
              <TiltCard className="group spotlight spotlight-blue relative bg-surface/60 border border-foreground/5 p-7 flex flex-col h-full hover:border-tertiary/50 transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500" aria-hidden="true" />
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2.5 bg-foreground/5 border border-foreground/10">
                    <Icon size={18} className="text-tertiary" />
                  </div>
                  <span className="jp-eyebrow text-[0.625rem] text-foreground/25" lang="ja" aria-hidden="true">{s.japanese}</span>
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight text-foreground mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-foreground/60 font-light leading-relaxed mb-5">{s.description}</p>
                <div className="flex flex-wrap gap-2 mb-5 mt-auto">
                  {s.stack.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-tertiary bg-tertiary/10 border border-tertiary/25"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-foreground/5 font-mono text-[0.625rem] text-accent tracking-[0.2em] uppercase">
                  → {s.deliverable}
                </div>
              </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
