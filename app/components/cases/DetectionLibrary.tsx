"use client";

/*
 * DetectionLibrary — the custom Wazuh rule pack as a browsable console.
 *
 * A rule pack in a PDF is read by nobody; the same rules as a filterable list
 * of "what fires, how loud, which technique" show detection engineering at a
 * glance. Styled as a SIEM rule console: severity bar per rule (Wazuh level
 * 0–15), group filters, ATT&CK ids linking out. Rows cascade in on scroll and
 * re-cascade on every filter change.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Radar } from "lucide-react";
import SectionHeader from "@/app/core/components/SectionHeader";
import { KanjiWatermark, CounterBadge } from "@/app/components/shared/kit";
import { detectionRules, RULE_GROUP_LABEL } from "@/app/core/config/detection-rules";
import FadeIn from "@/app/core/components/FadeIn";

const GROUPS = Object.keys(RULE_GROUP_LABEL).filter((g) => detectionRules.some((r) => r.group === g));
const attackUrl = (id: string) => `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;

/* Wazuh levels: 12+ is high-importance, 15 the maximum */
const levelTone = (level: number) => (level >= 14 ? "bg-primary" : level >= 12 ? "bg-accent" : level >= 10 ? "bg-tertiary" : "bg-foreground/40");

export default function DetectionLibrary() {
  const [group, setGroup] = useState<string | null>(null);
  const rules = useMemo(() => (group ? detectionRules.filter((r) => r.group === group) : detectionRules), [group]);
  const techniques = useMemo(() => new Set(detectionRules.map((r) => r.mitre.split(".")[0]).filter(Boolean)).size, []);

  return (
    <section id="detections" aria-label="Detection library" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="検知" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Side by side only from lg: at tablet widths the title and two
            badges did not fit, and the second badge ran off the screen. */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
          <SectionHeader
            eyebrow="Detection engineering // Wazuh"
            japanese="検知"
            titleA="Detection"
            titleB="Library."
            description="My custom Wazuh rule pack, rule by rule: what fires, how loud (Wazuh level 0–15) and which ATT&CK technique it watches. Filter by family; the full XML is in the report."
          />
          <div className="mb-16 md:mb-20 flex flex-wrap gap-3 shrink-0">
            <CounterBadge value={detectionRules.length} top="Custom" bottom="Rules" />
            <CounterBadge value={techniques} top="Techniques" bottom="Watched" tone="accent" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter rules by family">
          {[null, ...GROUPS].map((g) => {
            const active = group === g;
            const n = g ? detectionRules.filter((r) => r.group === g).length : detectionRules.length;
            return (
              <button
                key={g ?? "all"}
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={active}
                className={`relative overflow-hidden px-3 py-1.5 border font-mono text-[0.5625rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  active ? "border-primary text-white" : "border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30"
                }`}
              >
                <span className={`absolute inset-0 bg-primary origin-left transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${active ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                <span className="relative">
                  {g ? RULE_GROUP_LABEL[g] : "All rules"} <span className="tabular-nums">{n}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* The console */}
        <div className="border border-foreground/10 bg-surface/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-foreground/10">
            <span className="flex items-center gap-3 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-foreground/60">
              <Radar size={13} className="text-primary-ink radar-spin" aria-hidden="true" /> local_rules.xml
            </span>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60 tabular-nums">{rules.length} loaded</span>
          </div>
          <div className="hidden md:grid grid-cols-[5.5rem_7rem_1fr_6.5rem] gap-4 px-5 py-2.5 border-b border-foreground/5 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            <span>Rule</span>
            <span>Level</span>
            <span>Fires on</span>
            <span>ATT&amp;CK</span>
          </div>
          <ul key={group ?? "all"} className="max-h-[34rem] overflow-y-auto divide-y divide-foreground/5" data-lenis-prevent="">
            {rules.map((r, i) => (
              <li
                key={r.id}
                className="grid grid-cols-[5.5rem_1fr] md:grid-cols-[5.5rem_7rem_1fr_6.5rem] items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-foreground/[0.03] transition-colors rule-row"
                style={{ animationDelay: `${Math.min(i, 14) * 35}ms` }}
              >
                <span className="font-mono text-xs font-bold text-foreground/80 tabular-nums">{r.id}</span>
                <span className="flex items-center gap-2 md:order-none order-3">
                  <span className="relative h-1.5 w-14 bg-foreground/10 overflow-hidden" aria-hidden="true">
                    <span className={`absolute inset-y-0 left-0 ${levelTone(r.level)}`} style={{ width: `${(r.level / 15) * 100}%` }} />
                  </span>
                  <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">L{r.level}</span>
                </span>
                <span className="col-span-2 md:col-span-1 min-w-0 text-sm text-foreground/80 leading-snug">
                  <span className="mr-2 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.15em] text-primary-ink">[{r.tag}]</span>
                  {r.text}
                </span>
                {r.mitre ? (
                  <a href={attackUrl(r.mitre)} target="_blank" rel="noopener noreferrer" className="font-mono text-[0.625rem] font-bold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent w-fit">
                    {r.mitre}
                  </a>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
        </div>

        <FadeIn y={12} duration={0.5} className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            $(…) = Wazuh field placeholders, filled in when the alert fires
          </p>
          <Link
            href="/blog/3omda-custom-detection-rules"
            className="group inline-flex items-center gap-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-primary-ink"
          >
            The full rule pack (XML) <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
