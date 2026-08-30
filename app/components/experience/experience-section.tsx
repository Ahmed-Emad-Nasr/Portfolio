"use client";

import { memo } from "react";
import Icon from "@/app/core/icons/Icon";
import styles from "./experience-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { calculateExperience, toBulletItems } from "@/app/core/utils/utils";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import Reveal from "@/app/core/components/Reveal";
import Spotlight from "@/app/core/components/Spotlight";

/*
 * These props were typed `any`, which switched TypeScript off inside the most
 * repeated component on the homepage: a renamed field in portfolio.ts, a date
 * passed as a number, a missing `tag` — none of it would be caught at build
 * time, it would just render blank in production.
 *
 * The shape is derived from knowledgeEducationItems rather than hand-written,
 * so it can never drift from the data. Optional members are the ones some
 * entries omit (e.g. an ongoing role has no endDate).
 */
type TimelineEntry = (typeof knowledgeEducationItems)[number];

type TimelineItemProps = {
  tag: string;
  desc: string;
  startDate: string;
  endDate?: string;
  subTag?: string;
  subTagHyperlink?: string;
  certificateUrl?: string;
  showDate?: boolean;
  skills?: readonly string[];
  isRight?: boolean;
};

const TimelineItem = memo(({
  isRight,
  tag,
  subTag,
  subTagHyperlink,
  desc,
  startDate,
  endDate,
  showDate = true,
  skills = [],
  certificateUrl,
}: TimelineItemProps) => {
  const experienceTime = calculateExperience(startDate, endDate);
  const bullets = toBulletItems(desc);

  return (
    <Reveal className={`${styles["timeline-container"]} ${isRight ? styles.right : styles.left}`}>
      <div className={styles.content} data-fx="card">
        <div className={styles.tag}>
          {/* was <h2>: the section already owns an h2 ("経験 • Experience"),
              so ten more h2s at the same level flattened the outline. Each
              role is a child of that section — h3 — and its employer h4. */}
          <h3><Icon name="faBriefcase" className={styles.titleIcon} /> {tag}</h3>
          {subTag && (
            subTagHyperlink ? (
              <h4>
                <a href={subTagHyperlink} target="_blank" rel="noopener noreferrer" className={styles.subTagLink}>
                  {subTag} <Icon name="faArrowUpRightFromSquare" className={styles.linkIcon} />
                </a>
              </h4>
            ) : (
              <h4>{subTag}</h4>
            )
          )}
        </div>
        
        <div className={styles.desc}>
          <ul className={styles["desc-list"]}>
            {bullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {skills?.length > 0 && (
            <div className={styles.skillTags}>
              {skills.map((skill) => <span key={skill} className={styles.skillTag}>{skill}</span>)}
            </div>
          )}
        </div>

        {showDate && (
          <div className={styles["date-details"]}>
            <div className={styles["experience-time"]}><Icon name="faClock" /> <span>{experienceTime}</span></div>
            <div className={styles["date-range"]}><Icon name="faCalendarAlt" /> <span>{startDate} {endDate ? `- ${endDate}` : "- Present"}</span></div>
            {certificateUrl && (
              <a className={styles.proofLink} href={certificateUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="faCertificate" /> Proof / Credential
              </a>
            )}
          </div>
        )}
      </div>
    </Reveal>
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
        
        <Spotlight className={styles["time-line"]}>
          {knowledgeEducationItems.map((item: TimelineEntry, index) => (
            <TimelineItem
              // key={index} breaks React's reconciliation the moment an entry
              // is inserted or reordered — every item after it is treated as
              // changed. tag+startDate is stable and unique per role.
              key={`${item.tag}-${item.startDate}`}
              {...item}
              isRight={item.isRight !== undefined ? item.isRight : index % 2 !== 0}
            />
          ))}
        </Spotlight>
      </div>
    </section>
  );
}

export default memo(ExperienceSection);