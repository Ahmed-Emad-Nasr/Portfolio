"use client";

/*
 * credentials.tsx
 * Author: Ahmed Emad Nasr
 *
 * تلات حاجات كانت في الـ CV ومش موجودة على الموقع خالص:
 *
 *  1. الشهادات كبيانات — كانت 74 صورة من غير أسماء ولا جهات ولا سنين.
 *  2. الإنجازات — Top 1% على TryHackMe، الأول على 250 مدرّب، 44/450 في
 *     CTF. دي أقوى حاجة في الـ CV كله لأنها تقييم من طرف تالت مش وصف ذاتي،
 *     وماكانتش على الموقع بأي شكل.
 *  3. تصنيف المهارات — كانت تاجات متناثرة جوه كل خبرة وكل case، من غير
 *     مكان واحد يقول "ده اللي بشتغل بيه".
 *
 * الكومبوننت ده بيتركّب جوه قسم Certifications الموجود، فوق حيطة الصور —
 * فمفيش id جديد ولا تغيير في الـ nav ولا في الـ scrollspy.
 */

import { memo } from "react";
import Link from "next/link";
import { certifications } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups, languages } from "@/app/core/config/skills";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./credentials.module.css";

const CASE_TITLES = new Map(caseEvidenceLibrary.map((item) => [item.id, item.title]));

const Credentials = memo(function Credentials() {
  return (
    <div className={styles.wrap}>
      {/* ── Certifications ───────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="credentials-certs">
        <h3 className={styles.blockTitle} id="credentials-certs">
          Certifications
        </h3>
        <ul className={styles.certList}>
          {certifications.map((cert) => (
            <li key={cert.id} className={styles.cert}>
              <div className={styles.certMain}>
                <span className={styles.certName}>{cert.shortName ?? cert.name}</span>
                {cert.shortName && <span className={styles.certFull}>{cert.name}</span>}
              </div>
              <span className={styles.certIssuer}>{cert.issuer}</span>
              <span className={styles.certYear}>{cert.year}</span>
              {cert.verifyUrl ? (
                <a
                  className={styles.verify}
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify
                </a>
              ) : (
                /* مفيش رابط تحقّق = مفيش ادّعاء بإنه متحقق منه. أحسن من
                   زرار Verify بيروح على صورة. */
                <span className={styles.verifyMissing} aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Achievements ─────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="credentials-awards">
        <h3 className={styles.blockTitle} id="credentials-awards">
          Awards &amp; Rankings
        </h3>
        <ul className={styles.awardList}>
          {achievements.map((item) => (
            <li key={item.id} className={styles.award} data-kind={item.kind}>
              <span className={styles.awardTitle}>{item.title}</span>
              <span className={styles.awardContext}>
                {item.proofUrl ? (
                  <a href={item.proofUrl} target="_blank" rel="noopener noreferrer">
                    {item.context}
                  </a>
                ) : (
                  item.context
                )}
                {item.year ? ` · ${item.year}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Skills, linked to the reports that prove them ─────────────── */}
      <section className={styles.block} aria-labelledby="credentials-skills">
        <h3 className={styles.blockTitle} id="credentials-skills">
          Skills
        </h3>
        <p className={styles.skillsNote}>
          Where a report demonstrates the skill, it is linked directly.
        </p>
        <div className={styles.skillGrid}>
          {skillGroups.map((group) => (
            <div key={group.id} className={styles.skillGroup}>
              <h4 className={styles.skillLabel}>{group.label}</h4>
              <ul className={styles.skillItems}>
                {group.items.map((item) => (
                  <li key={item} className={styles.skillItem}>{item}</li>
                ))}
              </ul>
              {group.evidence && group.evidence.length > 0 && (
                <ul className={styles.evidenceList}>
                  {group.evidence.map((caseId) => (
                    <li key={caseId}>
                      <Link href={`/blog/${caseId}`}>
                        {CASE_TITLES.get(caseId) ?? caseId}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <dl className={styles.languages}>
          <dt>Languages</dt>
          <dd>
            {languages.map((lang) => `${lang.name} (${lang.level})`).join(" · ")}
          </dd>
        </dl>
      </section>
    </div>
  );
});

export default Credentials;
