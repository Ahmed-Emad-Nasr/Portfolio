"use client";

import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/app/core/motion";
import type { FaqItem } from "@/app/core/types/portfolio";
import { Plus } from "lucide-react";
import { rv } from "@/app/core/reveal";

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="Frequently asked questions" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <div
        className="absolute left-8 top-16 pointer-events-none select-none text-foreground/[0.03] text-[13vw] font-black z-0 vertical-text"
        aria-hidden="true"
        lang="ja"
      >
        <span>質</span>
        <span>問</span>
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
                FAQ // Before you ask
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="質問" />
            </div>
            <h2 className="font-display title-fit [--title-n:11] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Fair</span> <br />
              <span className="text-primary italic">Questions.</span>
            </h2>
            <p className="mt-5 text-foreground/60 max-w-xl font-light leading-relaxed">
              The answers recruiters and teams usually need before the first call.
            </p>
          </div>

          <div
  data-reveal={rv({ y: 20, duration: 0.6, delay: 0.3 })}
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
                    Answers
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl flex flex-col border-t border-foreground/10">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
  key={i}
  className="border-b border-foreground/10"
  data-reveal={rv({ y: 20, duration: 0.55, delay: i * 0.05 })}
>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center gap-4 py-5 text-left group"
                >
                  <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`flex-1 font-display text-lg md:text-xl font-black uppercase tracking-tight transition-colors ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 border p-1.5 transition-colors ${isOpen ? "border-primary text-primary-ink" : "border-foreground/15 text-foreground/40"}`}
                  >
                    <Plus size={15} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-10 pr-4 text-sm md:text-base text-foreground/60 font-light leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
