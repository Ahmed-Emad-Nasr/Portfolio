"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/app/core/motion";
import { PORTFOLIO_DATA } from "@/app/core/config/portfolio-data";
import { useContributionStats } from "@/app/core/api/contributions";
import { ContributionGraph } from "./ContributionGraph";
import { CountUp } from "@/app/core/components/CountUp";
import { ExternalLink } from "lucide-react";

/**
 * Upstream contributions  fixes shipped to projects I don't own.
 * Compact strip inside the proof cluster, same card language.
 */
export default function ContributionsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const near = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const stats = useContributionStats(PORTFOLIO_DATA.projects.githubUsername, near);

  return (
    <section ref={sectionRef} aria-label="Open-source contributions" className="relative py-16 md:py-20 px-6 md:px-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-10 flex flex-wrap items-center gap-4"
        >
          <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
          <span className="text-primary-ink text-[11px] font-mono font-bold tracking-[0.35em] uppercase">
            Community // Contributed
          </span>
          <span className="brush-jp text-lg text-foreground/30" lang="ja" aria-hidden="true">
            貢献
          </span>
          {stats.status === "ready" && (
            <span className="ml-auto flex items-center gap-3 border border-foreground/10 bg-surface/60 px-4 py-2">
              <span className="font-mono text-lg font-black text-accent tabular-nums">
                <CountUp target={stats.total} />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/60">
                commits // last year
              </span>
            </span>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PORTFOLIO_DATA.contributions.map((c, idx) => (
            <motion.a
              key={c.name}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE }}
              className="group spotlight relative bg-surface/60 border border-foreground/5 p-6 hover:border-tertiary/50 transition-colors duration-500 flex flex-col"
              aria-label={`${c.name}  ${c.org}`}
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-foreground group-hover:text-tertiary transition-colors duration-300">
                  {c.name}
                </h3>
                <ExternalLink
                  size={14}
                  className="text-foreground/25 group-hover:text-tertiary transition-colors duration-300 shrink-0"
                />
              </div>
              <span className="mb-3 w-fit px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-tertiary bg-tertiary/10 border border-tertiary/25">
                {c.org}
              </span>
              <p className="text-sm text-foreground/60 font-light leading-relaxed">{c.description}</p>
            </motion.a>
          ))}
        </div>

        <div className="mt-6">
          <ContributionGraph stats={stats} />
        </div>
      </div>
    </section>
  );
}
