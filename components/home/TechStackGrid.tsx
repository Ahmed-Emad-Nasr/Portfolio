import SectionHeader from "@/components/ui/SectionHeader";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { TiltCard } from "@/components/ui/Motion";
import PageLink from "@/components/ui/PageLink";
import { ArrowUpRight } from "lucide-react";
import { caseEvidenceLibrary } from "@/data/cases";
import CaseFilterLink from "@/components/blog/CaseFilterLink";
import FadeIn from "@/components/ui/FadeIn";

/* How many cases mention each tool — the same fields the library's search
   reads, so the number on the chip is the number the click finds. Server
   component: the case data never reaches the browser. */
const SEARCH_TEXT = caseEvidenceLibrary.map((c) =>
  [c.title, c.description, c.platform, c.type, c.category, ...c.tags, ...c.tools, ...c.skillsGained].join(" ").toLowerCase(),
);
const casesUsing = (tool: string) => {
  const needle = tool.toLowerCase();
  return SEARCH_TEXT.filter((t) => t.includes(needle)).length;
};

/**
 * Arsenal — static stack grid (no marquee).
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
          description="No buzzword bingo. Every item below comes from somewhere you can check — the labs above, the reports in the case library, or the job itself. A number on a tool is how many cases use it: click it to open them."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PORTFOLIO_DATA.stack.map((g, idx) => (
            <FadeIn y={28} duration={0.65} delay={idx * 0.08}
              key={g.id}
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
                  <span className="brush-jp text-xl text-tertiary" lang="ja" aria-hidden="true" data-jp={g.japanese} />
                </div>
                <div className="w-8 h-[2px] bg-tertiary/60 mb-5" aria-hidden="true" />
                <ul className="flex flex-wrap gap-2" aria-label={`${g.title} tools`}>
                  {g.items.map((item) => {
                    const count = casesUsing(item);
                    const chip = "px-3 py-1.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.15em] text-foreground bg-tertiary/10 border border-tertiary/40";
                    return (
                      <li key={item}>
                        {count > 0 ? (
                          <CaseFilterLink
                            params={{ q: item }}
                            className={`${chip} group/chip inline-flex items-center gap-1.5 hover:bg-tertiary hover:text-background hover:border-tertiary transition-colors duration-300`}
                            title={`${count} case(s) use ${item}`}
                          >
                            {item}
                            <span className="text-tertiary group-hover/chip:text-background tabular-nums">{count}</span>
                          </CaseFilterLink>
                        ) : (
                          <span className={`${chip} inline-block`}>{item}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {g.evidence && g.evidence.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-foreground/5">
                    <span className="block mb-2 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-foreground/65">Proof</span>
                    {/* min-h-6 / py-1: each link is at least 24px tall (WCAG 2.2
                        target size) — two lines of text-xs were 16px apart */}
                    <ul className="grid gap-0.5">
                      {g.evidence.map((e) => (
                        <li key={e.id}>
                          <PageLink href={`/blog/${e.id}`} className="group/proof flex min-h-6 items-start gap-1.5 py-1 text-xs text-foreground/65 hover:text-tertiary transition-colors">
                            <ArrowUpRight size={12} className="mt-0.5 shrink-0 transition-transform duration-300 group-hover/proof:translate-x-0.5 group-hover/proof:-translate-y-0.5" aria-hidden="true" />
                            {e.label}
                          </PageLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
