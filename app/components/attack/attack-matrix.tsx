/*
 * attack-matrix.tsx
 * Author: Ahmed Emad Nasr
 *
 * MITRE ATT&CK coverage map: each column is a tactic, each cell a technique covered in
 * one or more reports, and clicking it takes you to the reports themselves.
 *
 * Deliberate decisions:
 *  1. Zero runtime data. `buildCoverage()` runs once at module level,
 *     so with output: "export" this computation happens at build time and becomes
 *     static HTML. The visitor receives ready-made markup.
 *  2. No state and no JS for interaction. details/summary is a native browser element
 *     that opens and closes without a line of JavaScript, and works with the keyboard and screen
 *     readers for free.
 *  3. content-visibility on the section — the same convention used in the other
 *     sections.
 *  4. **A Server Component on purpose — no "use client".** This isn't a detail: this file
 *     reads caseEvidenceLibrary (42 KB). If it were a client component,
 *     that data would be bundled into the home page bundle and downloaded by every visitor
 *     just to read the titles of 38 reports — titles that are already turned into HTML at
 *     build time. As a server component the data stays on the server (i.e. at
 *     build time here) and the visitor only gets the markup.
 *
 *     That's why page.tsx renders it and passes it as a prop to page-client instead of
 *     page-client importing it — anything a client component imports automatically becomes
 *     client code.
 */

import Link from "next/link";
import SectionHeader from "@/app/core/components/SectionHeader";
import { buildCoverage, coveredTechniqueCount } from "@/app/core/config/attack";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./attack-matrix.module.css";

// Once at build time, not on every render
const COVERAGE = buildCoverage();
const COVERED_TECHNIQUES = coveredTechniqueCount();
const CASE_TITLES = new Map(caseEvidenceLibrary.map((item) => [item.id, item.title]));

/** The highest number of reports on a single technique — sets the colour scale */
const MAX_DEPTH = Math.max(
  1,
  ...COVERAGE.flatMap((column) => column.techniques.map((t) => t.caseIds.length)),
);

export default function AttackMatrix() {
  return (
    <section data-fx="section" id="Coverage" aria-label="MITRE ATT&CK coverage">
      <div data-fx="container">
        {/* Same header structure used in Experience, Projects and Certifications:
            a centred title with the red line beneath it. The section used to have a left-aligned header
            that looked like it came from another site. */}
        <div data-fx="section-head">
          <SectionHeader japaneseText="戦術地図" englishText="ATT&CK Coverage" />
          <p className={styles.lede}>
            Every technique below is backed by a published report in the case
            library. Open a technique to see the evidence.
          </p>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt data-fx="label">Techniques</dt>
              <dd>{COVERED_TECHNIQUES}</dd>
            </div>
            <div className={styles.stat}>
              <dt data-fx="label">Tactics</dt>
              <dd>{COVERAGE.length}</dd>
            </div>
            <div className={styles.stat}>
              <dt data-fx="label">Reports</dt>
              <dd>{caseEvidenceLibrary.length}</dd>
            </div>
          </dl>
        </div>

        {/* This used to be a horizontal scroller: on desktop it clipped the last two columns and showed the
            grey system scrollbar in the middle of the design, and the technique names were
            truncated ("Network Service Disco…"). The grid wraps the columns onto rows
            instead of hiding them — every tactic is visible at any screen width. */}
        <div className={styles.matrix}>
            {COVERAGE.map(({ tactic, techniques }) => (
              <div key={tactic.id} className={styles.column}>
                <h3 className={styles.tactic}>{tactic.name}</h3>

                {techniques.map(({ technique, caseIds }) => (
                  <details key={technique.id} className={styles.cell}>
                    <summary
                      className={styles.cellSummary}
                      // Colour intensity = number of reports. It makes the map readable at a
                      // glance: where coverage is deep and where it's shallow.
                      style={{ "--depth": caseIds.length / MAX_DEPTH } as React.CSSProperties}
                    >
                      <span data-fx="id">{technique.id}</span>
                      <span className={styles.techniqueName}>{technique.name}</span>
                      <span className={styles.count} aria-label={`${caseIds.length} reports`}>
                        {caseIds.length}
                      </span>
                    </summary>

                    <ul className={styles.evidence}>
                      {caseIds.map((caseId) => (
                        <li key={caseId}>
                          <Link href={`/blog/${caseId}`}>
                            {CASE_TITLES.get(caseId) ?? caseId}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
