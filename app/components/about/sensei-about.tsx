"use client";

import { memo } from "react";
import styles from "./sensei-about.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import trustStyles from "@/app/components/trust/trust-section.module.css";
import { aboutMeCards, aboutSummaryParagraph, trustAchievements, trustCertifications, trustMetrics, trustTestimonials, trustTooling } from "@/app/core/data";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import MotionInView from "@/app/core/components/MotionInView";

const METRIC_CONTEXT: Record<string, string> = {
  "LinkedIn Followers": "Audience reach on professional cybersecurity content and updates.",
  "Simulated SOC Alerts Investigated": "Hands-on SOC triage volume from labs and simulations.",
  "Cybersecurity Sessions Delivered": "Technical training sessions delivered across communities and cohorts.",
  "Learners Trained in Security Topics": "People trained through workshops, guided labs, and mentorship.",
  "SOC / DFIR Trainings & Bootcamps": "Completed training tracks focused on SOC and incident response.",
  "Validated Vulnerabilities in Labs": "Confirmed security findings in controlled lab environments.",
  "Average Training Feedback Score": "Average learner feedback score collected after training sessions.",
  "National University CTF Ranking": "Best ranking achieved in national-level CTF competition.",
  "Class Rank (InfoSec & DFIR)": "Academic ranking within Information Security and DFIR track.",
  "Computer Science GPA": "Current GPA in Bachelor of Computer Science program.",
  "eJPT v2 Score": "Exam result for eJPT v2 practical certification.",
  "CCNA 200-301 Score": "Exam result for Cisco CCNA 200-301 certification.",
};

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

        <div className={styles["trust-block"]}>
          <div className={styles["trust-header"]}>
            <SectionHeader japaneseText="信頼" englishText="Trust & Impact" titleClassName={trustStyles.title} />
          </div>

          <div className={trustStyles["metrics-grid"]}>
            {trustMetrics.map((item, index) => (
              <MotionInView
                key={`${item.label}-${index}`}
                transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.08) }}
              >
                <article className={trustStyles.metricCard} title={METRIC_CONTEXT[item.label] ?? item.label}>
                  <p className={trustStyles.metricValue}>{item.value}</p>
                  <p className={trustStyles.metricLabel}>{item.label}</p>
                </article>
              </MotionInView>
            ))}
          </div>

          <MotionInView transition={{ duration: 0.14, delay: 0.04 }}>
            <div className={trustStyles.toolsCard}>
              <h3>Trusted Stack</h3>
              <div className={trustStyles.toolsList}>
                {trustTooling.map((tool, index) => (
                  <span key={`${tool}-${index}`} className={trustStyles.toolTag}>{tool}</span>
                ))}
              </div>
            </div>
          </MotionInView>

          <div className={trustStyles["credibility-grid"]}>
            <MotionInView transition={{ duration: 0.14 }}>
              <article className={trustStyles.credCard}>
                <h3>Achievement Highlights</h3>
                <ul>
                  {trustAchievements.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </article>
            </MotionInView>

            <MotionInView transition={{ duration: 0.14, delay: 0.035 }}>
              <article className={trustStyles.credCard}>
                <div className={trustStyles.certHeaderRow}>
                  <h3>Certification Spotlight</h3>
                  <a href="#Certifications" className={trustStyles.certMiniBtn} aria-label="Go to Certifications section">
                    View
                  </a>
                </div>
                <div className={trustStyles.certList}>
                  {trustCertifications.map((cert, index) => (
                    <span key={`${cert}-${index}`} className={trustStyles.certTag}>{cert}</span>
                  ))}
                </div>
              </article>
            </MotionInView>
          </div>

          <div className={trustStyles.testimonialsGrid}>
            {trustTestimonials.map((item, index) => (
              <MotionInView
                key={`${item.role}-${index}`}
                transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.1) }}
              >
                <article className={trustStyles.testimonialCard}>
                  <p className={trustStyles.testimonialQuote}>&ldquo;{item.quote}&rdquo;</p>
                  <p className={trustStyles.testimonialMeta}>{item.role} • {item.context}</p>
                </article>
              </MotionInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiAbout;