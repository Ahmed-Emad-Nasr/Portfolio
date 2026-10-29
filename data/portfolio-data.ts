/*
 * Everything the home page renders, in the shape data/types.ts describes.
 * Read by client components, so it must not import cases.ts or attack.ts
 * (numbers from the case library live in live-copy.ts, server-only).
 */

import type { Experience, PortfolioData, WorkItem } from "@/data/types";
import { knowledgeEducationItems } from "@/data/experience";
import { languages, skillGroups } from "@/data/skills";
import { GITHUB_USERNAME, staticProjectFallback } from "@/data/projects";
import { GALLERY_IMAGE_COUNT, galleryImagePath, galleryMetadata } from "@/data/certifications";
import { CV_PDF_HREF, YOUTUBE_CHANNEL_URL, normalizePublicHref } from "@/lib/shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthYear = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
};

/* ── Experience ─────────────────────────────────────────────────────────── */

/* Proof per role: the certificate in the gallery, and the case-library view
   of the work done there */
const ROLE_PROOF: Record<string, Pick<Experience, "proof" | "cases">> = {
  "Banque Misr": { proof: { label: "Internship certificate", href: normalizePublicHref(galleryImagePath(1)) } },
  "Digital Egypt Pioneers Initiative (DEPI)": {
    proof: { label: "DEPI certificate", href: normalizePublicHref(galleryImagePath(5)) },
    cases: { label: "LetsDefend investigations", params: { q: "LetsDefend" } },
  },
  "Information Technology Institute (ITI)": {
    proof: { label: "ITI bootcamp certificate", href: normalizePublicHref(galleryImagePath(14)) },
    cases: { label: "ITI projects", params: { q: "ITI" } },
  },
  "Google Developer Groups (GDG)": { proof: { label: "GDG bootcamp certificate", href: normalizePublicHref(galleryImagePath(36)) } },
};

const ROLE_INTRO: Record<string, { intro: string; japanese: string; location: string }> = {
  "AMIT Learning": {
    intro: "Teaching the security track end to end — networking and Linux first, then SOC, pentest, IAM and GRC labs.",
    japanese: "サイバーセキュリティ講師",
    location: "Cairo, Egypt",
  },
  "Banque Misr": {
    intro: "Auditing GRC, architecture and security operations inside one of Egypt's largest banks.",
    japanese: "情報セキュリティ・インターン",
    location: "Cairo, Egypt",
  },
  "Digital Egypt Pioneers Initiative (DEPI)": {
    intro: "Alert triage and detection engineering on SOC simulation platforms, following NIST 800-61.",
    japanese: "インシデント対応アナリスト",
    location: "Egypt",
  },
  "Information Technology Institute (ITI)": {
    intro: "Offensive security training: CTFs, exploitation, pivoting, and the eJPT path.",
    japanese: "ペネトレーションテスター研修生",
    location: "Egypt",
  },
  "Google Developer Groups (GDG)": {
    intro: "Security sessions and CTF challenge design for a student developer community.",
    japanese: "サイバーセキュリティ講師",
    location: "Egypt",
  },
  IEEE: {
    intro: "C and Python training for the engineering teams building robotics projects.",
    japanese: "技術講師・委員",
    location: "Benha, Egypt",
  },
  "Benha University": {
    intro: "Computer Science, majoring in Information Security & Digital Forensics.",
    japanese: "コンピューターサイエンス学士",
    location: "Benha, Egypt",
  },
};

/* Newest start date first, education last — the same order as the CV */
const experience: Experience[] = [...knowledgeEducationItems]
  .filter((item) => !("cv" in item && item.cv === false))
  .filter((item) => item.kind !== "education" || item.subTag === "Benha University")
  .sort((a, b) => Number(a.kind === "education") - Number(b.kind === "education") || b.startDate.localeCompare(a.startDate))
  .map((item) => {
    const meta = ROLE_INTRO[item.subTag];
    const end = "endDate" in item ? monthYear(item.endDate) : "Present";
    return {
      company: item.subTag,
      link: item.subTagHyperlink,
      role: item.tag,
      japaneseRole: meta?.japanese,
      location: meta?.location ?? "Egypt",
      period: `${monthYear(item.startDate)} – ${end}`,
      description: meta?.intro ?? item.desc.split("•")[0].trim(),
      details: item.desc.split("•").map((line) => line.trim()).filter(Boolean),
      kind: item.kind,
      isEducation: item.kind === "education",
      ...(ROLE_PROOF[item.subTag] ?? {}),
    };
  });

