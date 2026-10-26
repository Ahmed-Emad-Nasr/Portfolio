"use client";

/*
 * CaseFile — the structured half of a case page, drawn from
 * core/config/case-details.ts: the verdict, the facts box, the attack chain,
 * the timeline, the indicators, the response, the detection content and the
 * report itself.
 *
 * Motion, in the theme's language and only where it explains something:
 *  · the attack chain's spine draws itself step by step as it scrolls in,
 *    each node lighting up in order — the order IS the content;
 *  · the timeline's line grows down through its events the same way;
 *  · every indicator "decrypts" into place (the ScrambleText the section
 *    eyebrows use), and copies defanged;
 *  · a reading-progress katana line runs along the top of the page.
 * All of it is CSS transitions switched on by one IntersectionObserver, and
 * all of it is skipped with reduced motion.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertOctagon, Check, ClipboardCopy, Copy, FileText, Fingerprint, GitBranch, History,
  ListChecks, Paperclip, ShieldCheck, Users, BookOpen, Code2,
} from "lucide-react";
import ScrambleText from "@/app/core/components/ScrambleText";
import { defang, normalizePublicHref } from "@/app/core/config/shared";
import type { CaseDetail, IocType } from "@/app/core/config/case-details";
import { rv } from "@/app/core/reveal";

/* ── Shared bits ─────────────────────────────────────────────────────── */

/** true once the element has scrolled into view (and stays true) */
function useInView<T extends HTMLElement>(margin = "0px 0px -20% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, inView };
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1400);
    } catch {
      /* clipboard blocked (insecure context) */
    }
  }, []);
  return { copied, copy };
}

function SectionTitle({ icon, children, japanese, id }: { icon: ReactNode; children: ReactNode; japanese: string; id?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-6 h-[2px] bg-primary" aria-hidden="true" />
      <span className="text-primary-ink" aria-hidden="true">{icon}</span>
      <h2 id={id} className="font-mono text-[0.625rem] text-primary-ink tracking-[0.35em] uppercase font-bold">{children}</h2>
      <span className="brush-jp text-base text-foreground/30" lang="ja" aria-hidden="true" data-jp={japanese} />
      <span className="flex-1 h-px bg-gradient-to-r from-foreground/10 to-transparent" aria-hidden="true" />
    </div>
  );
}

const SEVERITY_TONE: Record<NonNullable<CaseDetail["severity"]>, string> = {
  Critical: "text-primary-ink border-primary/50 bg-primary/10",
  High: "text-accent border-accent/40 bg-accent/10",
  Medium: "text-tertiary border-tertiary/40 bg-tertiary/10",
  Low: "text-foreground/70 border-foreground/20 bg-foreground/[0.04]",
};

const NETWORK_IOC = new Set<IocType>(["ip", "domain", "url", "email"]);
const IOC_LABEL: Record<IocType, string> = {
  ip: "IP", domain: "Domain", url: "URL", email: "E-mail", hash: "Hash", file: "File", registry: "Registry", account: "Account", other: "Artifact",
};

/* ATT&CK links: T1566.001 → /techniques/T1566/001/ */
const attackUrl = (id: string) => `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;

/* ── Reading progress ────────────────────────────────────────────────── */

export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 h-[3px] z-[90] pointer-events-none" aria-hidden="true">
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-primary via-primary to-accent shadow-[0_0_12px_var(--primary)]" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/* ── Verdict ─────────────────────────────────────────────────────────── */

export function VerdictBar({ verdict, severity }: Pick<CaseDetail, "verdict" | "severity">) {
  if (!verdict) return null;
  return (
    <div
      className="relative mb-10 flex flex-col sm:flex-row sm:items-center gap-4 border border-foreground/10 bg-surface/60 px-6 py-5 overflow-hidden"
      data-reveal={rv({ y: 16, duration: 0.6 })}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden="true" />
      <div className="verdict-sweep absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="flex items-center gap-3 shrink-0">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-primary" />
        </span>
        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.35em] text-foreground/60">Verdict</span>
      </div>
      <p className="flex-1 text-base md:text-lg text-foreground font-light leading-snug">{verdict}</p>
      {severity && (
        <span className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] ${SEVERITY_TONE[severity]}`}>
          <AlertOctagon size={12} aria-hidden="true" /> {severity}
        </span>
      )}
    </div>
  );
}

