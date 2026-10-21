/*
 * core/config/case-stats.ts
 *
 * The three library numbers the home page and the CV quote, computed from
 * the data so they follow every case you add — no number to update by hand.
 */

import { investigationReportCount, publishedCaseCount } from "./cases";
import { coveredTechniqueCount } from "./attack";

export const CASE_STATS = {
  /** Everything in the library (reports + write-ups + walkthroughs) */
  published: publishedCaseCount,
  /** The items that are full investigation reports */
  reports: investigationReportCount,
  /** Distinct MITRE ATT&CK techniques mapped across the cases */
  techniques: coveredTechniqueCount(),
} as const;
