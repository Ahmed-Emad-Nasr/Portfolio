/*
 * StartHere.tsx
 *
 * Server Component: بيقرا مكتبة الـ cases وقت الـ build عشان يتأكد إن كل
 * id في start-here.ts موجود فعلاً، والزائر بياخد HTML بس.
 */

import Link from "next/link";
import { startHere } from "@/app/core/config/start-here";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import styles from "./StartHere.module.css";

/*
 * لو حد غيّر id في cases.ts ونسي يغيّره هنا، اللينك هيبقى 404 صامت. الفلتر
 * ده بيشيل العنصر بدل ما يوديه على صفحة مكسورة — والـ build بيطبع تحذير
 * عشان تلاحظ.
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
      <div className={styles.head}>
        <h2 className={styles.title} id="start-here-title">
          Short on time? Start here
        </h2>
        <p className={styles.lede}>
          Three reports that cover the range of the work. The full library of{" "}
          {caseEvidenceLibrary.length} is below.
        </p>
      </div>

      <ol className={styles.list}>
        {ENTRIES.map((entry, index) => (
          <li key={entry.id} className={styles.item}>
            <Link href={`/blog/${entry.id}`} className={styles.card}>
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
