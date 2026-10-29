"use client";

/*
 * DetectionLibrary — the custom Wazuh rule pack as a filterable rule
 * console: severity bar per rule (level 0–15), group filters, live search,
 * interactive XML rule preview with one-click copy, and ATT&CK links.
 */

import { useMemo, useState } from "react";
import PageLink from "@/components/ui/PageLink";
import { ArrowUpRight, Check, Code2, Copy, Radar, Search, X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { KanjiWatermark, CounterBadge } from "@/components/ui/kit";
import { detectionRules, RULE_GROUP_LABEL } from "@/data/detection-rules";
import { useCopyLink } from "@/lib/use-copy-link";
import FadeIn from "@/components/ui/FadeIn";

const GROUPS = Object.keys(RULE_GROUP_LABEL).filter((g) => detectionRules.some((r) => r.group === g));
const attackUrl = (id: string) => `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;

/* Wazuh levels: 12+ is high-importance, 15 the maximum */
const levelTone = (level: number) => (level >= 14 ? "bg-primary" : level >= 12 ? "bg-accent" : level >= 10 ? "bg-tertiary" : "bg-foreground/40");

const COMPLIANCE_BY_GROUP: Record<string, string> = {
  authentication: "pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d",
  malware: "pci_dss_5.1,pci_dss_11.5,gdpr_IV_35.7.d",
  privilege_escalation: "pci_dss_10.2.2,pci_dss_7.1,gdpr_IV_32.2",
  lateral_movement: "pci_dss_10.6.1,pci_dss_11.4,gdpr_IV_35.7.d",
  web_attacks: "pci_dss_6.5,pci_dss_6.6,gdpr_IV_35.7.d",
  exfiltration: "pci_dss_10.8,gdpr_IV_33,gdpr_IV_35.7.d",
  defense_evasion: "pci_dss_10.2.6,pci_dss_10.5.2,gdpr_IV_35.7.d",
  linux: "pci_dss_10.2.7,pci_dss_11.5,gdpr_IV_35.7.d",
  network: "pci_dss_1.4,pci_dss_11.4,gdpr_IV_35.7.d",
};

function buildRuleXml(r: (typeof detectionRules)[number]): string {
  const compliance = COMPLIANCE_BY_GROUP[r.group] ?? "pci_dss_10.6.1,gdpr_IV_35.7.d";
  return `<rule id="${r.id}" level="${r.level}">
  <description>[${r.tag}] ${r.text}</description>
  <mitre>
    <id>${r.mitre}</id>
  </mitre>
  <group>${r.group},${compliance},</group>
</rule>`;
}

export default function DetectionLibrary() {
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { state: copyState, copy } = useCopyLink();

  const rules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return detectionRules.filter((r) => {
      if (group && r.group !== group) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        r.tag.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.mitre.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q)
      );
    });
  }, [group, query]);

  const techniques = useMemo(() => new Set(detectionRules.map((r) => r.mitre.split(".")[0]).filter(Boolean)).size, []);
  const selectedRule = useMemo(() => detectionRules.find((r) => r.id === selectedId) ?? null, [selectedId]);

  return (
    <section id="detections" aria-label="Detection library" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="検知" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
          <SectionHeader
            eyebrow="Detection engineering // Wazuh"
            japanese="検知"
            titleA="Detection"
            titleB="Library."
            description="My custom Wazuh rule pack, rule by rule: what fires, how loud (Wazuh level 0–15) and which ATT&CK technique it watches. Filter by family, search by rule ID or technique, and click any rule ID to inspect its XML."
          />
          <div className="mb-16 md:mb-20 flex flex-wrap gap-3 shrink-0">
            <CounterBadge value={detectionRules.length} top="Custom" bottom="Rules" />
            <CounterBadge value={techniques} top="Techniques" bottom="Watched" tone="accent" />
          </div>
        </div>

        {/* Search + Group Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter rules by family">
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

          <div className="relative flex items-center gap-2 border-b border-foreground/15 focus-within:border-primary px-2 py-1.5 min-w-[220px]">
            <Search size={14} className="text-foreground/40 shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rule ID, T1110, tag…"
              aria-label="Search Wazuh detection rules"
              className="w-full bg-transparent font-mono text-xs text-foreground placeholder:text-foreground/50 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear rule search"
                className="text-foreground/50 hover:text-primary-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Selected Rule XML Drawer */}
        {selectedRule && (
          <div className="mb-6 border border-primary/40 bg-[#0a0a0c] text-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10">
              <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-accent">
                <Code2 size={13} aria-hidden="true" /> Rule {selectedRule.id} · Level {selectedRule.level} · {selectedRule.mitre}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void copy(buildRuleXml(selectedRule))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/15 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-white/80 hover:border-accent hover:text-accent transition-colors"
                >
                  {copyState === "done" ? <Check size={11} /> : <Copy size={11} />}
                  {copyState === "done" ? "Copied XML" : "Copy XML"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close XML preview"
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-white/85" data-lenis-prevent="">
              {buildRuleXml(selectedRule)}
            </pre>
          </div>
        )}

        {/* The console */}
        <div className="border border-foreground/10 bg-surface/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-foreground/10">
            <span className="flex items-center gap-3 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-foreground/60">
              <Radar size={13} className="text-primary-ink radar-spin" aria-hidden="true" /> local_rules.xml · click a rule ID to inspect XML
            </span>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60 tabular-nums">{rules.length} loaded</span>
          </div>
          <div className="hidden md:grid grid-cols-[5.5rem_7rem_1fr_6.5rem] gap-4 px-5 py-2.5 border-b border-foreground/5 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            <span>Rule</span>
            <span>Level</span>
            <span>Fires on</span>
            <span>ATT&amp;CK</span>
          </div>
          <ul key={`${group ?? "all"}-${query}`} className="max-h-[34rem] overflow-y-auto divide-y divide-foreground/5" data-lenis-prevent="">
            {rules.map((r, i) => {
              const isSelected = selectedId === r.id;
              return (
                <li
                  key={r.id}
                  className={`grid grid-cols-[5.5rem_1fr] md:grid-cols-[5.5rem_7rem_1fr_6.5rem] items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-foreground/[0.03] transition-colors rule-row ${
                    isSelected ? "bg-primary/[0.06]" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(i, 14) * 35}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : r.id)}
                    aria-expanded={isSelected}
                    className="font-mono text-xs font-bold text-left text-primary-ink underline decoration-primary/30 underline-offset-4 hover:decoration-primary tabular-nums w-fit"
                    title="Inspect Wazuh XML rule"
                  >
                    {r.id}
                  </button>
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
              );
            })}
          </ul>
        </div>

        <FadeIn y={12} duration={0.5} className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            $(…) = Wazuh field placeholders, filled in when the alert fires
          </p>
          <PageLink
            href="/blog/3omda-custom-detection-rules"
            className="group inline-flex items-center gap-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-primary-ink"
          >
            The full rule pack (XML) <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </PageLink>
        </FadeIn>
      </div>
    </section>
  );
}