/* ── Selected work ──────────────────────────────────────────────────────── */

const repoByName = (name: string) => staticProjectFallback.find((r) => r.name === name);
const urlOf = (name: string) => repoByName(name)?.html_url ?? `https://github.com/${GITHUB_USERNAME}`;

const work: WorkItem[] = [
  {
    id: "verifai-360",
    title: "VerifAI 360",
    type: "platform",
    tagline: "GRC evidence checks without the spreadsheet marathon.",
    problem: "Control mapping and gap analysis eat most of an assessment's time, and most of it is repetitive.",
    role: "Architected the platform: evidence validation, risk scoring, automated gap analysis and remediation plans.",
    stack: ["Python", "AI/LLMs", "ISO 27001", "NIST", "PCI DSS", "GDPR"],
    platform: "AI-assisted web app",
    status: "open-source",
    year: "2026",
    links: { github: urlOf("Compliance-Framework"), demo: repoByName("Compliance-Framework")?.homepage || undefined },
    metrics: ["150+ frameworks", "−30% manual effort", "+15% faster assessments"],
    featured: true,
  },
  {
    id: "soc-environment",
    title: "SOC Environment",
    type: "lab",
    tagline: "A full detection stack, built to be attacked.",
    problem: "Detections need a place where they can be written, fired and measured end to end.",
    role: "Built the lab — SIEM, NIDS, FIM and endpoint telemetry — then attacked it to tune the rules.",
    stack: ["Wazuh", "Suricata", "Zeek", "YARA", "FIM", "auditd", "Sysmon"],
    platform: "Virtual SOC",
    status: "open-source",
    year: "2025",
    links: { github: urlOf("SOC-Environment"), caseStudy: "/blog/soc-env-depi-r3-project" },
    metrics: ["Rule merged into SOC Fortress", "95%+ true positives", "50+ simulated attacks"],
    featured: true,
  },
  {
    id: "insider-threat",
    title: "Insider Threat Deception",
    type: "lab",
    tagline: "Honeytokens that tell you who went looking.",
    problem: "Insiders already have access, so the signal has to come from what they touch, not how they got in.",
    role: "Designed the deception layer in Wazuh, the pfSense + Suricata monitoring, and a Python quarantine script.",
    stack: ["Wazuh", "pfSense", "Suricata", "Python", "VirusTotal"],
    platform: "Wazuh + pfSense",
    status: "open-source",
    year: "2025",
    links: { github: urlOf("insider-threat-detection-deception") },
    metrics: ["100% of access attempts caught", "−30% false positives", "−10% triage time"],
    featured: true,
  },
  {
    id: "malware-analysis",
    title: "Malware Analysis",
    type: "research",
    tagline: "Twenty samples, taken apart in an isolated lab.",
    problem: "IOCs are only useful when they come from the sample's real behaviour, not a vendor summary.",
    role: "Static and dynamic analysis, C2 traffic capture, and a parser to pull embedded payloads.",
    stack: ["DIE", "CFF Explorer", "Wireshark", "FakeNet-NG", "Process Hacker", "FIM"],
    platform: "Isolated lab",
    status: "open-source",
    year: "2025",
    links: { github: urlOf("Malware-Analysis-and-Prevention-Strategy"), caseStudy: "/blog/depi-r4-project" },
    metrics: ["20+ samples", "C2 behaviour mapped", "Actionable IOCs"],
    featured: true,
  },
  {
    id: "threat-intel-tool",
    title: "Threat Intelligence Tool",
    type: "tool",
    tagline: "One lookup instead of four browser tabs.",
    problem: "Checking a hash or a CVE meant visiting four services and stitching the answers together by hand.",
    role: "Python utility that queries VirusTotal, Hybrid Analysis, NVD and Exploit-DB in one pass.",
    stack: ["Python", "VirusTotal", "Hybrid Analysis", "NVD", "Exploit-DB"],
    platform: "CLI",
    status: "open-source",
    year: "2025",
    links: { github: urlOf("Threat-Intelligence-Tool"), demo: repoByName("Threat-Intelligence-Tool")?.homepage || undefined },
    metrics: ["4 intel sources", "10 GitHub stars", "Video demo"],
  },
  {
    id: "attack-simulation",
    title: "Attack Simulation",
    type: "lab",
    tagline: "Find it, prove it, map it, fix it.",
    problem: "A scanner finding is a guess until someone shows it is exploitable and what it leads to.",
    role: "Nessus assessment, Kali proofs of concept on Metasploitable and DVWA, findings mapped to ATT&CK.",
    stack: ["Nessus", "Kali Linux", "Metasploitable", "DVWA", "MITRE ATT&CK"],
    platform: "Kali + Nessus",
    status: "open-source",
    year: "2026",
    links: { github: urlOf("Attack-Simulation-Security-Assessment") },
    metrics: ["15+ attacks simulated", "Kill Chain mapped", "Fixes recommended"],
  },
  {
    id: "cybersuite",
    title: "3OMDA CyberSuite",
    type: "tool",
    tagline: "Document triage and threat intel in one desktop window.",
    problem: "A suspicious PDF means a parser in one window and four intel sites in four tabs.",
    role: "Merged my PDF malware-analysis toolkit and my threat-intelligence tool into one Tkinter desktop app.",
    stack: ["Python", "Tkinter", "VirusTotal", "Hybrid Analysis", "NVD", "AbuseIPDB", "OTX"],
    platform: "Desktop (Tkinter)",
    status: "open-source",
    year: "2026",
    links: { github: `https://github.com/${GITHUB_USERNAME}/3omda-PDFparser-tool` },
    metrics: ["Static PDF analysis", "5 intel sources", "Built from two earlier tools"],
  },
  {
    id: "webp-converter",
    title: "3omda WebP Converter",
    type: "tool",
    tagline: "Batch images to WebP, from the terminal or a window.",
    problem: "Screenshots for reports and this site were heavy PNGs; converting them one by one does not scale.",
    role: "Wrote a converter and compressor with a CLI (convert.py) and a Tkinter GUI (gui.py).",
    stack: ["Python", "Tkinter", "CLI", "WebP"],
    platform: "CLI + desktop",
    status: "open-source",
    year: "2026",
    links: { github: `https://github.com/${GITHUB_USERNAME}/3omda-WEBP-Converter-and-compressor` },
    metrics: ["CLI + GUI", "Batch conversion", "Compression"],
  },
];

