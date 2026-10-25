/*
 * core/config/cv.ts
 * Author: Ahmed Emad Nasr
 *
 * The few things the /cv page needs that are not in any other config.
 *
 * Experience, certifications and awards are read from their original
 * sources (experience.ts, certifications.ts, achievements.ts) — entries
 * marked `cv: false` there are on the site but not in the PDF, so the /cv
 * page leaves them out.
 *
 * Two things live here instead: CV_PROJECTS and CV_SKILLS. The PDF condenses
 * both (it merges the SOC environment and insider-threat repos into one
 * project, and groups skills differently from the site's skills section),
 * so they are the PDF's version, not a copy of a site list. Bullets that
 * are the same claim on both are still read from projects.ts.
 *
 * That is deliberate. The easy way to build a CV page is to copy the text
 * into it — and two months later the site says one number and the CV says
 * another, which is exactly the problem that exists today between your site
 * and your PDF. A single source makes that impossible.
 */

import { CASE_STATS } from "./case-stats";
import { projectBullets, staticProjectFallback } from "./projects";
import { YOUTUBE_CHANNEL_URL } from "./shared";

export const CV_CONTACT = {
  name: "Ahmed Emad Nasr",
  headline: "Information Security Officer · GRC · SOC · DFIR · IAM",
  location: "Cairo, Egypt",
  email: "ahmed.em.nasr@gmail.com",
  phone: "+20 101 397 2690",
  linkedin: { label: "linkedin.com/in/ahmed-emad-nasr", href: "https://www.linkedin.com/in/ahmed-emad-nasr/" },
  github: { label: "github.com/Ahmed-Emad-Nasr", href: "https://github.com/Ahmed-Emad-Nasr" },
  site: { label: "ahmed-emad-nasr.github.io/Portfolio", href: "https://ahmed-emad-nasr.github.io/Portfolio/" },
} as const;

/** Related coursework — present in the PDF, absent from experience.ts */
export const RELEVANT_COURSEWORK = [
  "Network Security",
  "Digital Forensics",
  "Cryptography",
  "Operating Systems",
  "Data Structures & Algorithms",
] as const;

/* ── Projects, as grouped in the CV PDF ─────────────────────────────────── */
type CvProject = {
  title: string;
  stack: readonly string[];
  bullets: readonly string[];
  github: string;
  demo?: string;
};

const repo = (name: string) => staticProjectFallback.find((r) => r.name === name);
const bulletsOf = (name: string) => projectBullets[name] ?? [];

export const CV_PROJECTS: readonly CvProject[] = [
  {
    title: "Enterprise SOC Environment & Insider Threat Deception",
    stack: ["VMware", "Wazuh", "TheHive", "Suricata", "Zeek", "YARA", "FIM", "auditd", "Sysmon", "Python", "VirusTotal"],
    bullets: [
      bulletsOf("SOC-Environment")[0],
      bulletsOf("SOC-Environment")[2],
      bulletsOf("insider-threat-detection-deception")[2],
    ].filter(Boolean),
    github: repo("SOC-Environment")?.html_url ?? "",
    demo: YOUTUBE_CHANNEL_URL,
  },
  {
    title: "Malware Analysis & Prevention Strategy",
    stack: ["Wireshark", "FakeNet-NG", "DIE", "CFF Explorer", "Process Hacker", "Process Explorer", "FIM", "JavaScript", "PDF Parsing"],
    bullets: bulletsOf("Malware-Analysis-and-Prevention-Strategy"),
    github: repo("Malware-Analysis-and-Prevention-Strategy")?.html_url ?? "",
    demo: YOUTUBE_CHANNEL_URL,
  },
  {
    title: "VerifAI 360 Compliance Framework",
    stack: ["Python", "AI/LLMs", "GRC", "ISO 27001", "NIST", "PCI DSS", "GDPR"],
    bullets: bulletsOf("Compliance-Framework"),
    github: repo("Compliance-Framework")?.html_url ?? "",
    demo: repo("Compliance-Framework")?.homepage || YOUTUBE_CHANNEL_URL,
  },
  {
    title: "Vulnerability Assessment & Threat Simulation",
    stack: ["Nessus", "Kali Linux", "Metasploitable", "DVWA", "MITRE ATT&CK", "Cyber Kill Chain"],
    bullets: bulletsOf("Attack-Simulation-Security-Assessment"),
    github: repo("Attack-Simulation-Security-Assessment")?.html_url ?? "",
  },
  {
    title: "Cybersecurity Portfolio & Technical Blog",
    stack: ["Next.js", "React", "TypeScript", "JavaScript", "HTML", "Tailwind CSS", "Framer Motion", "GitHub Pages", "Medium"],
    /* The second PDF bullet still said "40+ security cases" — the count is
       read from the library here so the CV page can't fall behind it */
    bullets: [
      bulletsOf("Portfolio")[0],
      `Published ${CASE_STATS.published} security cases — ${CASE_STATS.reports} of them full investigation reports — plus CTFs and lab solutions, earning 22+ GitHub stars from the security community.`,
    ].filter(Boolean),
    github: repo("Portfolio")?.html_url ?? "",
    demo: repo("Portfolio")?.homepage,
  },
];

