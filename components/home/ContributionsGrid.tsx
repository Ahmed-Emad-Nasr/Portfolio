"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { useContributionStats } from "@/lib/api/contributions";
import { ContributionGraph } from "@/components/home/ContributionGraph";
import { CountUp } from "@/components/ui/CountUp";
import { ExternalLink } from "lucide-react";
import ScrambleText from "@/components/ui/ScrambleText";
import FadeIn from "@/components/ui/FadeIn";

/* Open-source contributions to other projects, plus the GitHub contribution
   graph (fetched only once the section is near the viewport) */
export default function ContributionsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const near = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const stats = useContributionStats(PORTFOLIO_DATA.profile.contact.github, near);

  return (
    <section ref={sectionRef} aria-label="Open-source contributions" className="relative py-16 md:py-20 px-6 md:px-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn x={-32} y={0} duration={0.7}
          className="mb-10 flex flex-wrap items-center gap-4"
        >
          <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
          <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
            <ScrambleText text="Community // Contributed" />
          </span>
          <span className="brush-jp text-lg text-foreground/30" lang="ja" aria-hidden="true" data-jp="貢献" />
          {stats.status === "ready" && (
            <span className="ml-auto flex items-center gap-3 border border-foreground/10 bg-surface/60 px-4 py-2">
              <span className="font-mono text-lg font-black text-accent tabular-nums">
                <CountUp target={stats.total} />
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
                commits // last year
              </span>
            </span>
          )}
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PORTFOLIO_DATA.contributions.map((c, idx) => (
            <FadeIn as="a" y={24} duration={0.65} delay={idx * 0.08}
              key={c.name}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group spotlight relative bg-surface/60 border border-foreground/5 p-6 hover:border-tertiary/50 transition-colors duration-500 flex flex-col"
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
              <span className="mb-3 w-fit px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-tertiary bg-tertiary/10 border border-tertiary/25">
                {c.org}
              </span>
              <p className="text-sm text-foreground/60 font-light leading-relaxed">{c.description}</p>
            </FadeIn>
          ))}
        </div>

        {/* Same height while loading, when ready and if GitHub is down — the
            graph arriving must not move the page (it sits above the blog) */}
        <div className="mt-6 flex min-h-[255px] flex-col md:min-h-[236px] [&>*]:flex-1">
          <ContributionGraph stats={stats} />
        </div>
      </div>
    </section>
  );
}