/* ── Stack: the skill groups, minus soft skills ────────────────────────── */

const STACK_JP: Record<string, string> = {
  grc: "統治",
  siem: "監視",
  ir: "対応",
  forensics: "鑑識",
  identity: "認証",
  data: "保護",
  vuln: "脆弱",
  cloud: "雲",
  intel: "諜報",
  network: "網",
  frameworks: "規範",
  automation: "自動化",
};

/* Short card titles; the full group names (skills.ts) are on the CV page */
const STACK_TITLE: Record<string, string> = {
  grc: "GRC & Compliance",
  siem: "SIEM & Monitoring",
  ir: "Incident Response",
  forensics: "Malware & Forensics",
  identity: "Identity & Access",
  data: "Data Security",
  vuln: "Vuln. Management",
  cloud: "Cloud Security",
  intel: "Threat Intel",
  network: "Network Security",
  frameworks: "Frameworks",
  automation: "Automation",
};

export const PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "Ahmed Emad Nasr",
    title: "Information Security Officer",
    japaneseTitle: "情報セキュリティ担当 • Information Security Officer",
    availability: "Open to InfoSec roles: Officer, Engineer, GRC, SOC, IR/DFIR, IAM and Security Education",
    /* The areas shown on the hero's "Focus" row */
    focus: ["GRC", "SOC", "IR & DFIR", "Malware", "IAM", "Data Security"],
    /* The jobs typed one after another under the name */
    roles: [
      "Information Security Officer",
      "Information Security Engineer",
      "GRC & Compliance Analyst",
      "SOC Analyst",
      "DFIR & Malware Analyst",
      "IAM & Data Security",
      "Cybersecurity Instructor",
    ],
    contact: {
      email: "ahmed.em.nasr@gmail.com",
      phone: "+201013972690",
      github: GITHUB_USERNAME,
      linkedin: "https://www.linkedin.com/in/ahmed-emad-nasr/",
      location: "Cairo, Egypt",
      whatsapp: "201013972690",
      youtube: YOUTUBE_CHANNEL_URL,
      instagram: "https://www.instagram.com/ahmed_emad_nasr/",
      x: "https://x.com/0x3omda",
    },
    hero: {
      tagline: "From the risk register to the root cause.",
      japaneseTagline: "統治から根本原因まで。",
      /* The "Technical Specifications" strip under the name */
      specs: [
        { label: "Govern", value: "ISO 27001, PCI DSS, NIST CSF" },
        { label: "Detect", value: "Wazuh, Splunk, ATT&CK" },
        { label: "Respond", value: "NIST 800-61, Volatility, YARA" },
        { label: "Protect", value: "IAM, PAM, DLP" },
      ],
      photo: normalizePublicHref("Assets/art-gallery/Images/logo/3omda.webp"),
      cvUrl: normalizePublicHref(CV_PDF_HREF),
    },
  },
  experience,
  work,
  stack: skillGroups
    .filter((g) => g.id !== "soft")
    .map((g) => ({
      id: g.id,
      title: STACK_TITLE[g.id] ?? g.label,
      japanese: STACK_JP[g.id] ?? "技",
      items: [...g.items],
      evidence: [...(g.evidence ?? [])],
    })),
  process: [
    /* The NIST CSF functions, folded into four steps */
    { id: "govern", index: "01", title: "Govern", japanese: "統治", description: "Assets, risks and controls mapped against ISO 27001 and NIST CSF. Every gap gets an owner, a priority and a fix." },
    { id: "protect", index: "02", title: "Protect", japanese: "防御", description: "Least privilege, hardened baselines, encrypted data — IAM, PAM and CIS Benchmarks before anything else." },
    { id: "detect", index: "03", title: "Detect", japanese: "検知", description: "Baselines, logs and alerts. Know what normal looks like, then map what isn't to ATT&CK." },
    { id: "respond", index: "04", title: "Respond", japanese: "対応", description: "Contain, eradicate, recover — NIST 800-61, not instinct — then a report with the root cause and the fix." },
  ],
  languages: languages.map((l) => ({ code: l.code, name: l.name, level: l.short })),
  contributions: [
    {
      name: "SOC Fortress",
      org: "Wazuh rules",
      description: "A custom Wazuh detection rule, reviewed and merged by the maintainers of the open-source SOC Fortress ruleset.",
      link: "https://github.com/socfortress/Wazuh-Rules",
    },
    {
      name: "GDG CTF",
      org: "Google Developer Groups",
      description: "Co-designed 10+ CTF challenges and delivered 35+ security sessions to 120+ learners.",
      link: "https://gdg.community.dev/",
    },
    {
      name: "YouTube",
      org: "Community",
      description: "Free cybersecurity walkthroughs — 500+ subscribers and 60,000+ views so far.",
      link: YOUTUBE_CHANNEL_URL,
    },
  ],
  artGallery: Array.from({ length: GALLERY_IMAGE_COUNT }, (_, k) => ({
    src: normalizePublicHref(galleryImagePath(k + 1)),
    thumb: normalizePublicHref(galleryImagePath(k + 1)),
    ...galleryMetadata(k + 1),
  })),
};
