/*
 * core/config/start-here.ts
 * Author: Ahmed Emad Nasr
 *
 * A library of 38 reports paralyses whoever opens it. The visitor — most
 * likely someone reviewing your application with five minutes to spare —
 * looks at the wall, cannot tell where to begin, and closes it.
 *
 * These three are chosen to cover three different capabilities: writing
 * detection rules, a full DFIR investigation, and malware analysis. Not the
 * longest reports and not the newest — the three clearest ones that convey
 * "this is what I can do".
 *
 * The reasons were rewritten from the PDFs themselves (October 2026); the
 * minutes follow the report length (about 0.6 min per page).
 *
 * The ids must match caseEvidenceLibrary[].id in config/cases.ts.
 */

type StartHereEntry = {
  id: string;
  /** A short display name — it need not be the report's full title */
  label: string;
  /** Why this is the first thing to read — one line, phrased as "what you will see" */
  why: string;
  /** Approximate reading time */
  minutes: number;
};

export const startHere: readonly StartHereEntry[] = [
  {
    id: "3omda-custom-detection-rules",
    label: "Custom Wazuh detection rules",
    why: "Detection engineering — 52 Wazuh rules, each mapped to ATT&CK, from SSH brute force to ransomware and DNS tunnelling.",
    minutes: 17,
  },
  {
    id: "data-exfiltration-investigation",
    label: "Data exfiltration & credential compromise",
    why: "Memory forensics end to end: the copy to USB recovered from the console buffer, the NTLM hashes dumped and cracked, and the timeline.",
    minutes: 16,
  },
  {
    id: "malware-analysis-wannacry",
    label: "WannaCry analysis & response",
    why: "Static and dynamic analysis of a modified WannaCry build — IOCs, three YARA rules, the ATT&CK mapping and a mitigation plan.",
    minutes: 27,
  },
];
