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
 *  4. **Server Component عن قصد — مفيش "use client".** ده مش تفصيلة: الملف
 *     ده بيقرا caseEvidenceLibrary (42 كيلوبايت). لو كان client component،
 *     الداتا دي كانت هتتحزم في bundle الصفحة الرئيسية وتتحمّل على كل زائر
 *     عشان يقرا عناوين 38 تقرير — وهي عناوين متحوّلة أصلاً لـ HTML وقت
 *     الـ build. كـ server component الداتا بتفضل على السيرفر (يعني وقت
 *     الـ build هنا) والزائر بياخد الـ markup بس.
 *
 *     عشان كده page.tsx بيرندره ويبعته كـ prop لـ page-client بدل ما
 *     page-client يستورده — أي حاجة client component بيستوردها بتبقى
 *     client تلقائياً.
 */

import Link from "next/link";
import SectionHeader from "@/app/core/components/SectionHeader";
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

export default function AttackMatrix() {
  return (
    <section className={styles.section} id="Coverage" aria-label="MITRE ATT&CK coverage">
      <div className={styles.container}>
        {/* نفس هيكل الهيدر المستخدم في Experience و Projects و Certifications:
            عنوان متوسّط بالخط الأحمر تحته. القسم كان بهيدر محاذي لليسار
            وشكله كإنه من موقع تاني. */}
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="戦術地図" englishText="ATT&CK Coverage" titleClassName={styles.title} />
          <p className={styles.lede}>
            Every technique below is backed by a published report in the case
            library. Open a technique to see the evidence.
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
        </div>

        {/* كان scroller أفقي: على الديسكتوب كان بيقص آخر عمودين ويطلّع شريط
            تمرير رمادي بتاع النظام في نص التصميم، وأسماء التكنيكات كانت
            بتتقص ("Network Service Disco…"). الـ grid بيلف الأعمدة على سطور
            بدل ما يخبّيها — كل التكتيكات ظاهرة على أي عرض شاشة. */}
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
    </section>
  );
}
