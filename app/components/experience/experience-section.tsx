"use client";
import { memo, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import styles from "./experience-section.module.css";
import MotionInView from "@/app/core/components/MotionInView";
import SectionHeader from "@/app/core/components/SectionHeader";
import { calculateExperience } from "@/app/core/utils/experienceUtils";
import { knowledgeEducationItems } from "@/app/core/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faArrowUpRightFromSquare, faBriefcase } from "@fortawesome/free-solid-svg-icons";

type TimelineItemProps = { tag: string; subTag?: string; subTagHyperlink?: string; desc: string; isRight: boolean; startDate: string; endDate?: string; showDate?: boolean; index: number; };

const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HEADER_INITIAL = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN = { opacity: 1, y: 0 } as const;
const HEADER_ANIMATE_OUT = {} as const;
const HEADER_TRANSITION = { duration: 1.2, ease: SLIDE_EASE } as const;

const TimelineItem = memo<TimelineItemProps>(({ isRight, tag, subTag, subTagHyperlink, desc, index, startDate, endDate, showDate = true }) => {
  const experienceTime = useMemo(() => calculateExperience(startDate, endDate), [startDate, endDate]);
  const variants: Variants = useMemo(() => ({
    hidden: { opacity: 0, x: isRight ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 1.2, delay: index * 0.2, ease: SLIDE_EASE } },
  }), [isRight, index]);

  const containerClass = `${styles["timeline-container"]} ${isRight ? styles.right : styles.left}`;
  const subTagStyle = subTagHyperlink ? ({ cursor: "pointer" } as const) : ({ cursor: "default" } as const);

  return (
    <MotionInView className={containerClass} variants={variants}>
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
          <p>{desc}</p>
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
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles["section-education"]} id="Experience">
      <div className={styles.container}>
        <motion.div ref={headerRef} className={styles["header-section"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <SectionHeader japaneseText="経験" englishText="Experience" titleClassName={styles.title} />
        </motion.div>
        <div className={styles["time-line"]}>
          {knowledgeEducationItems.map((item, index) => (
            <TimelineItem key={`${item.tag}-${index}`} {...item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ExperienceSection);