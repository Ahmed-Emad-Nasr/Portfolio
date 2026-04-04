"use client";

import { memo } from "react";
import styles from "./sensei-about.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { aboutMeCards, aboutSummaryParagraph } from "@/app/core/data";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import MotionInView from "@/app/core/components/MotionInView";

const SenseiAbout = memo(function SenseiAbout() {
  return (
    <section className={styles["about-section"]} id="About">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="私について" englishText="About Me" titleClassName={styles.title} />
        </div>

        <MotionInView transition={{ duration: 0.14 }}>
          <p className={styles.summary}>{aboutSummaryParagraph}</p>
        </MotionInView>

        <div className={styles["cards-grid"]}>
          {aboutMeCards.map((card, index) => (
            <MotionInView
              key={`${card.title}-${index}`}
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.08) }}
            >
              <article className={styles.card}>
                <div className={styles["card-icon-wrapper"]}>
                  <i className={card.icon} aria-hidden="true" />
                </div>
                <h3>{card.title}</h3>
                <ul className={styles["card-list"]}>
                  {toBulletItems(card.description).map((item, itemIndex) => (
                    <li key={`${card.title}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              </article>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
});

export default SenseiAbout;