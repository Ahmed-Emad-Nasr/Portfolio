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
 * ⚠️ Review the selection and the reasons. I have not read the PDFs, so the
 * choice is based on titles and tags — you are the one who knows which
 * report actually represents you.
 *
 * The ids must match caseEvidenceLibrary[].id in config/cases.ts.
 */

export type StartHereEntry = {
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
    why: "Detection engineering — writing, tuning, and validating rules, including one merged into SOC Fortress.",
    minutes: 8,
  },
  {
    id: "data-exfiltration-investigation",
    label: "Data exfiltration & credential compromise",
    why: "A full DFIR investigation end to end: memory forensics, timeline reconstruction, and the containment call.",
    minutes: 12,
  },
  {
    id: "malware-analysis-wannacry",
    label: "WannaCry analysis & response",
    why: "Static and dynamic malware analysis, IOC extraction, and the response plan built from them.",
    minutes: 10,
  },
];
