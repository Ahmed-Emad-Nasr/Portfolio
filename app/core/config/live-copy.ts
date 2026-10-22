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
    { label: "Teaching", detail: "Cybersecurity instructor at AMIT Learning and NTI — Linux, networking, SOC and pentest tracks." },
    { label: "Writing", detail: `Case reports for the library — ${CASE_STATS.published} published, ${CASE_STATS.reports} of them full investigations.` },
    { label: "Recording", detail: "Security walkthroughs on the YouTube channel, free for anyone starting out." },
    { label: "Open to", detail: "SOC analyst, incident response and DFIR roles." },
  ],
  faq: [
    { q: "What kind of role are you after?", a: "SOC analyst, incident response and DFIR — blue-team work where detection and investigation are the job." },
    { q: "Where can I see real work?", a: `In the case library: ${CASE_STATS.published} documented cases, ${CASE_STATS.reports} of them full investigation reports, with screenshots and ATT&CK mapping where it applies.` },
    { q: "Which tools do you use day to day?", a: "Wazuh, ELK and Splunk for SIEM; Suricata and Zeek on the network; Volatility, Autopsy and YARA for forensics; Python and Bash to automate the rest." },
    { q: "Do you teach?", a: "Yes — instructor at AMIT Learning and NTI, with 300+ students taught. Before that, 35+ sessions with Google Developer Groups." },
    { q: "Which certifications do you hold?", a: "eJPT v2, CCNA, Red Hat RH124, CCEP and HCIA-Datacom, plus the TryHackMe SOC Level 1 and 2 paths." },
    { q: "How do I reach you?", a: "Email or LinkedIn. The form at the bottom of the page opens a pre-filled email — nothing is sent anywhere else." },
  ],
  stats: [
    { target: CASE_STATS.published, suffix: "", label: "Cases published", japanese: "記録" },
    { target: certifications.length, suffix: "", label: "Certifications", japanese: "認定" },
    { target: 300, suffix: "+", label: "Students taught", japanese: "指導" },
    { target: 60, suffix: "K+", label: "Channel views", japanese: "動画" },
  ],
};
