/*
 * StartHere.tsx
 *
 * Server Component: reads the case library at build time to make sure every
 * id in start-here.ts actually exists, and the visitor gets HTML only.
 */

import Link from "next/link";
import { startHere } from "@/app/core/config/start-here";
import {
  caseEvidenceLibrary,
  publishedCaseCount,
  investigationReportCount,
} from "@/app/core/config/cases";
import styles from "./StartHere.module.css";

/*
 * If someone changes an id in cases.ts and forgets to change it here, the link becomes a silent 404. This
 * filter drops the item instead of sending it to a broken page — and the build prints a warning
 * so you notice.
 */
const KNOWN_IDS = new Set(caseEvidenceLibrary.map((item) => item.id));
const ENTRIES = startHere.filter((entry) => {
  if (KNOWN_IDS.has(entry.id)) return true;
  console.warn(`[start-here] unknown case id "${entry.id}" — dropped from the reading path.`);
  return false;
});

export default function StartHere() {
  if (ENTRIES.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="start-here-title">
      {/*
        The blog page had **no <h1> at all** — 42 headings on it and not a single h1.
        It's the single most important element on the page for Google and for screen readers: the former
        uses it as the page title in search results, and the latter starts navigating from it.

        The h1 is here because this is the first real content on the page after the header.
      */}
      <h1 className={styles.pageTitle}>Cybersecurity Case Library</h1>
      <p className={styles.pageLede}>
        {/* Both numbers are computed from the data in cases.ts. It used to say
            "{caseEvidenceLibrary.length} published investigation reports"
            which counts write-ups and walkthroughs as investigation reports. */}
        {publishedCaseCount} published cases — {investigationReportCount} full
        investigation reports, plus write-ups and walkthroughs across SOC
        incidents, DFIR, malware analysis, and detection engineering.
      </p>

      <div className={styles.head}>
        <h2 className={styles.title} id="start-here-title">
          Short on time? Start here
        </h2>
        <p className={styles.lede}>
          Three reports that cover the range of the work. The full library is
          below.
        </p>
      </div>

      <ol className={styles.list}>
        {ENTRIES.map((entry, index) => (
          <li key={entry.id} className={styles.item}>
            <Link href={`/blog/${entry.id}`} className={styles.card} data-fx="card" data-card="compact">
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.body}>
                <span className={styles.label}>{entry.label}</span>
                <span className={styles.why}>{entry.why}</span>
              </span>
              <span className={styles.minutes}>{entry.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
