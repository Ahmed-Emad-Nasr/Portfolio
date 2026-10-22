"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";
import SectionHeader from "@/app/core/components/SectionHeader";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import type { WorkType } from "@/app/core/types/portfolio";
import { ExternalLink, FlaskConical, Microscope, Wrench, Server, Lock, PlayCircle } from "lucide-react";
import { Github } from "@/app/core/icons/BrandIcons";
import { TiltCard } from "@/app/core/components/Motion";

const FILTERS: { id: WorkType | "all"; label: string; japanese: string }[] = [
  { id: "all", label: "All", japanese: "全部" },
  { id: "lab", label: "Labs", japanese: "実験" },
  { id: "research", label: "Research", japanese: "研究" },
  { id: "tool", label: "Tools", japanese: "道具" },
  { id: "platform", label: "Platforms", japanese: "基盤" },
];

const TYPE_ICON = {
  lab: FlaskConical,
  research: Microscope,
  tool: Wrench,
  platform: Server,
} as const;

export default function WorkShowcase() {
  const [filter, setFilter] = useState<WorkType | "all">("all");
  const items = PORTFOLIO_DATA.work.filter((w) => filter === "all" || w.type === filter);

  return (
    <section id="work" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute right-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
      >
        <span>仕</span>
        <span>事</span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Selected work // Labs & tools"
          japanese="仕事"
          titleA="Built &"
          titleB="Tested."
          description="Labs built to be attacked, research done in isolation, and tools that came out of real triage. Every number below is in the repo."
        />

        <div className="flex flex-wrap gap-3 mb-12" role="tablist" aria-label="Filter work by type">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${filter === f.id
                  ? "bg-primary text-white border-primary"
                  : "bg-foreground/[0.03] text-foreground/70 border-foreground/10 hover:border-primary/50 hover:text-foreground"
                }`}
            >
              {f.label} <span className="ml-2 text-[9px]" lang="ja" aria-hidden="true">{f.japanese}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((w, idx) => {
            const Icon = TYPE_ICON[w.type];
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: (idx % 2) * 0.1, ease: EASE }}
              >
                <TiltCard className="spotlight group relative bg-surface/60 border border-foreground/5 p-8 hover:border-primary/40 transition-colors duration-500 flex flex-col h-full"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent opacity-70" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-foreground/5 border border-foreground/10">
                        <Icon size={18} className="text-tertiary" />
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-tertiary">{w.type} • {w.platform}</div>
                        <div className="font-mono text-[9px] text-foreground/60 tracking-widest mt-1">{w.year} • {w.status}</div>
                      </div>
                    </div>
                    {w.status === "private-demo" && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent border border-accent/30 bg-accent/10">
                        <Lock size={11} /> Private
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl md:text-[1.375rem] lg:text-3xl font-black uppercase tracking-tight text-foreground mb-2">
                    {w.title}
                  </h3>
                  <p className="text-foreground/80 font-medium mb-3">{w.tagline}</p>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-2">
                    <span className="text-foreground/60 font-mono text-[10px] uppercase tracking-[0.2em]">Problem  </span>
                    {w.problem}
                  </p>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-5">
                    <span className="text-foreground/60 font-mono text-[10px] uppercase tracking-[0.2em]">Role  </span>
                    {w.role}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {w.stack.map((s) => (
                      <span key={s} className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-tertiary bg-tertiary/10 border border-tertiary/25">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {w.metrics.map((m) => (
                      <span key={m} className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-accent bg-accent/10 border border-accent/25">
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-auto pt-5 border-t border-foreground/5">
                    {w.links.github && (
                      <a href={w.links.github} target="_blank" rel="noopener noreferrer" className="btn-sheen flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                        <Github size={13} /> Source
                      </a>
                    )}
                    {w.links.live && (
                      <a href={w.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 border border-foreground/15 text-foreground/70 font-mono text-[10px] uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors">
                        <ExternalLink size={13} /> Live
                      </a>
                    )}
                    {w.links.demo && (
                      <a href={w.links.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 border border-foreground/15 text-foreground/70 font-mono text-[10px] uppercase tracking-[0.2em] hover:border-primary hover:text-foreground transition-colors">
                        <PlayCircle size={13} /> Demo
                      </a>
                    )}
                    {!w.links.github && !w.links.live && !w.links.demo && (
                      <span className="font-mono text-[10px] text-foreground/60 tracking-[0.2em] uppercase">Demo on request  NDA client work</span>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {items.length === 0 && (
          <p className="mt-8 font-mono text-sm text-foreground/60">No items in this filter yet.</p>
        )}
      </div>
    </section>
  );
}
