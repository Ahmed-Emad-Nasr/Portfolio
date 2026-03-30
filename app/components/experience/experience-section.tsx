"use client";

/*
 * File: experience-section.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render experience timeline entries and calculated time ranges
 */

import { memo, useMemo } from "react";
import styles from "./experience-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { calculateExperience } from "@/app/core/utils/experienceUtils";
import { knowledgeEducationItems } from "@/app/core/data";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faArrowUpRightFromSquare, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import MotionInView from "@/app/core/components/MotionInView";

type TimelineItemProps = { tag: string; subTag?: string; subTagHyperlink?: string; desc: string; isRight: boolean; startDate: string; endDate?: string; showDate?: boolean; };

const TimelineItem = memo<TimelineItemProps>(({ isRight, tag, subTag, subTagHyperlink, desc, startDate, endDate, showDate = true }) => {
  const experienceTime = useMemo(() => calculateExperience(startDate, endDate), [startDate, endDate]);
  const descriptionBullets = useMemo(() => toBulletItems(desc), [desc]);

  const containerClass = `${styles["timeline-container"]} ${isRight ? styles.right : styles.left}`;
  const subTagStyle = subTagHyperlink ? ({ cursor: "pointer" } as const) : ({ cursor: "default" } as const);

  return (
    <MotionInView
      className={containerClass}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      threshold={0.15}
      triggerOnce
    >
      <div className={styles.content}>
        <div className={styles.tag}>
          <h2><FontAwesomeIcon icon={faBriefcase} className={styles.titleIcon} aria-hidden="true" /> {tag}</h2>
          {subTag && (
            <h3 onClick={subTagHyperlink ? () => window.open(subTagHyperlink, "_blank") : undefined} style={subTagStyle}>
              {subTag} {subTagHyperlink && <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.linkIcon} aria-hidden="true" />}
            </h3>
          )}
        </div>
        <div className={styles.desc}>
          <ul className={styles["desc-list"]}>
            {descriptionBullets.map((item, index) => (
              <li key={`${tag}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        {showDate && (
          <div className={styles["date-details"]}>
            <div className={styles["experience-time"]}><FontAwesomeIcon icon={faClock} aria-hidden="true" /> <span>{experienceTime}</span></div>
            <div className={styles["date-range"]}><FontAwesomeIcon icon={faCalendarAlt} aria-hidden="true" /> <span>{startDate} {endDate ? `- ${endDate}` : "- Present"}</span></div>
          </div>
        )}
      </div>
    </MotionInView>
  );
});

TimelineItem.displayName = "TimelineItem";

function ExperienceSection() {
  return (
    <section className={styles["section-education"]} id="Experience">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="経験" englishText="Experience" titleClassName={styles.title} />
        </div>
        <div className={styles["time-line"]}>
          {knowledgeEducationItems.map((item, index) => (
            <TimelineItem key={`${item.tag}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ExperienceSection);