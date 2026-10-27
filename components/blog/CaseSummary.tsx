/*
 * CaseSummary — a case description drawn as an incident briefing
 * (objective → actions → outcome → artifacts), parsed by lib/case-summary.ts.
 */

import { useMemo, type ReactNode } from "react";
import { useCopyLink } from "@/lib/use-copy-link";
import { Check, Copy, Crosshair, ListChecks, Route, ShieldCheck, Fingerprint } from "lucide-react";
import { parseCaseSummary, type Artifact, type SummaryStep } from "@/lib/case-summary";
import FadeIn from "@/components/ui/FadeIn";

/* ── Inline highlighting ───────────────────────────────────────────────── */

const TOKEN =
  /\u0000(\d+)\u0000|(\b(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?\b)|(\bCVE-\d{4}-\d{4,}\b|\bOSVDB-\d+\b|\bT1\d{3}(?:\.\d{3})?\b)|(\b\d{1,5}\/(?:tcp|udp)\b)|(\b\d+(?:\.\d+)?%|\b\d[\d,]*\+(?=\s|$|[.,;)]))/gi;

const isVersion = (ip: string) => /^(?:\d\.){3}\d(?::\d+)?$/.test(ip);

function Rich({ text, code }: { text: string; code: readonly string[] }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${at}-${m[0]}`;
    if (m[1] !== undefined) {
      out.push(
        <code
          key={key}
          className="mx-[1px] px-1.5 py-[1px] font-mono text-[0.82em] text-tertiary bg-tertiary/10 border border-tertiary/20 [overflow-wrap:anywhere] [box-decoration-break:clone]"
        >
          {code[Number(m[1])]}
        </code>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        isVersion(m[2]) ? m[2] : (
          <span key={key} className="font-mono text-[0.88em] text-accent whitespace-nowrap">{m[2]}</span>
        ),
      );
    } else if (m[3] !== undefined) {
      out.push(<span key={key} className="font-mono text-[0.88em] font-bold text-primary-ink whitespace-nowrap">{m[3]}</span>);
    } else if (m[4] !== undefined) {
      out.push(<span key={key} className="font-mono text-[0.88em] text-tertiary whitespace-nowrap">{m[4]}</span>);
    } else {
      out.push(<strong key={key} className="font-semibold text-foreground">{m[5]}</strong>);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/* ── Building blocks ───────────────────────────────────────────────────── */

function Label({ index, icon, children }: { index: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[0.625rem] font-bold text-primary-ink tabular-nums">{index}</span>
      <span className="text-foreground/40" aria-hidden="true">{icon}</span>
      <h3 className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-foreground/70">{children}</h3>
      <span className="flex-1 h-px bg-gradient-to-r from-foreground/10 to-transparent" aria-hidden="true" />
    </div>
  );
}

function Steps({ steps, code, start = 1 }: { steps: SummaryStep[]; code: readonly string[]; start?: number }) {
  return (
    <ol className="relative ml-1 border-l border-foreground/10">
      {steps.map((step, i) => (
        <FadeIn as="li" x={-14} y={0} duration={0.55} delay={Math.min(i, 8) * 0.07} key={i} className="relative pl-6 md:pl-8 pb-5 last:pb-0">
          <span
            className="brief-node absolute -left-[5px] top-[0.55em] w-[9px] h-[9px] bg-background border border-primary rotate-45"
            style={{ animationDelay: `${i * 0.3}s` }}
            aria-hidden="true"
          />
          <span className="block font-mono text-[0.5625rem] font-bold tracking-[0.25em] text-foreground/65 mb-1 tabular-nums" aria-hidden="true">
            STEP {String(start + i).padStart(2, "0")}
          </span>
          <p className="text-[0.95rem] md:text-base text-foreground/85 leading-relaxed font-light">
            <Rich text={step.text} code={code} />
          </p>
          {step.items && (
            <ul className="mt-3 grid gap-2 border border-foreground/5 bg-foreground/[0.02] px-4 py-3">
              {step.items.map((item, k) => (
                <li key={k} className="flex gap-3 text-sm text-foreground/75 leading-relaxed font-light">
                  <span className="font-mono text-tertiary shrink-0 select-none" aria-hidden="true">›</span>
                  <span className="min-w-0"><Rich text={item} code={code} /></span>
                </li>
              ))}
            </ul>
          )}
        </FadeIn>
      ))}
    </ol>
  );
}

const ARTIFACT_LABEL: Record<Artifact["kind"], string> = {
  ip: "IP",
  cve: "CVE",
  osvdb: "OSVDB",
  port: "Port",
  technique: "ATT&CK",
};

function ArtifactChip({ artifact }: { artifact: Artifact }) {
  const { state, copy } = useCopyLink();
  const copied = state === "done";
  return (
    <button
      type="button"
      onClick={() => void copy(artifact.value)}
      className="group inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[0.6875rem] border border-foreground/10 bg-background/40 hover:border-accent/50 transition-colors"
    >
      {/* Accessible name = "Copy" + the visible text (voice control) */}
      <span className="sr-only">Copy </span>
      <span className="text-[0.5625rem] font-bold uppercase tracking-[0.2em] text-foreground/65">{ARTIFACT_LABEL[artifact.kind]}</span>{" "}
      <span className={artifact.kind === "cve" || artifact.kind === "osvdb" ? "text-primary-ink" : "text-accent"}>{artifact.value}</span>
      <span className="sr-only" aria-live="polite">{copied ? " — copied" : ""}</span>
      {copied ? (
        <Check size={11} className="text-accent" aria-hidden="true" />
      ) : (
        <Copy size={11} className="text-foreground/30 group-hover:text-foreground/60 transition-colors" aria-hidden="true" />
      )}
    </button>
  );
}

/* ── The briefing ──────────────────────────────────────────────────────── */

export default function CaseSummary({ description }: { description: string }) {
  const s = useMemo(() => parseCaseSummary(description), [description]);
  let n = 1;
  const next = () => String(n++).padStart(2, "0");

  return (
    <div className="grid gap-9">
      <section>
        <Label index={next()} icon={<Crosshair size={13} />}>Objective</Label>
        <p className="text-lg md:text-xl text-foreground leading-relaxed font-light border-l-2 border-primary pl-5">
          <Rich text={s.objective} code={s.code} />
        </p>
      </section>

      {s.steps.length > 0 && (
        <section>
          <Label index={next()} icon={<ListChecks size={13} />}>{s.phases.length ? "Scope" : "Actions taken"}</Label>
          <Steps steps={s.steps} code={s.code} />
        </section>
      )}

      {s.phases.length > 0 && (
        <section>
          <Label index={next()} icon={<Route size={13} />}>Phases — {s.phases.length}</Label>
          <div className="grid gap-5">
            {s.phases.map((phase) => (
              <div key={phase.index} className="border border-foreground/5 bg-foreground/[0.015]">
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
                    <span className="px-2 py-0.5 font-mono text-[0.5625rem] font-bold tracking-[0.25em] text-background bg-primary">
                      PHASE {String(phase.index).padStart(2, "0")}
                    </span>
                    <h4 className="font-display text-sm md:text-base font-black uppercase tracking-tight text-foreground">
                      <Rich text={phase.title} code={s.code} />
                    </h4>
                  </div>
                  <div className="px-5 py-5">
                    <Steps steps={phase.steps} code={s.code} />
                  </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {s.outcome && (
        <section>
          <Label index={next()} icon={<ShieldCheck size={13} />}>Outcome</Label>
          <div className="flex gap-4 border border-accent/25 bg-accent/[0.06] px-5 py-4">
            <ShieldCheck size={18} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[0.95rem] md:text-base text-foreground/85 leading-relaxed font-light">
              <Rich text={s.outcome} code={s.code} />
            </p>
          </div>
        </section>
      )}

      {s.artifacts.length > 0 && (
        <section>
          <Label index={next()} icon={<Fingerprint size={13} />}>Artifacts &amp; indicators</Label>
          <div className="flex flex-wrap gap-2">
            {s.artifacts.map((a, i) => (
              <FadeIn y={10} duration={0.45} delay={Math.min(i, 10) * 0.04} key={`${a.kind}:${a.value}`}>
                <ArtifactChip artifact={a} />
              </FadeIn>
            ))}
          </div>
          <p className="mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/65">Click an indicator to copy it</p>
        </section>
      )}
    </div>
  );
}
