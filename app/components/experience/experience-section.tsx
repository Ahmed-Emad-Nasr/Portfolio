"use client";

import { memo } from "react";
import styles from "./experience-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { calculateExperience } from "@/app/core/utils/utils";
import { knowledgeEducationItems } from "@/app/core/config/portfolio";
import { toBulletItems } from "@/app/core/utils/utils";
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
                <a href={subTagHyperlink} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>
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
          {skills?.length > 0 && (
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
              <a className={styles.proofLink} href={certificateUrl} target="_blank" rel="noopener noreferrer">
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
  return (
    <section className={styles["section-education"]} id="Experience">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="経験" englishText="Experience" titleClassName={styles.title} />
        </div>
        
        <div className={styles["time-line"]}>
          {knowledgeEducationItems.map((item, index) => (
            <TimelineItem key={index} {...item} isRight={item.isRight !== undefined ? item.isRight : index % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ExperienceSection);