/* ── Facts + chain ───────────────────────────────────────────────────── */

function Facts({ facts }: { facts: NonNullable<CaseDetail["facts"]> }) {
  return (
    <dl className="border border-foreground/10 bg-surface/60 divide-y divide-foreground/5">
      {facts.map((f, i) => (
        <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-3" data-reveal={rv({ x: -12, y: 0, duration: 0.5, delay: i * 0.05 })}>
          <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60 pt-0.5">{f.label}</dt>
          <dd className="text-sm text-foreground/85 [overflow-wrap:anywhere]">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Chain({ chain }: { chain: NonNullable<CaseDetail["chain"]> }) {
  const { ref, inView } = useInView<HTMLOListElement>();
  const step = 0.35; // seconds between nodes
  return (
    <ol ref={ref} className="relative pl-8" data-inview={inView}>
      {/* the spine draws from top to bottom across the whole chain */}
      <span
        className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/70 to-accent origin-top scale-y-0 transition-transform ease-out data-[on=true]:scale-y-100"
        style={{ transitionDuration: `${chain.length * step}s` }}
        data-on={inView}
        aria-hidden="true"
      />
      <span className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-foreground/10" aria-hidden="true" />
      {chain.map((c, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span
            className="absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center border border-foreground/20 bg-background font-mono text-[0.5625rem] font-bold text-foreground/60 transition-all duration-500 data-[on=true]:border-primary data-[on=true]:text-primary-ink data-[on=true]:shadow-[0_0_14px_-2px_var(--primary)]"
            style={{ transitionDelay: `${i * step}s` }}
            data-on={inView}
            aria-hidden="true"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 opacity-70 translate-x-2 transition-all duration-500 data-[on=true]:opacity-100 data-[on=true]:translate-x-0"
            style={{ transitionDelay: `${i * step}s` }}
            data-on={inView}
          >
            <span className="text-sm md:text-[0.95rem] text-foreground/85 leading-relaxed">{c.step}</span>
            {c.technique && (
              <a
                href={attackUrl(c.technique)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.625rem] font-bold text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                {c.technique}
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Timeline ────────────────────────────────────────────────────────── */

function Timeline({ timeline }: { timeline: NonNullable<CaseDetail["timeline"]> }) {
  const { ref, inView } = useInView<HTMLOListElement>();
  return (
    <ol ref={ref} className="relative border-l border-foreground/10 ml-2">
      <span
        className="absolute -left-px top-0 h-full w-[2px] bg-tertiary origin-top scale-y-0 transition-transform ease-out data-[on=true]:scale-y-100"
        style={{ transitionDuration: `${Math.max(0.6, timeline.length * 0.3)}s` }}
        data-on={inView}
        aria-hidden="true"
      />
      {timeline.map((t, i) => (
        <li
          key={i}
          className="relative pl-7 pb-6 last:pb-0 opacity-70 translate-y-1.5 transition-all duration-500 data-[on=true]:opacity-100 data-[on=true]:translate-y-0"
          style={{ transitionDelay: `${i * 0.3}s` }}
          data-on={inView}
        >
          <span className="absolute -left-[6px] top-1.5 h-[11px] w-[11px] rotate-45 border border-tertiary bg-background" aria-hidden="true" />
          <time className="block font-mono text-[0.6875rem] font-bold tracking-wider text-tertiary tabular-nums">{t.time}</time>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{t.event}</p>
        </li>
      ))}
    </ol>
  );
}

/* ── Indicators ──────────────────────────────────────────────────────── */

function Iocs({ iocs }: { iocs: NonNullable<CaseDetail["iocs"]> }) {
  const { copied, copy } = useCopy();
  const shown = (t: IocType, v: string) => (NETWORK_IOC.has(t) ? defang(v) : v);
  const csv = ["type,value,note", ...iocs.map((i) => [IOC_LABEL[i.type], shown(i.type, i.value), i.note ?? ""].map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
          Network indicators are defanged · click a row to copy
        </p>
        <button
          type="button"
          onClick={() => void copy("__all", csv)}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-foreground/10 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/70 hover:border-accent/50 hover:text-accent transition-colors"
        >
          {copied === "__all" ? <Check size={12} /> : <ClipboardCopy size={12} />} {copied === "__all" ? "Copied" : "Copy all as CSV"}
        </button>
      </div>
      <ul className="border border-foreground/10 divide-y divide-foreground/5 bg-surface/40">
        {iocs.map((i, k) => {
          const value = shown(i.type, i.value);
          const key = `${k}`;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => void copy(key, value)}
                className="group w-full text-left grid grid-cols-1 md:grid-cols-[6rem_1fr_auto] items-start gap-x-4 gap-y-1 px-4 py-3 hover:bg-foreground/[0.03] transition-colors"
              >
                <span className="sr-only">Copy </span>
                <span className="font-mono text-[0.5625rem] font-bold uppercase tracking-[0.25em] text-foreground/60 pt-0.5">{IOC_LABEL[i.type]}</span>
                <span className="min-w-0">
                  <ScrambleText
                    text={value}
                    className={`block font-mono text-xs [overflow-wrap:anywhere] ${i.type === "hash" ? "text-primary-ink" : NETWORK_IOC.has(i.type) ? "text-accent" : "text-tertiary"}`}
                  />
                  {i.note && <span className="block mt-1 text-xs text-foreground/60">{i.note}</span>}
                </span>
                <span className="hidden md:flex items-center text-foreground/30 group-hover:text-foreground/70 transition-colors" aria-hidden="true">
                  {copied === key ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Detection ───────────────────────────────────────────────────────── */

function Detection({ items }: { items: NonNullable<CaseDetail["detection"]> }) {
  const { copied, copy } = useCopy();
  return (
    <div className="grid gap-6">
      {items.map((d, k) => (
        <figure key={d.title} className="border border-foreground/10 bg-[#0a0a0c] overflow-hidden" data-reveal={rv({ y: 20, duration: 0.6 })}>
          <figcaption className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-white/5">
            <span className="flex items-center gap-2">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-primary/70" />
                <span className="w-2 h-2 rounded-full bg-accent/70" />
                <span className="w-2 h-2 rounded-full bg-tertiary/70" />
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/60">{d.title}</span>
            </span>
            <button
              type="button"
              onClick={() => void copy(`${k}`, d.code)}
              className="inline-flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              {copied === `${k}` ? <Check size={12} /> : <Copy size={12} />} {copied === `${k}` ? "Copied" : d.lang}
            </button>
          </figcaption>
          <pre className="overflow-x-auto p-4 text-[0.75rem] leading-relaxed text-white/85 font-mono">
            {d.code.split("\n").map((line, i) => (
              <span key={i} className="block">
                <span className="inline-block w-8 select-none text-right pr-4 text-white/20" aria-hidden="true">{i + 1}</span>
                {line}
              </span>
            ))}
          </pre>
        </figure>
      ))}
    </div>
  );
}

/* ── Report viewer ───────────────────────────────────────────────────── */

function ReportViewer({ href, title }: { href: string; title: string }) {
  const [open, setOpen] = useState(false);
  const src = normalizePublicHref(href);
  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative w-full border border-dashed border-foreground/15 bg-surface/40 px-6 py-10 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
        >
          <FileText size={28} className="text-primary-ink transition-transform duration-500 group-hover:-translate-y-1" aria-hidden="true" />
          <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-foreground">Read the report here</span>
          <span className="text-xs text-foreground/60">Opens the PDF inside this page — or use View PDF above</span>
        </button>
      ) : (
        <div className="border border-foreground/10 bg-surface">
          <iframe src={`${src}#view=FitH`} title={`${title} — report`} className="w-full h-[80vh]" loading="lazy" />
          <p className="px-4 py-2 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">
            Not showing? <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary-ink underline underline-offset-4">Open the PDF in a new tab</a>
          </p>
        </div>
      )}
    </div>
  );
}

/* ── The case file ───────────────────────────────────────────────────── */

export default function CaseFile({ detail, href, title }: { detail: CaseDetail; href?: string; title: string }) {
  const hasChainOrFacts = Boolean(detail.facts?.length || detail.chain?.length);
  return (
    <div className="grid gap-14 mb-16">
      {detail.team && (
        <div className="flex items-start gap-3 border border-tertiary/30 bg-tertiary/5 px-5 py-4" data-reveal={rv({ y: 12, duration: 0.5 })}>
          <Users size={16} className="text-tertiary mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-foreground/80"><span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-tertiary mr-2">Team project</span>{detail.team}</p>
        </div>
      )}

      {hasChainOrFacts && (
        <section aria-labelledby="case-file-title" className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10">
          {detail.facts?.length ? (
            <div>
              <SectionTitle icon={<Fingerprint size={13} />} japanese="概要" id="case-file-title">Case facts</SectionTitle>
              <Facts facts={detail.facts} />
            </div>
          ) : <span id="case-file-title" className="sr-only">Case file</span>}
          {detail.chain?.length ? (
            <div>
              <SectionTitle icon={<GitBranch size={13} />} japanese="連鎖">Attack chain</SectionTitle>
              <Chain chain={detail.chain} />
            </div>
          ) : null}
        </section>
      )}

      {detail.timeline?.length ? (
        <section aria-labelledby="case-timeline-title">
          <SectionTitle icon={<History size={13} />} japanese="時系列" id="case-timeline-title">Timeline</SectionTitle>
          <Timeline timeline={detail.timeline} />
        </section>
      ) : null}

      {detail.iocs?.length ? (
        <section aria-labelledby="case-iocs-title">
          <SectionTitle icon={<Fingerprint size={13} />} japanese="痕跡" id="case-iocs-title">Indicators of compromise — {detail.iocs.length}</SectionTitle>
          <Iocs iocs={detail.iocs} />
        </section>
      ) : null}

      {detail.response?.length ? (
        <section aria-labelledby="case-response-title">
          <SectionTitle icon={<ShieldCheck size={13} />} japanese="対応" id="case-response-title">Containment &amp; remediation</SectionTitle>
          <ul className="grid sm:grid-cols-2 gap-3">
            {detail.response.map((r, i) => (
              <li key={i} className="flex gap-3 border border-foreground/5 bg-surface/40 px-4 py-3" data-reveal={rv({ y: 14, duration: 0.5, delay: Math.min(i, 6) * 0.06 })}>
                <ListChecks size={14} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-foreground/80 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.detection?.length ? (
        <section aria-labelledby="case-detection-title">
          <SectionTitle icon={<Code2 size={13} />} japanese="検知" id="case-detection-title">Detection content</SectionTitle>
          <Detection items={detail.detection} />
        </section>
      ) : null}

      {detail.lessons && (
        <section aria-labelledby="case-lessons-title">
          <SectionTitle icon={<BookOpen size={13} />} japanese="教訓" id="case-lessons-title">What I&apos;d do differently</SectionTitle>
          <p className="text-base text-foreground/80 leading-relaxed border-l-2 border-accent pl-5">{detail.lessons}</p>
        </section>
      )}

      {detail.attachments?.length ? (
        <section aria-labelledby="case-attachments-title">
          <SectionTitle icon={<Paperclip size={13} />} japanese="添付" id="case-attachments-title">Attachments</SectionTitle>
          <ul className="flex flex-wrap gap-3">
            {detail.attachments.map((a) => (
              <li key={a.href}>
                <a
                  href={a.href.startsWith("http") ? a.href : normalizePublicHref(a.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-foreground/10 text-sm text-foreground/80 hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  <Paperclip size={13} className="text-primary-ink" aria-hidden="true" /> {a.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {href && (
        <section aria-labelledby="case-report-title">
          <SectionTitle icon={<FileText size={13} />} japanese="報告書" id="case-report-title">
            The report{detail.pages ? ` — ${detail.pages} pages` : ""}
          </SectionTitle>
          <ReportViewer href={href} title={title} />
        </section>
      )}
    </div>
  );
}
