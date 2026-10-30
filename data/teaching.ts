/* The Teaching section. Its numbers are also stated in experience.ts — keep them in step. */

import { YOUTUBE_CHANNEL_URL } from "@/lib/shared";

type TeachingStat = { value: string; label: string; japanese: string };

export const TEACHING_STATS: TeachingStat[] = [
  { value: "300+", label: "Students at AMIT & NTI", japanese: "受講生" },
  { value: "10/10", label: "Avg. student feedback", japanese: "評価" },
  { value: "1st", label: "Of 250 instructors · GDG", japanese: "首位" },
  { value: "60K+", label: "YouTube views", japanese: "視聴" },
];

/* The SOC & Cybersecurity Diploma — the curriculum taught end to end */
export const DIPLOMA = {
  title: "SOC & Cybersecurity Diploma",
  japanese: "課程",
  hours: 160,
  summary:
    "A complete 160-hour practitioner path from network & OS foundations to offensive exploitation, incident handling, and live SIEM/SOC alert triage. Written and taught as one structured track with hands-on labs after every session.",
  modules: [
    { n: "01", title: "Networking Foundations (CCNA) — TCP/IP, VLANs, OSPF, ACLs, NAT & Packet Analysis", detail: "8 sessions" },
    { n: "02", title: "Linux & Windows Admin (RH124/RH134) — Permissions, Services, Hardening & Sysmon/auditd", detail: "6 sessions" },
    { n: "03", title: "CompTIA Security+ Core — Cryptography, IAM/PAM, Cloud Security, Vuln Management & GRC", detail: "12 sessions" },
    { n: "04", title: "Offensive Security & Web Pentesting (eJPT / OWASP Top 10) — Recon, Burp Suite, SQLi, XSS & Pivoting", detail: "8 sessions" },
    { n: "05", title: "SANS SEC450 & SEC504 — SOC Architecture, NIST 800-61 IR, Memory/Disk DFIR & Malware Triage", detail: "8 sessions" },
    { n: "06", title: "SIEM & Detection Engineering — Splunk SPL, IBM QRadar, Wazuh Custom Rules & Capstone SOC Lab", detail: "Labs + capstone" },
  ],
  /* What every session ends with */
  format: ["Structured slide deck & notes", "Key security terminology", "Guided hands-on lab", "Practical assessment & quiz"],
};

type TeachingRole = {
  org: string;
  role: string;
  period: string;
  link?: string;
  topics: string;
  /** Results, each short enough for a chip */
  results: string[];
};

export const TEACHING_ROLES: TeachingRole[] = [
  {
    org: "AMIT Learning",
    role: "Cybersecurity Instructor",
    period: "Now",
    link: "https://amit-learning.com/",
    topics: "Authoring and teaching the 160-hour cybersecurity track: CCNA Networking, Red Hat Linux (RH124/RH134), CompTIA Security+, SANS SEC450/SEC504, Splunk/QRadar/Wazuh SIEM labs, Web VAPT, IAM and GRC.",
    results: ["300+ students", "10/10 avg. feedback", "100% Red Hat pass rate"],
  },
  {
    org: "National Telecommunication Institute (NTI)",
    role: "Cybersecurity Instructor",
    period: "Now",
    link: "https://nti.sci.eg/",
    topics: "Delivering intensive hands-on training in Linux System Administration, Enterprise Networking, SOC Operations, Alert Triage, and Web/Network Penetration Testing.",
    results: ["42+ students", "85%+ pass rate", "120+ lab hours"],
  },
  {
    org: "iSchool",
    role: "Tutor Assistant & Lab Coordinator",
    period: "Now",
    link: "https://ischool-tech.com/",
    topics: "Managing technical lab instruction, student mentoring, and session operations across DEPI and DECI coding and technology initiatives.",
    results: ["470+ students supported", "DEPI & DECI cohorts"],
  },
  {
    org: "Google Developer Groups (GDG)",
    role: "Cybersecurity Instructor & CTF Co-Designer",
    period: "2024 – 2025",
    link: "https://gdg.community.dev/",
    topics: "Structured cybersecurity workshops covering network security, Linux, web vulnerabilities and blue-team fundamentals, plus university CTF challenge design.",
    results: ["35+ sessions", "120+ learners", "1st of 250 instructors", "10+ CTF challenges"],
  },
  {
    org: "IEEE Benha",
    role: "Technical Instructor",
    period: "2023",
    link: "https://www.ieee.org/",
    topics: "C and Python programming instruction and embedded systems mentoring for student engineering teams building autonomous Arduino robotic cars.",
    results: ["5+ teams", "20+ students", "2nd Place IEEE GHOSTEC"],
  },
  {
    org: "YouTube — @AhmedEmad-0x3omda",
    role: "Creator — Security Walkthroughs & Labs",
    period: "Ongoing",
    link: YOUTUBE_CHANNEL_URL,
    topics: "Step-by-step video walkthroughs on Wazuh SIEM deployment, TryHackMe SOC simulations, WannaCry & PDF malware analysis, Burp Suite, and GRC fundamentals.",
    results: ["500+ subscribers", "60,000+ views", "25+ indexed videos"],
  },
];
