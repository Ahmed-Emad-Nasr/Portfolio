/*
 * HomeLab — the SOC lab behind most of the projects, as an architecture
 * diagram: what attacks it, what it collects, where the logs go and what
 * happens when a rule fires.
 *
 * Built from the stack named in the SOC Environment and Insider Threat
 * projects (Wazuh, Suricata, Zeek, Sysmon, auditd, FIM, YARA, VirusTotal,
 * TheHive, pfSense, Kali with Atomic Red Team). The links "flow" — dashes
 * travel along them in the direction the data goes, and a packet runs each
 * path — so the reader sees the pipeline, not just the boxes. Pure SVG +
 * CSS: no JavaScript, and still with reduced motion.
 */

import SectionHeader from "@/app/core/components/SectionHeader";
import { KanjiWatermark } from "@/app/components/shared/kit";
import FadeIn from "@/app/core/components/FadeIn";

type Node = { id: string; x: number; y: number; w: number; h: number; title: string; sub: string; tone: "primary" | "accent" | "tertiary" | "muted" };

const NODES: Node[] = [
  { id: "kali", x: 20, y: 40, w: 210, h: 74, title: "Kali Linux", sub: "Atomic Red Team · manual", tone: "primary" },
  { id: "pfsense", x: 20, y: 190, w: 210, h: 74, title: "pfSense", sub: "Firewall · segmentation", tone: "muted" },
  { id: "ids", x: 20, y: 340, w: 210, h: 74, title: "Suricata + Zeek", sub: "Network IDS · traffic logs", tone: "tertiary" },
  { id: "win", x: 310, y: 40, w: 210, h: 74, title: "Windows hosts", sub: "Sysmon · Wazuh agent · FIM", tone: "muted" },
  { id: "linux", x: 310, y: 190, w: 210, h: 74, title: "Linux hosts", sub: "auditd · Wazuh agent · FIM", tone: "muted" },
  { id: "wazuh", x: 600, y: 150, w: 210, h: 154, title: "Wazuh SIEM", sub: "Manager · indexer · dashboard", tone: "primary" },
  { id: "vt", x: 850, y: 40, w: 180, h: 74, title: "VirusTotal", sub: "Hash enrichment (API)", tone: "accent" },
  { id: "yara", x: 850, y: 190, w: 180, h: 74, title: "YARA + script", sub: "Scan · auto-quarantine", tone: "accent" },
  { id: "hive", x: 850, y: 340, w: 180, h: 74, title: "TheHive", sub: "Case management", tone: "tertiary" },
];

const TONE: Record<Node["tone"], string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  tertiary: "var(--tertiary)",
  muted: "color-mix(in srgb, var(--foreground) 35%, transparent)",
};

/* Links as paths, in the direction the data flows */
const LINKS: { d: string; tone: Node["tone"]; label?: string; lx?: number; ly?: number; dur: number }[] = [
  { d: "M230 77 H310", tone: "primary", label: "attack", lx: 270, ly: 68, dur: 2.2 },
  { d: "M230 77 C270 77 270 227 310 227", tone: "primary", dur: 2.8 },
  { d: "M125 264 V340", tone: "muted", label: "mirror", lx: 160, ly: 306, dur: 2 },
  { d: "M520 77 C560 77 560 190 600 190", tone: "muted", label: "logs", lx: 585, ly: 118, dur: 2.4 },
  { d: "M520 227 H600", tone: "muted", dur: 2 },
  { d: "M230 377 C420 377 460 270 600 270", tone: "tertiary", label: "alerts", lx: 420, ly: 352, dur: 3.2 },
  { d: "M810 190 C830 190 830 77 850 77", tone: "accent", dur: 2.2 },
  { d: "M810 227 H850", tone: "accent", dur: 1.8 },
  { d: "M810 270 C830 270 830 377 850 377", tone: "tertiary", dur: 2.4 },
];

