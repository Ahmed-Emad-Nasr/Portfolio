"use client";

import { memo } from "react";
import styles from "./trust-section.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { trustAchievements, trustCertifications, trustMetrics, trustTestimonials, trustTooling } from "@/app/core/data";

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
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.08) }}
            >
              <article className={styles.metricCard} title={METRIC_CONTEXT[item.label] ?? item.label}>
                <p className={styles.metricValue}>{item.value}</p>
                <p className={styles.metricLabel}>{item.label}</p>
              </article>
            </MotionInView>
          ))}
        </div>

        <MotionInView
          transition={{ duration: 0.14, delay: 0.04 }}
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
            transition={{ duration: 0.14 }}
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
            transition={{ duration: 0.14, delay: 0.035 }}
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

        <div className={styles.testimonialsGrid}>
          {trustTestimonials.map((item, index) => (
            <MotionInView
              key={`${item.role}-${index}`}
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.1) }}
            >
              <article className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>&ldquo;{item.quote}&rdquo;</p>
                <p className={styles.testimonialMeta}>{item.role} • {item.context}</p>
              </article>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TrustSection;
