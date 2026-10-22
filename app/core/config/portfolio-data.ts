/*
 * core/config/portfolio-data.ts
 * Author: Ahmed Emad Nasr
 *
 * Everything the home page renders, in the shape the Sensei-Dev design
 * expects (core/types/portfolio.ts). Wherever the data already lives in
 * another config file — experience, certifications, achievements, skills,
 * projects, cases — it is read from there, not copied, so the home page,
 * the CV and the case library can never disagree.
 *
 * Nothing here may import cases.ts, attack.ts or case-stats.ts: this module is
 * read by ~18 client components, so whatever it imports ships to every visitor.
 * The numbers computed from the case library live in live-copy.ts (server-only)
 * and reach the client sections as props.
 *
 * Asset paths go through normalizePublicHref so they resolve under the
 * /Portfolio base path on every route, not just on the home page.
 */

import type { Certificate, Experience, PortfolioData, WorkItem } from "../types/portfolio";
import { knowledgeEducationItems } from "./experience";
import { certifications } from "./certifications";
import { achievements } from "./achievements";
import { skillGroups } from "./skills";
import { GITHUB_USERNAME, projectBullets, staticProjectFallback } from "./projects";
import { GALLERY_IMAGE_COUNT, galleryImagePath, galleryTitle } from "./certifications";
import { CV_PDF_HREF, YOUTUBE_CHANNEL_URL, normalizePublicHref } from "./shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthYear = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${y}`;
};

/* ── Experience ─────────────────────────────────────────────────────────── */

/* One line per role, in the voice of the card's italic intro. The bullets
   underneath come straight from experience.ts. */
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
    };
  });

/* ── Projects ───────────────────────────────────────────────────────────── */

const repoName = (url: string) => url.replace(/\/+$/, "").split("/").pop() ?? url;
const repoByName = (name: string) => staticProjectFallback.find((r) => r.name === name);
const urlOf = (name: string) => repoByName(name)?.html_url ?? `https://github.com/${GITHUB_USERNAME}`;

const PINNED = [
  "SOC-Environment",
  "insider-threat-detection-deception",
  "Malware-Analysis-and-Prevention-Strategy",
  "Compliance-Framework",
  "Threat-Intelligence-Tool",
  "Attack-Simulation-Security-Assessment",
];

const HIGHLIGHT_META: Record<string, { name: string; type: string; metrics: string[] }> = {
  "SOC-Environment": { name: "SOC-Environment", type: "Detection Lab", metrics: ["Wazuh", "Suricata + Zeek", "Rule merged upstream"] },
  "insider-threat-detection-deception": { name: "Insider-Threat-Deception", type: "Detection Lab", metrics: ["Honeytokens", "pfSense", "Auto-quarantine"] },
  "Malware-Analysis-and-Prevention-Strategy": { name: "Malware-Analysis", type: "Research", metrics: ["20+ samples", "C2 traffic", "IOCs"] },
  "Compliance-Framework": { name: "VerifAI-360", type: "GRC Platform", metrics: ["150+ frameworks", "Gap analysis", "AI-assisted"] },
  "Threat-Intelligence-Tool": { name: "Threat-Intelligence-Tool", type: "CLI Tool", metrics: ["VirusTotal", "Hybrid Analysis", "NVD + Exploit-DB"] },
  "Attack-Simulation-Security-Assessment": { name: "Attack-Simulation", type: "Assessment", metrics: ["Nessus", "ATT&CK", "Kill Chain"] },
};

/* ── Selected work ──────────────────────────────────────────────────────── */