export default function HomeLab() {
  return (
    <section id="lab" aria-label="Home lab" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="道場" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="The lab // Where detections are tested"
          japanese="道場"
          titleA="The"
          titleB="Home Lab."
          description="The SOC lab most of the projects run on: attacked from Kali with Atomic Red Team, watched by Sysmon, auditd, Suricata and Zeek, correlated in Wazuh, enriched by VirusTotal, answered by a YARA scan and a quarantine script, and handed to TheHive as a case."
        />

        {/* Scrolls sideways on narrow screens — focusable so keyboard users can
            scroll it too (arrow keys), and named for screen readers */}
        <FadeIn as="figure" y={30} duration={0.8} className="relative border border-foreground/10 bg-surface/40 p-4 md:p-8 overflow-x-auto" tabIndex={0} aria-labelledby="lab-title" data-lenis-prevent="">
          <svg viewBox="0 0 1040 440" className="min-w-[760px] w-full h-auto" role="img" aria-labelledby="lab-title lab-desc">
            <title id="lab-title">SOC home lab architecture</title>
            <desc id="lab-desc">
              Kali Linux attacks Windows and Linux endpoints behind pfSense. Endpoint logs (Sysmon, auditd, file integrity) and Suricata and Zeek network alerts flow into Wazuh. Wazuh enriches hashes through VirusTotal, triggers a YARA scan and quarantine script, and opens cases in TheHive.
            </desc>
            <defs>
              <pattern id="lab-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.05" />
              </pattern>
            </defs>
            <rect width="1040" height="440" fill="url(#lab-grid)" className="text-foreground" />

            {/* Links: dashed, flowing in the data's direction, each with a packet */}
            {LINKS.map((l, i) => (
              <g key={i}>
                <path d={l.d} fill="none" stroke={TONE[l.tone]} strokeOpacity="0.25" strokeWidth="2" />
                <path d={l.d} fill="none" stroke={TONE[l.tone]} strokeWidth="2" strokeDasharray="6 10" className="lab-flow" style={{ animationDuration: `${l.dur}s` }} />
                <circle r="4" fill={TONE[l.tone]} className="lab-packet">
                  <animateMotion dur={`${l.dur * 1.6}s`} repeatCount="indefinite" path={l.d} begin={`${(i * 0.37).toFixed(2)}s`} />
                </circle>
                {l.label && (
                  <text x={l.lx} y={l.ly} textAnchor="middle" className="lab-label" fill="currentColor">
                    {l.label}
                  </text>
                )}
              </g>
            ))}

            {/* Nodes */}
            {NODES.map((n) => (
              <g key={n.id} className="lab-node">
                <rect x={n.x} y={n.y} width={n.w} height={n.h} fill="var(--surface)" stroke={TONE[n.tone]} strokeOpacity="0.55" />
                <rect x={n.x} y={n.y} width="3" height={n.h} fill={TONE[n.tone]} />
                {n.id === "wazuh" && (
                  <circle cx={n.x + n.w - 16} cy={n.y + 16} r="5" fill="var(--primary)" className="lab-beacon" />
                )}
                <text x={n.x + 16} y={n.y + (n.h > 100 ? 66 : 32)} className="lab-title" fill="currentColor">
                  {n.title}
                </text>
                <text x={n.x + 16} y={n.y + (n.h > 100 ? 90 : 54)} className="lab-sub" fill="currentColor">
                  {n.sub}
                </text>
                {n.id === "wazuh" && (
                  <text x={n.x + 16} y={n.y + 118} className="lab-sub" fill="var(--primary)">
                    52 custom rules
                  </text>
                )}
              </g>
            ))}
          </svg>
          <p className="md:hidden mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-primary-ink flex items-center gap-2" aria-hidden="true">
            Swipe for the full lab <span className="inline-block animate-pulse">→</span>
          </p>
          <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
            <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-primary" /> attack path</span>
            <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-foreground/40" /> telemetry</span>
            <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-tertiary" /> alerts &amp; cases</span>
            <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-accent" /> enrichment &amp; response</span>
          </figcaption>
        </FadeIn>
      </div>
    </section>
  );
}
