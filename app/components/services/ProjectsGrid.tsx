"use client";

import { useMemo } from "react";
import { Repo } from "@/app/core/api/github";
import ProjectCard from "./ProjectCard";
import { CountUp } from "@/app/core/components/CountUp";
import { Star } from "lucide-react";
import ScrambleText from "@/app/core/components/ScrambleText";
import FadeIn from "@/app/core/components/FadeIn";

export default function ProjectsGrid({ repos }: { repos: Repo[] }) {
  const totalStars = useMemo(
    () => repos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
    [repos]
  );
  return (
    <section id="projects" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      {/* Background Japanese Watermark */}
      <div
        className="absolute left-10 top-20 pointer-events-none select-none text-foreground/[0.03] text-[15vw] font-black z-0 vertical-text uppercase"
        aria-hidden="true"
        role="img"
      >
        <span>設</span>
        <span>計</span>
        <span>開</span>
        <span>発</span>
      </div>

      {/* Decorative speed lines */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        {/* The badge column takes its own width (auto), not a third of the
            row: at 1024–1366px a third was narrower than the badge. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 mb-16 md:mb-20 items-end">
          <FadeIn x={-40} y={0} duration={0.8}
  className="flex flex-col"
>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-primary-ink text-xs font-black tracking-[0.4em] uppercase font-mono">
                <ScrambleText text="Open Source // リポジトリ" />
              </span>
            </div>

            <h2 className="font-display title-fit [--title-n:13] font-black tracking-tighter uppercase leading-[0.85]">
              <span className="text-foreground">Code</span> <br />
              <span className="text-primary italic">Repositories.</span>
            </h2>
            <p className="mt-5 text-foreground/60 max-w-xl font-light leading-relaxed">
              The labs and tools above, as code. Setup, rules and results live in each repo, not in headlines.
            </p>
          </FadeIn>

          {/* Counter Badge  pacman eats the numbers up */}
          <FadeIn y={20} duration={0.6} delay={0.3}
  className="flex lg:justify-end"
>
            <div className="relative flex items-center gap-4 px-5 sm:px-6 py-3 border border-accent/40 bg-surface/60 backdrop-blur-sm max-w-full">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent" />
              <Star size={26} className="text-accent shrink-0" fill="var(--accent)" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-accent text-2xl font-black tabular-nums">
                  <CountUp target={repos.length} />
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Projects
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Indexed
                  </span>
                </div>
                <span className="font-mono text-accent/50 text-xl font-black" aria-hidden="true">
                  •
                </span>
                <span className="font-mono text-accent text-2xl font-black tabular-nums">
                  <CountUp target={totalStars} />
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Stars
                  </span>
                  <span className="font-mono text-[0.5625rem] text-on-surface-variant tracking-[0.3em] uppercase">
                    Earned
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Project Grid  empty state when GitHub API is down */}
        {repos.length === 0 && (
          <div className="relative bg-surface/60 border border-foreground/10 p-10 md:p-14 text-center">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" aria-hidden="true" />
            <p className="brush-jp text-4xl text-accent/80 mb-4" lang="ja" aria-hidden="true" data-jp="接続切れ" />
            <p className="font-mono text-sm text-foreground/60 tracking-wider mb-2">
              GitHub API unreachable right now.
            </p>
            <p className="text-sm text-foreground/60 font-light">
              Full write-ups with benchmarks live in the Selected Work section above.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {repos.map((repo, idx) => (
            <FadeIn y={40} duration={0.7} delay={(idx % 3) * 0.1}
  key={repo.id}
  className="flex"
>
              <ProjectCard repo={repo} index={idx} />
            </FadeIn>
          ))}
        </div>

        {/* Bottom Decorative Line  gradient from transparent to red to transparent */}
        <div className="mt-20 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </div>
    </section>
  );
}
