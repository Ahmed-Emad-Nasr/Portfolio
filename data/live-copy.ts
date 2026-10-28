/*
 * Home-page copy that quotes numbers computed from the case library.
 * SERVER-ONLY: it pulls in the case data; page.tsx passes the finished
 * strings to the client sections as props.
 */

import type { FaqItem, NowItem, Stat } from "@/data/types";
import { investigationReportCount, publishedCaseCount } from "@/data/cases";
import { coveredTechniqueCount } from "@/data/attack";
import { CV_SUMMARY } from "@/data/cv";
import { normalizePublicHref } from "@/lib/shared";

type LiveCopy = {
  heroDescription: string;
  heroEvidence: string;
  now: NowItem[];
  faq: FaqItem[];
  stats: Stat[];
};

export const LIVE_COPY: LiveCopy = {
  heroDescription: CV_SUMMARY,
  heroEvidence: `${investigationReportCount} IR/DFIR reports · ${coveredTechniqueCount()} ATT&CK techniques`,
  now: [
    { label: "Teaching", detail: "Cybersecurity instructor at AMIT Learning and NTI — Linux, networking, SOC, pentest, IAM and GRC tracks." },
    { label: "Writing", detail: `Case reports for the library — ${publishedCaseCount} published, ${investigationReportCount} of them full investigations.` },
    { label: "Recording", detail: "Security walkthroughs on the YouTube channel, free for anyone starting out." },
    { label: "Open to", detail: "Information Security Officer and Engineer roles, plus GRC, SOC, incident response, DFIR, IAM and cybersecurity education." },
  ],
  faq: [
    { q: "What kind of role are you after?", a: "Information Security Officer or Engineer roles, with hands-on depth across GRC and compliance, SOC and incident response, DFIR and malware analysis, IAM and data security. I also work as a Cybersecurity Instructor; penetration testing is at a beginner level (eJPT)." },
    { q: "Do you do GRC and compliance work?", a: "Yes. At Banque Misr I assessed GRC gaps across three units against ISO 27001, PCI DSS, COBIT and SWIFT, and audited IAM, PAM and DevSecOps architecture. VerifAI 360, my open-source GRC platform, automates control mapping and gap analysis across 150+ frameworks." },
    { q: "Where can I see real work?", a: `In the case library: ${publishedCaseCount} documented cases, ${investigationReportCount} of them full investigation reports, with screenshots and ATT&CK mapping where it applies.` },
    { q: "Are the cases real work?", a: `They are my own work on training platforms and in labs — ${investigationReportCount} incident and forensics reports (LetsDefend SOC alerts, DFIR and malware challenges, INE labs), plus capstones, rule packs and lab write-ups. Team projects are marked as team work, and every case links its original report or screenshots so you can check it.` },
    { q: "Which tools and frameworks do you use?", a: "ISO 27001, PCI DSS and NIST CSF for governance; Wazuh, ELK and Splunk for SIEM; Suricata and Zeek on the network; Volatility, Autopsy and YARA for forensics; Python and Bash to automate the rest." },
    { q: "Do you teach?", a: "Yes — instructor at AMIT Learning and NTI, with 300+ students taught. Before that, 35+ sessions with Google Developer Groups." },
    { q: "How do I reach you?", a: "Email or LinkedIn. The form at the bottom of the page opens a pre-filled email — nothing is sent anywhere else." },
  ],
  stats: [
    /* The full investigation reports, not every library entry: "79 cases"
       counted 42 web labs and 9 notes too, and a recruiter who filtered the
       library found the gap. The hero still gives both numbers. */
    { target: investigationReportCount, suffix: "", label: "IR / DFIR reports", japanese: "記録", href: `${normalizePublicHref("/blog")}?kind=investigation#cases` },
    { target: 300, suffix: "+", label: "Students taught", japanese: "指導", href: "#teaching" },
    { target: 60, suffix: "K+", label: "Channel views", japanese: "動画", href: `${normalizePublicHref("/blog")}#videos` },
  ],
};
