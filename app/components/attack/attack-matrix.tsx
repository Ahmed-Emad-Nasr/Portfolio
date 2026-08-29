"use client";

/*
 * attack-matrix.tsx
 * Author: Ahmed Emad Nasr
 *
 * خريطة تغطية MITRE ATT&CK: كل عمود تكتيك، وكل خانة تكنيك غطّيته في
 * تقرير أو أكتر، والضغط عليها بيوديك على التقارير نفسها.
 *
 * قرارات مقصودة:
 *  1. صفر داتا وقت التشغيل. `buildCoverage()` بتتنفذ مرة واحدة على مستوى
 *     الموديول، فمع output: "export" الحساب ده بيحصل وقت الـ build وبيتحوّل
 *     لـ HTML ثابت. الزائر بيستقبل markup جاهز.
 *  2. مفيش state ولا JS للتفاعل. الـ details/summary عنصر أصلي في المتصفح
 *     بيفتح ويقفل من غير سطر جافاسكريبت، وشغّال مع الكيبورد والـ screen
 *     reader بالمجان.
 *  3. content-visibility على القسم — نفس الاتفاقية المستخدمة في باقي
 *     السكاشن.
 */

import { memo } from "react";
import Link from "next/link";
import { buildCoverage, coveredTechniqueCount } from "@/app/core/config/attack";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./attack-matrix.module.css";

// مرة واحدة وقت الـ build، مش كل render
const COVERAGE = buildCoverage();
const COVERED_TECHNIQUES = coveredTechniqueCount();
const CASE_TITLES = new Map(caseEvidenceLibrary.map((item) => [item.id, item.title]));

/** أعلى عدد تقارير على تكنيك واحد — بيتحدد بيه تدرّج اللون */
const MAX_DEPTH = Math.max(
  1,
  ...COVERAGE.flatMap((column) => column.techniques.map((t) => t.caseIds.length)),
);

const AttackMatrix = memo(function AttackMatrix() {
  return (
    <section className={styles.section} id="Coverage" aria-labelledby="coverage-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title} id="coverage-title">
            <span lang="ja">戦術地図 •</span> <span lang="en">ATT&amp;CK Coverage</span>
          </h2>
          <p className={styles.lede}>
            Every technique below is backed by a published report in the case
            library. Click a technique to open the evidence.
          </p>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>Techniques</dt>
              <dd>{COVERED_TECHNIQUES}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Tactics</dt>
              <dd>{COVERAGE.length}</dd>
            </div>
            <div className={styles.stat}>
              <dt>Reports</dt>
              <dd>{caseEvidenceLibrary.length}</dd>
            </div>
          </dl>
        </header>

        <div className={styles.scroller} tabIndex={0} role="group" aria-label="ATT&CK coverage matrix, scrollable">
          <div className={styles.matrix}>
            {COVERAGE.map(({ tactic, techniques }) => (
              <div key={tactic.id} className={styles.column}>
                <h3 className={styles.tactic}>{tactic.name}</h3>

                {techniques.map(({ technique, caseIds }) => (
                  <details key={technique.id} className={styles.cell}>
                    <summary
                      className={styles.cellSummary}
                      // شدة اللون = عدد التقارير. بيخلي الخريطة تتقرا بنظرة
                      // واحدة: فين التغطية عميقة وفين سطحية.
                      style={{ "--depth": caseIds.length / MAX_DEPTH } as React.CSSProperties}
                    >
                      <span className={styles.techniqueId}>{technique.id}</span>
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
      </div>
    </section>
  );
});

export default AttackMatrix;
