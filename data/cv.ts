/*
 * What only the /cv page needs: the PDF's condensed projects and skills.
 * Experience and certifications are read from their own files.
 */

import { investigationReportCount, publishedCaseCount } from "@/data/cases";
import { coveredTechniqueCount } from "@/data/attack";
import { projectBullets, staticProjectFallback } from "@/data/projects";
import { YOUTUBE_CHANNEL_URL } from "@/lib/shared";

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
      `Published ${publishedCaseCount} security cases — ${investigationReportCount} of them full investigation reports — plus CTFs and lab solutions, earning 22+ GitHub stars from the security community.`,
    ].filter(Boolean),
    github: repo("Portfolio")?.html_url ?? "",
    demo: repo("Portfolio")?.homepage,
  },
];

/* Skills, grouped as in the CV PDF (keep the two identical) */
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

/** The opening line of the CV (its numbers are computed from the data) */
export const CV_SUMMARY =
  "Information security officer working across GRC and compliance, security operations, DFIR, IAM and data security. " +
  `The record so far: ${investigationReportCount} investigation reports across ${publishedCaseCount} documented cases, ` +
  `${coveredTechniqueCount()} MITRE ATT&CK techniques mapped, a detection rule merged into SOC Fortress, ` +
  "GRC gap assessments at Banque Misr, and 300+ students taught.";
