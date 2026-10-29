"use client";

/* CaseList — the library as a dense table, one row per case */

import PageLink from "@/components/ui/PageLink";
import { ArrowUpRight } from "lucide-react";
import { CASE_KINDS, formatDate, type PdfResource } from "@/lib/shared";
import FadeIn from "@/components/ui/FadeIn";

const KIND_SHORT = new Map(CASE_KINDS.map((k) => [k.id, k.short]));
const KIND_TONE: Record<string, string> = {
  investigation: "text-primary-ink border-primary/40",
  project: "text-accent border-accent/40",
  lab: "text-tertiary border-tertiary/40",
  note: "text-foreground/60 border-foreground/20",
};
const SEVERITY_DOT: Record<string, string> = {
  Critical: "bg-primary",
  High: "bg-accent",
  Medium: "bg-tertiary",
  Low: "bg-foreground/40",
};

export default function CaseList({ items }: { items: readonly PdfResource[] }) {
  return (
    <div className="border border-foreground/10 bg-surface/40">
      <div className="hidden md:grid grid-cols-[1fr_7rem_10rem_9rem_6.5rem_1.5rem] gap-4 px-5 py-3 border-b border-foreground/10 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
        <span>Case</span>
        <span>Kind</span>
        <span>Category</span>
        <span>Platform</span>
        <span>Date</span>
        <span aria-hidden="true" />
      </div>
      <ul className="divide-y divide-foreground/5">
        {items.map((item, i) => (
          <FadeIn as="li" x={-16} y={0} duration={0.45} delay={Math.min(i % 12, 10) * 0.03} key={item.id} id={`case-${item.id}`} className="scroll-mt-28">
            <PageLink
              href={`/blog/${item.id}`}
              className="group relative grid grid-cols-1 md:grid-cols-[1fr_7rem_10rem_9rem_6.5rem_1.5rem] items-center gap-x-4 gap-y-1.5 px-5 py-4 hover:bg-foreground/[0.03] transition-colors"
            >
              <span className="absolute inset-y-0 left-0 w-[2px] bg-primary scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" aria-hidden="true" />
              <div className="flex items-start gap-3 min-w-0">
                {item.severity && (
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rotate-45 ${SEVERITY_DOT[item.severity] ?? "bg-foreground/30"}`} title={`Severity: ${item.severity}`} aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <span className="block text-sm md:text-[0.95rem] text-foreground/85 group-hover:text-foreground transition-colors">{item.title}</span>
                  {item.verdict && <span className="block mt-0.5 text-xs text-foreground/60 truncate">{item.verdict}</span>}
                </div>
              </div>
              <span className={`justify-self-start px-2 py-0.5 border font-mono text-[0.5625rem] uppercase tracking-[0.2em] ${KIND_TONE[item.kind ?? "lab"]}`}>
                {KIND_SHORT.get(item.kind ?? "lab")}
              </span>
              <span className="font-mono text-[0.625rem] text-foreground/60 truncate">{item.category}</span>
              <span className="font-mono text-[0.625rem] text-foreground/60 truncate">{item.platform}</span>
              <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">{item.date ? formatDate(item.date) : ""}</span>
              <ArrowUpRight size={14} className="hidden md:block text-foreground/30 group-hover:text-primary-ink transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </PageLink>
          </FadeIn>
        ))}
      </ul>
    </div>
  );
}