/* ── Skills, grouped as in the CV PDF ─────────────────────────────────────
   October 2026: "GRC & Compliance" was added and "Identity & Access" became
   "Identity & Data Security" here first — add the same two lines to the PDF
   so the two stay identical. */
export const CV_SKILLS: readonly { label: string; items: readonly string[] }[] = [
  { label: "GRC & Compliance", items: ["ISO 27001", "PCI DSS", "NIST CSF", "COBIT", "SWIFT CSP", "GDPR", "Risk Assessment", "Gap Analysis"] },
  { label: "SIEM & Detection", items: ["Wazuh", "Splunk", "ELK Stack", "Security Onion", "Sysmon"] },
  { label: "Incident Response & Threat Detection", items: ["Security Monitoring", "Incident Detection", "Alert Triage", "IOC Analysis", "Log Analysis"] },
  { label: "Network Security", items: ["TCP/IP", "IDS/IPS", "Suricata", "Wireshark", "Zeek", "Packet Analysis"] },
  { label: "Identity & Data Security", items: ["IAM", "PAM", "DAM", "RBAC", "Access Control", "DLP", "Encryption"] },
  { label: "Malware & Forensics", items: ["YARA", "Volatility", "Autopsy", "PEStudio"] },
  { label: "Programming & Automation", items: ["Python", "Bash", "PowerShell", "Regex"] },
  { label: "Frameworks & Standards", items: ["MITRE ATT&CK", "NIST 800-61", "NIST 800-53", "Cyber Kill Chain"] },
  { label: "Operating Systems", items: ["Windows", "Windows Server", "Linux"] },
  { label: "Soft Skills", items: ["Analytical Thinking", "Problem Solving", "Team Collaboration", "Communication", "Adaptability", "Attention to Detail"] },
];

/** Path to the PDF. Goes through normalizePublicHref like any other asset. */
export { CV_PDF_HREF } from "./shared";

/**
 * The opening line. This is the only place on the site that states outright
 * what you are looking for — and that is the first question in the mind of
 * anyone opening a CV.
 */
/*
 * ⚠️ Both numbers are computed from the data, not hand-written.
 *
 * It used to say "Published 38 investigation reports" — and that number didn't match
 * any count in cases.ts. Meanwhile the site was saying 42.
 *
 * Now they're read from cases.ts, so if you add a new report the number updates in
 * both places by itself and they can never contradict each other.
 *
 * The technique count is also computed from attack.ts now instead of a hard-coded 28.
 */
export const CV_SUMMARY =
  "Information security officer working across GRC and compliance, security operations, DFIR, IAM and data security. " +
  `The record so far: ${CASE_STATS.reports} investigation reports across ${CASE_STATS.published} documented cases, ` +
  `${CASE_STATS.techniques} MITRE ATT&CK techniques mapped, a detection rule merged into SOC Fortress, ` +
  "GRC gap assessments at Banque Misr, and 300+ students taught.";
