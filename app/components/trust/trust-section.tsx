"use client";

import { memo } from "react";
import styles from "./trust-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { trustAchievements, trustCertifications, trustMetrics, trustTooling } from "@/app/core/data";

const TrustSection = memo(function TrustSection() {
  return (
    <section className={styles["trust-section"]} id="Trust">
      <div className={styles.container}>
        <div className={styles["header-section"]}>
          <SectionHeader japaneseText="信頼" englishText="Trust & Impact" titleClassName={styles.title} />
        </div>

        <div className={styles["metrics-grid"]}>
          {trustMetrics.map((item, index) => (
            <MotionInView
              key={`${item.label}-${index}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.08) }}
              threshold={0.12}
              triggerOnce
            >
              <article className={styles.metricCard}>
                <p className={styles.metricValue}>{item.value}</p>
                <p className={styles.metricLabel}>{item.label}</p>
              </article>
            </MotionInView>
          ))}
        </div>

        <MotionInView
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.14, delay: 0.04 }}
          threshold={0.12}
          triggerOnce
        >
          <div className={styles.toolsCard}>
            <h3>Trusted Stack</h3>
            <div className={styles.toolsList}>
              {trustTooling.map((tool, index) => (
                <span key={`${tool}-${index}`} className={styles.toolTag}>{tool}</span>
              ))}
            </div>
          </div>
        </MotionInView>

        <div className={styles["credibility-grid"]}>
          <MotionInView
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.14 }}
            threshold={0.12}
            triggerOnce
          >
            <article className={styles.credCard}>
              <h3>Achievement Highlights</h3>
              <ul>
                {trustAchievements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
          </MotionInView>

          <MotionInView
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.14, delay: 0.035 }}
            threshold={0.12}
            triggerOnce
          >
            <article className={styles.credCard}>
              <div className={styles.certHeaderRow}>
                <h3>Certification Spotlight</h3>
                <a href="#Certifications" className={styles.certMiniBtn} aria-label="Go to Certifications section">
                  View
                </a>
              </div>
              <div className={styles.certList}>
                {trustCertifications.map((cert, index) => (
                  <span key={`${cert}-${index}`} className={styles.certTag}>{cert}</span>
                ))}
              </div>
            </article>
          </MotionInView>
        </div>
      </div>
    </section>
  );
});

export default TrustSection;
