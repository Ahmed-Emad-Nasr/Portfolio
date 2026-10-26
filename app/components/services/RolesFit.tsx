/*
 * RolesFit — "which job is this person for?" answered per role, with the
 * proof for each one a click away.
 *
 * Positioning across all of information security reads as "unfocused" unless
 * each role it claims has its own evidence. Four cards, one per role family,
 * each with three pieces of proof from the site (cases, projects, the
 * experience) and the credential that backs it. Server component: the counts
 * and titles are read at build time.
 */

import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, Radar, Microscope, KeyRound, Download } from "lucide-react";
import SectionHeader from "@/app/core/components/SectionHeader";
import { TiltCard } from "@/app/core/components/Motion";
import { KanjiWatermark } from "@/app/components/shared/kit";
import CaseFilterLink from "@/app/components/cases/CaseFilterLink";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { CV_PDF_HREF, caseKindOf, normalizePublicHref } from "@/app/core/config/shared";
import { rv } from "@/app/core/reveal";

const TITLE = new Map(caseEvidenceLibrary.map((c) => [c.id, c.title]));
const letsDefend = caseEvidenceLibrary.filter((c) => c.platform === "LetsDefend").length;
const forensics = caseEvidenceLibrary.filter((c) => c.category === "Digital Forensics").length;
const malware = caseEvidenceLibrary.filter((c) => caseKindOf(c) === "investigation" && c.category === "Malware Analysis").length;

type Proof = { label: string; href?: string; params?: Record<string, string> };

const ROLES: { id: string; title: string; japanese: string; icon: typeof Radar; pitch: string; proof: Proof[]; credential: string }[] = [
  {
    id: "grc",
    title: "GRC / Compliance Analyst",
    japanese: "統治",
    icon: ClipboardCheck,
    pitch: "Gap assessments against ISO 27001, PCI DSS, COBIT and SWIFT, and the remediation plan after them.",
    proof: [
      { label: "Banque Misr — GRC gaps across 3 units", href: "#experience" },
      { label: "VerifAI 360 — my GRC platform", href: "#work" },
      { label: "PCI DSS & GDPR tags in my detection rules", href: "/blog/3omda-custom-detection-rules" },
    ],
    credential: "Banque Misr internship certificate",
  },
  {
    id: "soc",
    title: "SOC Analyst (L1/L2)",
    japanese: "監視",
    icon: Radar,
    pitch: "Alert triage to a written verdict, and the Wazuh rules that catch the next one.",
    proof: [
      { label: `${letsDefend} LetsDefend alerts investigated`, params: { q: "LetsDefend" } },
      { label: TITLE.get("3omda-custom-detection-rules") ?? "Custom Wazuh rules", href: "/blog/3omda-custom-detection-rules" },
      { label: TITLE.get("soc-env-depi-r3-project") ?? "Mini SOC capstone", href: "/blog/soc-env-depi-r3-project" },
    ],
    credential: "TryHackMe SOC Level 1 & 2 · DEPI IR track",
  },
  {
    id: "dfir",
    title: "IR / DFIR & Malware Analyst",
    japanese: "鑑識",
    icon: Microscope,
    pitch: "Memory, disk, registry and browser artifacts to a timeline; samples taken apart to IOCs and YARA.",
    proof: [
      { label: `${forensics} digital forensics cases`, params: { cat: "Digital Forensics" } },
      { label: `${malware} malware analysis reports`, params: { kind: "investigation", cat: "Malware Analysis" } },
      { label: TITLE.get("malware-analysis-wannacry") ?? "WannaCry analysis", href: "/blog/malware-analysis-wannacry" },
    ],
    credential: "INE Incident Handling & Response Professional · eJPT",
  },
  {
    id: "iam",
    title: "IAM & Data Security",
    japanese: "認証",
    icon: KeyRound,
    pitch: "Access reviews, PAM and least privilege; where sensitive data goes and what stops it leaving.",
    proof: [
      { label: "Banque Misr — IAM, PAM & DevSecOps audit", href: "#experience" },
      { label: TITLE.get("soc257-pdf") ?? "Compromised VPN account", href: "/blog/soc257-pdf" },
      { label: TITLE.get("usb-forensics-report") ?? "PII leak via USB", href: "/blog/usb-forensics-report" },
    ],
    credential: "Banque Misr internship · AWS KMS lab",
  },
];

export default function RolesFit() {
  return (
    <section id="roles" aria-label="Roles I fit" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden">
      <KanjiWatermark chars="適任" side="left" />
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Hiring for // Roles I fit"
          japanese="適任"
          titleA="Roles"
          titleB="I Fit."
          description="One discipline, four entry points. Pick the role you are hiring for — each comes with the three things on this site that prove it."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {ROLES.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={r.id} data-reveal={rv({ y: 36, duration: 0.7, delay: idx * 0.1 })}>
                <TiltCard className="group spotlight relative h-full flex flex-col bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 overflow-hidden">
                  {/* The role's number climbs into view on hover */}
                  <span className="absolute -right-2 -bottom-6 font-display text-[7rem] font-black leading-none text-foreground/[0.03] group-hover:text-primary/10 group-hover:-translate-y-3 transition-all duration-700 select-none" aria-hidden="true">
                    0{idx + 1}
                  </span>
                  <div className="absolute top-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary group-hover:scale-x-100 transition-transform duration-700" aria-hidden="true" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2.5 bg-primary/10 border border-primary/30">
                      <Icon size={18} className="text-primary-ink transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="brush-jp text-xl text-foreground/25" lang="ja" aria-hidden="true" data-jp={r.japanese} />
                  </div>
                  <h3 className="font-display text-xl font-black uppercase tracking-tight text-foreground mb-3 leading-tight">{r.title}</h3>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mb-6">{r.pitch}</p>

                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-foreground/60 mb-2">Proof</span>
                  <ul className="grid gap-2 mb-6">
                    {r.proof.map((p, i) => {
                      const cls = "group/p flex items-start gap-2 text-sm text-foreground/80 hover:text-primary-ink transition-colors";
                      const inner = (
                        <>
                          <span className="mt-0.5 font-mono text-[0.5625rem] font-bold text-primary-ink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex-1">{p.label}</span>
                          <ArrowUpRight size={13} className="mt-0.5 shrink-0 opacity-40 transition-all duration-300 group-hover/p:opacity-100 group-hover/p:translate-x-0.5 group-hover/p:-translate-y-0.5" aria-hidden="true" />
                        </>
                      );
                      return (
                        <li key={p.label}>
                          {p.params ? (
                            <CaseFilterLink params={p.params} className={cls}>{inner}</CaseFilterLink>
                          ) : p.href?.startsWith("#") ? (
                            <a href={p.href} className={cls}>{inner}</a>
                          ) : (
                            <Link href={p.href ?? "/"} className={cls}>{inner}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-foreground/5 flex items-center justify-between gap-3">
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-accent leading-snug">{r.credential}</span>
                    <a
                      href={normalizePublicHref(CV_PDF_HREF)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 border border-foreground/10 text-foreground/60 hover:text-white hover:bg-primary hover:border-primary transition-colors"
                      aria-label={`Download the CV (${r.title})`}
                      title="Download the CV"
                    >
                      <Download size={13} />
                    </a>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
