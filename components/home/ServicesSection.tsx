import SectionHeader from "@/components/ui/SectionHeader";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";
import { TiltCard } from "@/components/ui/Motion";
import { Scale, Radar, ShieldAlert, Bug, KeyRound, GraduationCap } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { caseEvidenceLibrary } from "@/data/cases";
import { caseKindOf } from "@/lib/shared";
import CaseFilterLink from "@/components/blog/CaseFilterLink";
import FadeIn from "@/components/ui/FadeIn";
import BilingualNote from "@/components/ui/BilingualNote";

/* Where each service's proof lives: a filtered view of the case library
   (with the count it opens), or the section that shows it. Server
   component — the counts are computed at build time. */
const count = (test: (c: (typeof caseEvidenceLibrary)[number]) => boolean) => caseEvidenceLibrary.filter(test).length;
const PROOF: Record<string, { label: string; params?: Record<string, string>; href?: string; count?: number }> = {
  grc: { label: "VerifAI 360, the GRC platform", href: "#work" },
  soc: { label: "SOC alert investigations", params: { q: "LetsDefend" }, count: count((c) => c.platform === "LetsDefend") },
  ir: { label: "Investigation reports", params: { kind: "investigation" }, count: count((c) => caseKindOf(c) === "investigation") },
  malware: { label: "Malware analysis cases", params: { cat: "Malware Analysis" }, count: count((c) => c.category === "Malware Analysis") },
  iam: { label: "Identity & access cases", params: { cat: "Identity & Access" }, count: count((c) => c.category === "Identity & Access") },
  training: { label: "The curriculum", href: "#teaching" },
};

/* One icon per service, by id — an index-based list silently gave a card
   the wrong icon as soon as a service was added or reordered. */
const ICONS = { grc: Scale, soc: Radar, ir: ShieldAlert, malware: Bug, iam: KeyRound, training: GraduationCap } as const;
const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

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
          description={`${COUNT_WORDS[PORTFOLIO_DATA.services.length] ?? PORTFOLIO_DATA.services.length} kinds of work, one discipline: information security. Each one ends with something written down that the next person can use.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PORTFOLIO_DATA.services.map((s, idx) => {
            const Icon = ICONS[s.id as keyof typeof ICONS] ?? ShieldAlert;
            return (
              <FadeIn y={32} duration={0.7} delay={idx * 0.08}
                key={s.id}
              >
              <TiltCard className="group spotlight spotlight-blue relative bg-surface/60 border border-foreground/5 p-7 flex flex-col h-full hover:border-tertiary/50 transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary/0 group-hover:bg-tertiary transition-colors duration-500" aria-hidden="true" />
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2.5 bg-foreground/5 border border-foreground/10">
                    <Icon size={18} className="text-tertiary" />
                  </div>
                  <span className="jp-eyebrow text-[0.625rem] text-foreground/25" lang="ja" aria-hidden="true" data-jp={s.japanese} />
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
                <BilingualNote>
                  خدمة أمن معلومات تبدأ بفهم المخاطر وتنتهي بمخرج مكتوب يمكن مراجعته وقياسه وتحسينه.
                </BilingualNote>
                {PROOF[s.id] && (() => {
                  const proof = PROOF[s.id];
                  const cls = "group/proof mt-4 inline-flex items-center gap-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 hover:text-tertiary transition-colors duration-300";
                  const inner = (
                    <>
                      <span className="relative">
                        See the proof: {proof.label}
                        {proof.count ? <span className="ml-1.5 text-tertiary tabular-nums">({proof.count})</span> : null}
                        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-tertiary transition-transform duration-500 group-hover/proof:scale-x-100" aria-hidden="true" />
                      </span>
                      <ArrowRight size={12} className="transition-transform duration-300 group-hover/proof:translate-x-1" aria-hidden="true" />
                    </>
                  );
                  return proof.params ? (
                    <CaseFilterLink params={proof.params} className={cls}>{inner}</CaseFilterLink>
                  ) : (
                    <a href={proof.href} className={cls}>{inner}</a>
                  );
                })()}
              </TiltCard>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
