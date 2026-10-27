/*
 * PlatformsSection — "Proving Grounds": public training profiles a recruiter
 * can check. Numbers are fetched at build time (TryHackMe) or documented
 * results — nothing estimated. Server Component.
 */

import { ArrowUpRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { CounterBadge, KanjiWatermark, cardSurface } from "@/components/ui/kit";
import type { Platform, TryHackMeStats } from "@/data/platforms";
import ScrambleText from "@/components/ui/ScrambleText";

function Mark({ children }: { children: string }) {
  return (
    <span
      className="grid place-items-center w-12 h-12 shrink-0 border border-primary/30 bg-primary/[0.06] font-mono text-xs font-black tracking-[0.1em] text-primary-ink"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function ProfileLink({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-accent">
      <span aria-hidden="true">→</span> {label}
      <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </span>
  );
}

function FeaturedCard({ platform, stats }: { platform: Platform; stats: TryHackMeStats }) {
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardSurface} flex flex-col xl:flex-row gap-8 xl:gap-12 p-7 md:p-9`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent" aria-hidden="true" />

      <div className="flex flex-col xl:w-[36%] shrink-0">
        <div className="flex items-start justify-between gap-4">
          <Mark>{platform.mark}</Mark>
          <span className="jp-eyebrow text-[0.625rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp={platform.japanese} />
        </div>
        <h3 className="mt-6 font-display text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
          {platform.name}
        </h3>
        <p className="mt-2 font-mono text-[0.6875rem] tracking-[0.15em] text-foreground/60">@{platform.handle}</p>
        <p className="mt-5 text-sm md:text-base text-foreground/60 font-light leading-relaxed">{platform.focus}</p>
        <div className="mt-auto pt-6">
          <ProfileLink label="View profile" />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 justify-center">
        {/* gap-px over a tinted backing draws the hairlines between cells */}
        <dl className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-foreground/10 border border-foreground/10">
          {platform.stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 px-4 py-6 bg-surface last:col-span-2 sm:last:col-span-1">
              <dt className="order-2 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">{s.label}</dt>
              <dd className="order-1 font-mono text-xl font-black tabular-nums text-accent leading-none whitespace-nowrap">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            {stats.live && <span className="absolute inline-flex h-full w-full animate-ping bg-tertiary opacity-60" />}
            <span className={`relative inline-flex h-1.5 w-1.5 ${stats.live ? "bg-tertiary" : "bg-foreground/40"}`} />
          </span>
          {stats.live ? "Live from TryHackMe at build" : "Last recorded"} · {stats.asOf}
        </p>
      </div>
    </a>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardSurface} flex h-full flex-col p-6 xl:p-7`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[2px] bg-primary/0 group-hover:bg-primary transition-colors duration-500"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-4">
        <Mark>{platform.mark}</Mark>
        <span className="jp-eyebrow text-[0.625rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp={platform.japanese} />
      </div>
      <h3 className="mt-6 font-display text-xl sm:text-2xl lg:text-lg xl:text-2xl font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors duration-300">
        {platform.name}
      </h3>
      <p className="mt-2 font-mono text-[0.6875rem] tracking-[0.15em] text-foreground/60">@{platform.handle}</p>
      <p className="mt-4 text-sm text-foreground/60 font-light leading-relaxed">{platform.focus}</p>

      {platform.stats.length > 0 && (
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
          {platform.stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5">
              <dt className="order-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{s.label}</dt>
              <dd className="order-1 font-mono text-xl font-black tabular-nums text-accent leading-none">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto pt-6">
        <div className="pt-5 border-t border-foreground/10">
          <ProfileLink label="View profile" />
        </div>
      </div>
    </a>
  );
}

export default function PlatformsSection({
  featured,
  thm,
  others,
}: {
  featured: Platform;
  thm: TryHackMeStats;
  others: Platform[];
}) {
  return (
    <section
      id="platforms"
      aria-labelledby="platforms-title"
      className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden"
    >
      <KanjiWatermark chars="修練" side="right" />

      <div className="max-w-7xl mx-auto relative z-10">
        <FadeIn
          x={-32}
          y={0}
          duration={0.7}
          className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
                <ScrambleText text="Practice // Public profiles" />
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="修練" />
            </div>
            <h2
              id="platforms-title"
              className="font-display title-fit [--title-n:8] font-black tracking-tighter uppercase leading-[0.85]"
            >
              <span className="text-foreground">Proving</span> <br />
              <span className="text-primary italic">Grounds.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/60 font-light leading-relaxed">
              Where the hours went. Every profile is public — open it and check the numbers yourself.
            </p>
          </div>
          <CounterBadge value={`Top ${thm.topPercentage}%`} top="TryHackMe" bottom="Worldwide" tone="accent" />
        </FadeIn>

        <FadeIn className="mb-6">
          <FeaturedCard platform={featured} stats={thm} />
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {others.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08} className="h-full">
              <PlatformCard platform={p} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