const work: WorkItem[] = [
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
    links: { github: urlOf("SOC-Environment") },
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
    platform: "Detection lab",
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
    links: { github: urlOf("Malware-Analysis-and-Prevention-Strategy") },
    metrics: ["20+ samples", "C2 behaviour mapped", "Actionable IOCs"],
    featured: true,
  },
  {
    id: "verifai-360",
    title: "VerifAI 360",
    type: "platform",
    tagline: "GRC evidence checks without the spreadsheet marathon.",
    problem: "Control mapping and gap analysis eat most of an assessment's time, and most of it is repetitive.",
    role: "Architected the platform: evidence validation, risk scoring, automated gap analysis and remediation plans.",
    stack: ["Python", "AI/LLMs", "ISO 27001", "NIST", "PCI DSS", "GDPR"],
    platform: "Web platform",
    status: "open-source",
    year: "2026",
    links: { github: urlOf("Compliance-Framework"), demo: repoByName("Compliance-Framework")?.homepage || undefined },
    metrics: ["150+ frameworks", "−30% manual effort", "+15% faster assessments"],
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
    platform: "Assessment lab",
    status: "open-source",
    year: "2026",
    links: { github: urlOf("Attack-Simulation-Security-Assessment") },
    metrics: ["15+ attacks simulated", "Kill Chain mapped", "Fixes recommended"],
  },
];

/* ── Credentials: certifications, then awards ──────────────────────────── */

const certificates: Certificate[] = [
  ...certifications.map((c) => ({
    title: c.name,
    mark: c.shortName ?? c.issuer,
    issuer: c.issuer,
    date: String(c.year),
    kind: "certification" as const,
    link: c.verifyUrl,
    /* The scan itself, from the gallery: the card shows it and opens it */
    image: c.galleryIndex ? normalizePublicHref(galleryImagePath(c.galleryIndex)) : undefined,
  })),
  ...achievements
    .filter((a) => a.cv !== false)
    .map((a) => ({
      title: a.title,
      mark: a.kind === "rank" ? "Rank" : a.kind === "award" ? "Award" : "Community",
      issuer: a.context,
      date: a.year ? String(a.year) : "",
      kind: "award" as const,
      link: a.proofUrl,
    })),
];

/* ── Stack: the skill groups, minus soft skills ────────────────────────── */

const STACK_JP: Record<string, string> = {
  siem: "監視",
  ir: "対応",
  identity: "認証",
  automation: "自動化",
  network: "網",
  forensics: "鑑識",
  frameworks: "規範",
  os: "基盤",
};

const STACK_TITLE: Record<string, string> = {
  siem: "SIEM & Monitoring",
  ir: "Incident Response",
  identity: "Identity & Access",
  automation: "Automation",
  network: "Network Security",
  forensics: "Malware & Forensics",
  frameworks: "Frameworks",
  os: "Operating Systems",
};

