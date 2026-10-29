"use client";

/*
 * HomeLab — the SOC lab as an interactive architecture diagram (what attacks
 * it, what it collects, where logs go, what happens when a rule fires).
 * Click any node to inspect its telemetry role, Arabic summary and case proof.
 */

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import PageLink from "@/components/ui/PageLink";
import { KanjiWatermark } from "@/components/ui/kit";
import { ArrowUpRight, Server } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import BilingualNote from "@/components/ui/BilingualNote";

type Node = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone: "primary" | "accent" | "tertiary" | "muted";
  roleEn: string;
  roleAr: string;
  telemetry: string[];
  proofHref: string;
  proofLabel: string;
};

const NODES: Node[] = [
  {
    id: "kali",
    x: 20,
    y: 40,
    w: 210,
    h: 74,
    title: "Kali Linux",
    sub: "Atomic Red Team · manual",
    tone: "primary",
    roleEn: "Adversary emulation node launching Atomic Red Team TTPs, brute-force campaigns, web exploits and lateral movement against segmented Windows and Linux targets.",
    roleAr: "عقدة محاكاة الهجمات (Red Team / Adversary Emulation) لتشغيل سيناريوهات Atomic Red Team واختبار فاعلية قواعد الكشف.",
    telemetry: ["Atomic Red Team", "Nmap & Nikto", "Metasploit", "Hydra"],
    proofHref: "/blog/soc-env-depi-r3-project",
    proofLabel: "Mini SOC Capstone Report",
  },
  {
    id: "pfsense",
    x: 20,
    y: 190,
    w: 210,
    h: 74,
    title: "pfSense",
    sub: "Firewall · segmentation",
    tone: "muted",
    roleEn: "Network perimeter and internal VLAN segmentation firewall enforcing egress filtering, port mirroring to the IDS sensor, and automated IP quarantine blocks.",
    roleAr: "جدار ناري لعزل الشبكات (VLAN Segmentation) وتمرير نسخ الحزم (SPAN/Mirror) إلى مستشعرات كشف التسلل وتطبيق الحظر التلقائي.",
    telemetry: ["Filterlog", "VLAN ACLs", "Port Mirroring", "Egress Blocks"],
    proofHref: "/blog/soc-env-depi-r3-project",
    proofLabel: "SOC Network Architecture",
  },
  {
    id: "ids",
    x: 20,
    y: 340,
    w: 210,
    h: 74,
    title: "Suricata + Zeek",
    sub: "Network IDS · traffic logs",
    tone: "tertiary",
    roleEn: "Network detection sensors inspecting mirrored traffic for C2 beaconing, DNS tunnelling, SMB lateral movement, and web attack payloads (eve.json + Zeek logs).",
    roleAr: "مستشعرات فحص الشبكة (NIDS) لتحليل الحزم ورصد اتصالات C2 وأنفاق DNS وهجمات الويب وتغذية Wazuh بملفات eve.json.",
    telemetry: ["eve.json", "DNS / HTTP / TLS logs", "ET Open Rules", "PCAP capture"],
    proofHref: "/blog/malicious-web-traffic-room-report",
    proofLabel: "Malicious Web Traffic PCAP",
  },
  {
    id: "win",
    x: 310,
    y: 40,
    w: 210,
    h: 74,
    title: "Windows hosts",
    sub: "Sysmon · Wazuh agent · FIM",
    tone: "muted",
    roleEn: "Monitored Windows endpoints hardened against CIS Benchmarks, streaming Sysmon process/network/registry events, PowerShell ScriptBlock logs, and FIM alerts.",
    roleAr: "أنظمة Windows مُقوّاة وفق CIS Benchmarks ترسل أحداث Sysmon وسجلات PowerShell وتغييرات الملفات الحساسة (FIM).",
    telemetry: ["Sysmon Event IDs 1–22", "Security 4624/4625/4688", "PowerShell 4104", "FIM + Honeytokens"],
    proofHref: "/blog/monitoring-active-directory",
    proofLabel: "Active Directory Monitoring",
  },
  {
    id: "linux",
    x: 310,
    y: 190,
    w: 210,
    h: 74,
    title: "Linux hosts",
    sub: "auditd · Wazuh agent · FIM",
    tone: "muted",
    roleEn: "Monitored Linux servers streaming auditd syscall telemetry, auth.log SSH events, SUID execution, crontab/authorized_keys integrity checks, and rootkit scans.",
    roleAr: "خوادم Linux مُراقبة عبر auditd وFIM لرصد محاولات تصعيد الصلاحيات (SUID / sudo) وتعديل مفاتيح SSH والـ Crontab.",
    telemetry: ["auditd syscalls", "/var/log/auth.log", "FIM (/etc, /bin)", "Rootcheck"],
    proofHref: "/blog/bruteforce-room-report",
    proofLabel: "Linux SSH & HTTP Brute Force",
  },
  {
    id: "wazuh",
    x: 600,
    y: 150,
    w: 210,
    h: 154,
    title: "Wazuh SIEM",
    sub: "Manager · indexer · dashboard",
    tone: "primary",
    roleEn: "Central correlation engine running 52 custom detection rules (IDs 110001–110083) mapped to MITRE ATT&CK, PCI DSS, and GDPR, triggering automated active responses.",
    roleAr: "قلب مركز العمليات الأمنية (Wazuh SIEM): يضم 52 قاعدة كشف مخصصة مربوطة بـ MITRE ATT&CK وPCI DSS وGDPR مع تفعيل الاستجابة الآلية.",
    telemetry: ["52 Custom XML Rules", "MITRE ATT&CK Mapping", "PCI DSS & GDPR Compliance", "Active Response"],
    proofHref: "/blog/3omda-custom-detection-rules",
    proofLabel: "52 Custom Wazuh Rules Report",
  },
  {
    id: "vt",
    x: 850,
    y: 40,
    w: 180,
    h: 74,
    title: "VirusTotal",
    sub: "Hash enrichment (API)",
    tone: "accent",
    roleEn: "Automated threat-intelligence integration querying file SHA-256 hashes generated by Wazuh FIM against the VirusTotal API to flag known malware immediately.",
    roleAr: "ربط آلي مع واجهة VirusTotal API لفحص البصمات الرقمية (SHA-256) لأي ملف جديد أو معدّل ترصده خدمة FIM.",
    telemetry: ["SHA-256 Reputation", "Multi-Engine Verdict", "IOC Enrichment", "Automated Lookup"],
    proofHref: "/blog/unload-malware-report",
    proofLabel: "IcedID Loader & VT Attribution",
  },
  {
    id: "yara",
    x: 850,
    y: 190,
    w: 180,
    h: 74,
    title: "YARA + script",
    sub: "Scan · auto-quarantine",
    tone: "accent",
    roleEn: "Active-response pipeline: when FIM or VirusTotal flags a suspicious binary, Wazuh invokes YARA signature scanning and a Python script to quarantine the file.",
    roleAr: "خط الاستجابة الآلية (Active Response): تشغيل فحص YARA وسكربت Python لعزل البرمجيات الخبيثة تلقائياً فور رصدها (Rule 110015).",
    telemetry: ["Custom YARA Rules", "Python Auto-Quarantine", "Rule 110015 (Level 15)", "Malware Containment"],
    proofHref: "/blog/malware-analysis-wannacry",
    proofLabel: "WannaCry YARA Rules & Response",
  },
  {
    id: "hive",
    x: 850,
    y: 340,
    w: 180,
    h: 74,
    title: "TheHive",
    sub: "Case management",
    tone: "tertiary",
    roleEn: "Incident response case management platform receiving high-severity alerts, observables (IOCs), timelines, and analyst containment tasks.",
    roleAr: "منصة إدارة الحوادث الأمنية (TheHive) لتوثيق التحقيقات، وربط مؤشرات الاختراق (Observables)، ومتابعة مهام الاحتواء والتعافي.",
    telemetry: ["Incident Tickets", "Observable Tracking", "NIST 800-61 Workflow", "Analyst Handover"],
    proofHref: "/blog/report-writing-soc-l2",
    proofLabel: "SOC L2 Incident Reporting",
  },
];

