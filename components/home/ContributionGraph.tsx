import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { CountUp } from "@/components/ui/CountUp";
import type { ContributionStats } from "@/lib/api/contributions";
import FadeIn from "@/components/ui/FadeIn";

const LEVEL_BG = [
  "bg-foreground/[0.06]",
  "bg-accent/25",
  "bg-accent/50",
  "bg-accent/75",
  "bg-accent",
];

/**
 * Year contribution graph (presentational  data comes from
 * useContributionStats so the section header can share the total).
 * Loading skeleton -> graph | empty notice | error notice with profile link.
 * Never blocks the page: failures degrade to a single line.
 */
export function ContributionGraph({ stats }: { stats: ContributionStats }) {
  const { status, days, total } = stats;
  const username = PORTFOLIO_DATA.profile.contact.github;
  if (status === "loading") {
    return (
      <div role="status" aria-label="Loading contribution graph" className="border border-foreground/10 bg-surface/60 p-6 overflow-hidden">
        <div className="mb-4 h-4 w-48 animate-pulse bg-foreground/10" />
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {Array.from({ length: 130 }).map((_, i) => (
            <div key={i} className="h-3 w-3 animate-pulse bg-foreground/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error" || status === "empty") {
    return (
      <div className="flex items-center border border-foreground/10 bg-surface/60 px-6 py-5 font-mono text-xs text-foreground/60">
        <p>
          {status === "error" ? "Contribution graph is unreachable right now — " : "No recent activity to draw — "}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-ink underline underline-offset-4 decoration-primary/50 hover:decoration-primary"
          >
            see the profile on GitHub
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <FadeIn y={24} duration={0.65}
      className="border border-foreground/10 bg-surface/60 p-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-2xl font-black text-accent tabular-nums">
          <CountUp target={total} duration={1800} />
        </span>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-foreground/60">
          contributions in the last year
        </span>
      </div>
      <div
        className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
        tabIndex={0}
        aria-label="GitHub contribution activity"
      >
        <div className="relative">
          <div
            className="grid min-w-[560px] grid-flow-col grid-rows-7 gap-1"
            role="img"
            aria-label={`${total} contributions in the last year`}
          >
            {days.map((d, i) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                style={{ "--i": i } as React.CSSProperties}
                className={`cell-pop h-3 w-3 ${LEVEL_BG[Math.min(4, Math.max(0, d.level))] ?? LEVEL_BG[0]}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[0.5625rem] text-foreground/60">
        <span>Less</span>
        {LEVEL_BG.map((bg, i) => (
          <span key={i} className={`h-2.5 w-2.5 ${bg}`} />
        ))}
        <span>More</span>
      </div>
    </FadeIn>
  );
}
