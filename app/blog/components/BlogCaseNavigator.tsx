import MotionInView from "@/app/core/components/MotionInView";
import styles from "../page.module.css";
import type { PdfResource } from "../blog-types";

type BlogCaseNavigatorProps = {
  leadCase: PdfResource | null;
  previousCase: PdfResource | null;
  nextCase: PdfResource | null;
  normalizeHref: (href: string) => string;
};

export default function BlogCaseNavigator({
  leadCase,
  previousCase,
  nextCase,
  normalizeHref,
}: BlogCaseNavigatorProps) {
  if (!leadCase) return null;

  return (
    <MotionInView className={styles.caseNavigator} aria-label="Case navigation">
      <article className={styles.caseNavCard}>
        <span className={styles.caseNavLabel}>Previous case</span>
        {previousCase ? (
          <>
            <h3>{previousCase.title}</h3>
            <p>{previousCase.category ?? previousCase.platform}</p>
            <a href={normalizeHref(previousCase.href)} target="_blank" rel="noopener noreferrer">Open PDF</a>
          </>
        ) : (
          <p>Start with the featured case.</p>
        )}
      </article>

      <article className={`${styles.caseNavCard} ${styles.caseNavCenter}`}>
        <span className={styles.caseNavLabel}>Current case</span>
        <h3>{leadCase.title}</h3>
        <p>{leadCase.description}</p>
        <a href={normalizeHref(leadCase.href)} target="_blank" rel="noopener noreferrer">Open Featured PDF</a>
      </article>

      <article className={styles.caseNavCard}>
        <span className={styles.caseNavLabel}>Next case</span>
        {nextCase ? (
          <>
            <h3>{nextCase.title}</h3>
            <p>{nextCase.category ?? nextCase.platform}</p>
            <a href={normalizeHref(nextCase.href)} target="_blank" rel="noopener noreferrer">Open PDF</a>
          </>
        ) : (
          <p>More cases are available below.</p>
        )}
      </article>
    </MotionInView>
  );
}