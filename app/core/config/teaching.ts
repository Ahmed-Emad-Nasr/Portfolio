/*
 * core/config/teaching.ts
 * Author: Ahmed Emad Nasr
 *
 * The Teaching section: the diploma curriculum, the teaching roles, and the
 * headline numbers. Every number here is also stated in experience.ts or
 * achievements.ts — if one changes there, change it here too.
 */

import { YOUTUBE_CHANNEL_URL } from "./shared";

type TeachingStat = { value: string; label: string; japanese: string };

export const TEACHING_STATS: TeachingStat[] = [
  { value: "300+", label: "Students at AMIT", japanese: "受講生" },
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
    "From the network up to the SOC floor: foundations first, then the attacker's side, then the analyst's tooling. Written and taught as one path.",
  modules: [
    { n: "01", title: "Networking", detail: "8 sessions" },
    { n: "02", title: "Linux & Windows", detail: "2 sessions" },
    { n: "03", title: "Security+", detail: "12 sessions" },
    { n: "04", title: "Attack", detail: "8 sessions" },
    { n: "05", title: "SANS SEC450", detail: "8 sessions" },
    { n: "06", title: "SIEM — Splunk & QRadar", detail: "Labs + capstone" },
  ],
  /* What every session ends with */
  format: ["Session summary", "Key terms", "Free hands-on labs", "Quiz"],
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
    topics: "Networking, Linux, Security+, SANS SEC450 / SEC504 — with SOC, pentest, IAM and GRC labs. Red Hat System Administration I & II with NTI.",
    results: ["300+ students", "10/10 avg. feedback", "100% Red Hat pass rate"],
  },
  {
    org: "National Telecommunication Institute (NTI)",
    role: "Cybersecurity Instructor",
    period: "Now",
    link: "https://nti.sci.eg/",
    topics: "Linux, networking, SOC fundamentals and penetration testing — hands-on labs for offence and defence.",
    results: ["42+ students", "85% pass rate", "120+ lab hours"],
  },
  {
    org: "Google Developer Groups (GDG)",
    role: "Cybersecurity Instructor",
    period: "2024 – 2025",
    link: "https://gdg.community.dev/",
    topics: "Security sessions for a student developer community, plus CTF challenge design.",
    results: ["35+ sessions", "120+ learners", "1st of 250 instructors", "10+ CTF challenges"],
  },
  {
    org: "IEEE",
    role: "Technical Instructor",
    period: "2023",
    link: "https://www.ieee.org/",
    topics: "C and Python for the engineering teams building Arduino robotic cars.",
    results: ["5+ teams", "20+ students"],
  },
  {
    org: "YouTube — @AhmedEmad-0x3omda",
    role: "Free security walkthroughs",
    period: "Ongoing",
    link: YOUTUBE_CHANNEL_URL,
    topics: "Labs, tools and SOC walkthroughs, free for anyone starting out.",
    results: ["500+ subscribers", "60,000+ views"],
  },
];
