"use client";

import { memo } from "react";
import styles from "./sensei-about.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import { aboutMeCards, aboutSummaryParagraph } from "@/app/core/data";
import { toBulletItems } from "@/app/core/utils/bulletUtils";

const SenseiAbout = memo(function SenseiAbout() {
  return (
    <section className={styles["about-section"]} id="About">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="私について" englishText="About Me" titleClassName={styles.title} />
        </div>

        <p className={styles.summary}>{aboutSummaryParagraph}</p>

        <div className={styles["cards-grid"]}>
          {aboutMeCards.map((card, index) => (
            <article className={styles.card} key={`${card.title}-${index}`}>
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
          ))}
        </div>
      </div>
    </section>
  );
});

export default SenseiAbout;