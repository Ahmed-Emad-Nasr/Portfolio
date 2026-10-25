/*
 * core/config/live-copy.ts
 * Author: Ahmed Emad Nasr
 *
 * The home-page copy that quotes numbers computed from the case library
 * (cases published, reports, ATT&CK techniques).
 *
 * SERVER-ONLY. It imports case-stats.ts, which imports cases.ts (~115 KB of
 * case data and screenshot lists) and attack.ts. page.tsx reads it and hands
 * the finished strings to the client sections as props, so none of that data
 * ships in the browser bundle. Before this split, portfolio-data.ts imported
 * case-stats directly and every client component that read PORTFOLIO_DATA
 * pulled the whole case library into the JS of every page.
 */

import type { FaqItem, NowItem, Stat } from "../types/portfolio";
import { CASE_STATS } from "./case-stats";
import { certifications } from "./certifications";
import { CV_SUMMARY } from "./cv";

export type LiveCopy = {
  heroDescription: string;
  now: NowItem[];
  faq: FaqItem[];
  stats: Stat[];
};

export const LIVE_COPY: LiveCopy = {
  heroDescription: CV_SUMMARY,
  now: [
    { label: "Teaching", detail: "Cybersecurity instructor at AMIT Learning and NTI — Linux, networking, SOC, pentest, IAM and GRC tracks." },
    { label: "Writing", detail: `Case reports for the library — ${CASE_STATS.published} published, ${CASE_STATS.reports} of them full investigations.` },
    { label: "Recording", detail: "Security walkthroughs on the YouTube channel, free for anyone starting out." },
    { label: "Open to", detail: "Information security roles — GRC and compliance, SOC, incident response and DFIR, IAM and data security." },
  ],
  faq: [
    { q: "What kind of role are you after?", a: "Information security, end to end: GRC and compliance, SOC and incident response, DFIR and malware analysis, IAM and data security. Penetration testing only at a beginner level (eJPT)." },
    { q: "Do you do GRC and compliance work?", a: "Yes. At Banque Misr I assessed GRC gaps across three units against ISO 27001, PCI DSS, COBIT and SWIFT, and audited IAM, PAM and DevSecOps architecture. VerifAI 360, my open-source GRC platform, automates control mapping and gap analysis across 150+ frameworks." },
    { q: "Where can I see real work?", a: `In the case library: ${CASE_STATS.published} documented cases, ${CASE_STATS.reports} of them full investigation reports, with screenshots and ATT&CK mapping where it applies.` },
    { q: "Which tools and frameworks do you use?", a: "ISO 27001, PCI DSS and NIST CSF for governance; Wazuh, ELK and Splunk for SIEM; Suricata and Zeek on the network; Volatility, Autopsy and YARA for forensics; Python and Bash to automate the rest." },
    { q: "Do you teach?", a: "Yes — instructor at AMIT Learning and NTI, with 300+ students taught. Before that, 35+ sessions with Google Developer Groups." },
    /* Read from certifications.ts — the hand-written list had fallen behind it */
    { q: "Which certifications do you hold?", a: `${certifications.map((c) => c.shortName ?? c.name).join(", ")}.` },
    { q: "How do I reach you?", a: "Email or LinkedIn. The form at the bottom of the page opens a pre-filled email — nothing is sent anywhere else." },
  ],
  stats: [
    { target: CASE_STATS.published, suffix: "", label: "Cases published", japanese: "記録" },
    { target: certifications.length, suffix: "", label: "Certifications", japanese: "認定" },
    { target: 300, suffix: "+", label: "Students taught", japanese: "指導" },
    { target: 60, suffix: "K+", label: "Channel views", japanese: "動画" },
  ],
};