export const PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "Ahmed Emad Nasr",
    title: "SOC Analyst & Incident Responder",
    japaneseTitle: "セキュリティアナリスト • SOC Analyst & Incident Responder",
    availability: "Open to SOC, IR & DFIR roles",
    /* Same list as the old site's hero ticker */
    roles: [
      "Information Security Engineer",
      "Cybersecurity Engineer",
      "SOC/DFIR Engineer",
      "Malware Analyst",
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
      tagline: "Blue-team operations, incident response & digital forensics.",
      japaneseTagline: "検知・対応・鑑識。",
      photo: normalizePublicHref("Assets/art-gallery/Images/logo/3omda.webp"),
      cvUrl: normalizePublicHref(CV_PDF_HREF),
    },
  },
  experience,
  projects: {
    githubUsername: GITHUB_USERNAME,
    pinnedRepos: PINNED.map((name) => repoName(urlOf(name))),
    highlights: PINNED.map((name) => {
      const repo = repoByName(name);
      const meta = HIGHLIGHT_META[name];
      return {
        name: repoName(urlOf(name)),
        type: meta?.type ?? "Project",
        description: projectBullets[name]?.[0] ?? repo?.description ?? "",
        metrics: meta?.metrics ?? [],
        link: urlOf(name),
      };
    }),
  },
  work,
  services: [
    {
      id: "soc",
      title: "SOC Monitoring",
      japanese: "監視",
      description: "Alert triage, log analysis and SIEM tuning — telling the real alert from the noise, then writing the rule that keeps the noise down.",
      stack: ["Wazuh", "ELK", "Splunk", "Sysmon"],
      deliverable: "Triage notes + tuned rules",
    },
    {
      id: "ir",
      title: "Incident Response",
      japanese: "対応",
      description: "The NIST 800-61 lifecycle: scope it, contain it, clean it up, and write the report the next analyst can act on.",
      stack: ["NIST 800-61", "ATT&CK", "IOC analysis", "TheHive"],
      deliverable: "IR report + IOCs",
    },
    {
      id: "dfir",
      title: "Forensics & Malware",
      japanese: "鑑識",
      description: "Memory, disk and registry forensics; static and dynamic malware analysis in an isolated lab.",
      stack: ["Volatility", "Autopsy", "YARA", "FakeNet-NG"],
      deliverable: "Findings + YARA rules",
    },
    {
      id: "training",
      title: "Security Training",
      japanese: "指導",
      description: "Courses and hands-on labs from Linux and networking up to SOC, pentest, IAM and GRC tracks.",
      stack: ["Curriculum", "Labs", "CTFs"],
      deliverable: "Course + labs",
    },
  ],
  stack: skillGroups
    .filter((g) => g.id !== "soft")
    .map((g) => ({
      id: g.id,
      title: STACK_TITLE[g.id] ?? g.label,
      japanese: STACK_JP[g.id] ?? "技",
      items: [...g.items],
    })),
  process: [
    { id: "detect", index: "01", title: "Detect", japanese: "検知", description: "Baselines, logs and alerts. Know what normal looks like before deciding what isn't." },
    { id: "triage", index: "02", title: "Triage", japanese: "選別", description: "Scope it, rate it, map it to ATT&CK. Close false positives early and say why." },
    { id: "contain", index: "03", title: "Contain", japanese: "封じ込め", description: "Isolate, eradicate, recover — following NIST 800-61, not instinct." },
    { id: "report", index: "04", title: "Report", japanese: "報告", description: "Timeline, IOCs, root cause and fixes, written for the next analyst." },
  ],
  languages: [
    { code: "AR", name: "Arabic", level: "Native" },
    { code: "EN", name: "English", level: "Professional" },
  ],
  uses: [
    { id: "detect", title: "Detect", japanese: "検知", items: ["Wazuh", "Suricata", "Zeek", "Sysmon"] },
    { id: "investigate", title: "Investigate", japanese: "調査", items: ["Wireshark", "Volatility", "Autopsy", "PEStudio"] },
    { id: "automate", title: "Automate", japanese: "自動化", items: ["Python", "Bash", "PowerShell", "Regex"] },
    { id: "practice", title: "Practice", japanese: "修練", items: ["TryHackMe", "LetsDefend", "Hack The Box", "PortSwigger"] },
  ],
  milestones: [
    { year: "2022", title: "Started CS", detail: "Benha University — Information Security & Digital Forensics." },
    { year: "2023", title: "First teaching role", detail: "IEEE: C and Python training for robotics teams." },
    { year: "2024", title: "CCNA", detail: "Networking foundations, then GDG security sessions and CTF challenges." },
    { year: "2025", title: "Blue and red", detail: "Incident response internship at DEPI, penetration testing track at ITI." },
    { year: "2025", title: "Detection lab", detail: "Built the SOC environment; a custom Wazuh rule was merged into SOC Fortress." },
    { year: "2026", title: "Instructor & graduate", detail: "Teaching at AMIT and NTI, graduated 8th of 900, InfoSec internship at Banque Misr." },
  ],
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
  certificates,
  artGallery: Array.from({ length: GALLERY_IMAGE_COUNT }, (_, k) => ({
    src: normalizePublicHref(galleryImagePath(k + 1)),
    thumb: normalizePublicHref(galleryImagePath(k + 1)),
    title: galleryTitle(k + 1),
  })),
};
