"use client";

import { memo, useState } from "react";
import styles from "./experience-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { calculateExperience } from "@/app/core/utils/experienceUtils";
import { knowledgeEducationItems } from "@/app/core/data/experience";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faArrowUpRightFromSquare, faBriefcase, faCertificate } from "@fortawesome/free-solid-svg-icons";
import MotionInView from "@/app/core/components/MotionInView";

const TimelineItem = memo(({ isRight, tag, subTag, subTagHyperlink, desc, startDate, endDate, showDate = true, skills = [], certificateUrl }: any) => {
  const experienceTime = calculateExperience(startDate, endDate);
  const bullets = toBulletItems(desc);

  return (
    <MotionInView className={`${styles["timeline-container"]} ${isRight ? styles.right : styles.left}`}>
      <div className={styles.content}>
        <div className={styles.tag}>
          <h2><FontAwesomeIcon icon={faBriefcase} className={styles.titleIcon} /> {tag}</h2>
          {subTag && (
            subTagHyperlink ? (
              <h3>
                <a href={subTagHyperlink} target="_blank" style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>
                  {subTag} <FontAwesomeIcon icon={faArrowUpRightFromSquare} className={styles.linkIcon} />
                </a>
              </h3>
            ) : (
              <h3>{subTag}</h3>
            )
          )}
        </div>
        
        <div className={styles.desc}>
          <ul className={styles["desc-list"]}>
            {bullets.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
          {skills.length > 0 && (
            <div className={styles.skillTags}>
              {skills.map((skill: string) => <span key={skill} className={styles.skillTag}>{skill}</span>)}
            </div>
          )}
        </div>

        {showDate && (
          <div className={styles["date-details"]}>
            <div className={styles["experience-time"]}><FontAwesomeIcon icon={faClock} /> <span>{experienceTime}</span></div>
            <div className={styles["date-range"]}><FontAwesomeIcon icon={faCalendarAlt} /> <span>{startDate} {endDate ? `- ${endDate}` : "- Present"}</span></div>
            {certificateUrl && (
              <a className={styles.proofLink} href={certificateUrl} target="_blank">
                <FontAwesomeIcon icon={faCertificate} /> Proof / Credential
              </a>
            )}
          </div>
        )}
      </div>
    </MotionInView>
  );
});

TimelineItem.displayName = "TimelineItem";

function ExperienceSection() {
  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <section className={styles["section-education"]} id="Experience">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="経験" englishText="Experience" titleClassName={styles.title} />
        </div>
        
        <div className={styles["time-line"]}>
          {knowledgeEducationItems.slice(0, visibleCount).map((item, index) => (
            <TimelineItem key={index} {...item} isRight={item.isRight !== undefined ? item.isRight : index % 2 !== 0} />
          ))}
        </div>

        {visibleCount < knowledgeEducationItems.length && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => setVisibleCount((c) => Math.min(knowledgeEducationItems.length, c + 4))}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(ExperienceSection);