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
import { faCalendarAlt, faClock, faArrowUpRightFromSquare, faBriefcase, faCertificate } from "@fortawesome/free-solid-svg-icons";
import MotionInView from "@/app/core/components/MotionInView";

type TimelineItemProps = {
  tag: string;
  subTag?: string;
  subTagHyperlink?: string;
  desc: string;
  isRight?: boolean; // جعلناها اختيارية لدعم التوزيع التلقائي
  startDate: string;
  endDate?: string;
  showDate?: boolean;
  skills?: string[];
  certificateUrl?: string;
};

const TimelineItem = memo<TimelineItemProps>(({ 
  isRight, 
  tag, 
  subTag, 
  subTagHyperlink, 
  desc, 
  startDate, 
  endDate, 
  showDate = true, 
  skills = [], 
  certificateUrl 
}) => {
  const experienceTime = useMemo(() => calculateExperience(startDate, endDate), [startDate, endDate]);
  const descriptionBullets = useMemo(() => toBulletItems(desc), [desc]);

  const containerClass = `${styles["timeline-container"]} ${isRight ? styles.right : styles.left}`;
  const subTagStyle = subTagHyperlink
    ? ({ cursor: "pointer", color: "inherit", textDecoration: "none" } as const)
    : ({ cursor: "default" } as const);

  return (
    <MotionInView
      className={containerClass}
      transition={{ duration: 0.14 }}
      role="listitem" // دعم إمكانية الوصول
    >
      <div className={styles.content}>
        <div className={styles.tag}>
          <h2><FontAwesomeIcon icon={faBriefcase} className={styles.titleIcon} aria-hidden="true" /> {tag}</h2>
          {subTag ? (
            subTagHyperlink ? (
              <h3>
                <a href={subTagHyperlink} target="_blank" rel="noopener noreferrer" style={subTagStyle}>
                  {subTag} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.linkIcon} aria-hidden="true" />
                </a>
              </h3>
            ) : (
              <h3 style={subTagStyle}>{subTag}</h3>
            )
          ) : null}
        </div>
        <div className={styles.desc}>
          <ul className={styles["desc-list"]}>
            {descriptionBullets.map((item, index) => (
              <li key={`${tag}-bullet-${index}`}>{item}</li>
            ))}
          </ul>
          {skills.length > 0 ? (
            <div className={styles.skillTags} aria-label="Skills used in this role">
              {skills.map((skill) => (
                <span key={`${tag}-${skill}`} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
          ) : null}
        </div>
        {showDate && (
          <div className={styles["date-details"]}>
            <div className={styles["experience-time"]}><FontAwesomeIcon icon={faClock} aria-hidden="true" /> <span>{experienceTime}</span></div>
            <div className={styles["date-range"]}><FontAwesomeIcon icon={faCalendarAlt} aria-hidden="true" /> <span>{startDate} {endDate ? `- ${endDate}` : "- Present"}</span></div>
            {certificateUrl ? (
              <a className={styles.proofLink} href={certificateUrl} target="_blank" rel="noopener noreferrer" aria-label={`View credential for ${tag}`}>
                <FontAwesomeIcon icon={faCertificate} aria-hidden="true" /> Proof / Credential
              </a>
            ) : null}
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
        {/* إضافة role="list" لدعم الـ Screen Readers */}
        <div className={styles["time-line"]} role="list" aria-label="Work Experience Timeline">
          {knowledgeEducationItems.map((item, index) => {
            // توزيع الكروت تلقائياً (يمين/يسار) بناءً على الـ index في حال عدم وجود isRight في الداتا
            const isRightSide = item.isRight !== undefined ? item.isRight : index % 2 !== 0;
            return <TimelineItem key={`exp-item-${index}`} {...item} isRight={isRightSide} />;
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(ExperienceSection);