const TONE: Record<Node["tone"], string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  tertiary: "var(--tertiary)",
  muted: "color-mix(in srgb, var(--foreground) 35%, transparent)",
};

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
  const [selectedId, setSelectedId] = useState<string>("wazuh");
  const activeNode = NODES.find((n) => n.id === selectedId) ?? NODES[5];

  return (
    <section id="lab" aria-label="Home lab" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="道場" side="right" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="The lab // Where detections are tested"
          japanese="道場"
          titleA="The"
          titleB="Home Lab."
          description="The SOC lab most of the projects run on: attacked from Kali with Atomic Red Team, watched by Sysmon, auditd, Suricata and Zeek, correlated in Wazuh, enriched by VirusTotal, answered by a YARA scan and a quarantine script, and handed to TheHive as a case. Click any node to inspect its role."
        />

        {/* Quick Node Selector Buttons */}
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Inspect home lab nodes">
          {NODES.map((n) => {
            const isSelected = n.id === selectedId;
            return (
              <button
                key={n.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(n.id)}
                className={`px-3 py-1.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.18em] border transition-colors duration-300 ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-surface/40 text-foreground/65 border-foreground/10 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {n.title}
              </button>
            );
          })}
        </div>

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

            {/* Links */}
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
            {NODES.map((n) => {
              const isSelected = n.id === selectedId;
              return (
                <g
                  key={n.id}
                  className="lab-node cursor-pointer"
                  onClick={() => setSelectedId(n.id)}
                >
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={n.h}
                    fill="var(--surface)"
                    stroke={TONE[n.tone]}
                    strokeWidth={isSelected ? "2.5" : "1"}
                    strokeOpacity={isSelected ? "1" : "0.55"}
                  />
                  <rect x={n.x} y={n.y} width="4" height={n.h} fill={TONE[n.tone]} />
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
              );
            })}
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

        {/* Interactive Node Inspector Drawer */}
        <div className="mt-6 border border-foreground/10 border-l-[3px] border-l-primary bg-surface/60 p-6 md:p-8" role="region" aria-live="polite" aria-label={`Selected node: ${activeNode.title}`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-foreground/5 border border-foreground/10">
                <Server size={18} className="text-primary-ink" aria-hidden="true" />
              </div>
              <div>
                <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-primary-ink">
                  Node Inspector // {activeNode.sub}
                </span>
                <h3 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
                  {activeNode.title}
                </h3>
              </div>
            </div>
            <PageLink
              href={activeNode.proofHref}
              className="group inline-flex items-center gap-2 px-4 py-2.5 border border-tertiary/30 bg-tertiary/10 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-tertiary hover:bg-tertiary hover:text-background transition-colors"
            >
              {activeNode.proofLabel}
              <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </PageLink>
          </div>
          <p className="text-sm md:text-base text-foreground/75 font-light leading-relaxed mb-4">
            {activeNode.roleEn}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {activeNode.telemetry.map((item) => (
              <span key={item} className="px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-accent bg-accent/10 border border-accent/25">
                {item}
              </span>
            ))}
          </div>
          <BilingualNote label="دور العقدة في المختبر // AR">
            {activeNode.roleAr}
          </BilingualNote>
        </div>
      </div>
    </section>
  );
}
