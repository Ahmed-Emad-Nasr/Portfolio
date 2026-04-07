"use client";

/*
 * File: stats-testimonials.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Display impact stats and professional testimonials
 */

import { memo, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "./stats-testimonials.module.css";
import { enhancedStats, enhancedTestimonials } from "@/app/core/data";
import MotionInView from "@/app/core/components/MotionInView";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type StatCategory = "Impact" | "Performance" | "Achievement" | "Engagement";

const STAT_CATEGORIES: StatCategory[] = ["Impact", "Performance", "Achievement", "Engagement"];

const StatsTestimonials = memo(function StatsTestimonials() {
  const [selectedCategory, setSelectedCategory] = useState<StatCategory | "All">("All");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const filteredStats = useMemo(() => {
    if (selectedCategory === "All") {
      return enhancedStats;
    }
    return enhancedStats.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section className={styles.section} aria-label="Impact Statistics & Testimonials">
      <MotionInView>
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Impact & Recognition</h2>
          <p className={styles.subtitle}>Quantified results from SOC operations, threat analysis, and security training programs.</p>

          {/* Stats Intro Text */}
          <div className={styles.introText}>
            <p>
              Over 2 years of hands-on security work, I've delivered measurable improvements in alert accuracy, investigation speed, and team training
              outcomes.
            </p>
          </div>

          {/* Category Filter for Stats */}
          <div className={styles.statsCategoryFilter}>
            <button
              className={selectedCategory === "All" ? `${styles.categoryBtn} ${styles.active}` : styles.categoryBtn}
              onClick={() => setSelectedCategory("All")}
              aria-pressed={selectedCategory === "All"}
            >
              All Stats
            </button>
            {STAT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? `${styles.categoryBtn} ${styles.active}` : styles.categoryBtn}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {filteredStats.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                {stat.icon && (
                  <div className={styles.statIcon}>
                    <FontAwesomeIcon icon={stat.icon as any} />
                  </div>
                )}

                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    <span className={styles.value}>{stat.value}</span>
                    {stat.trend && (
                      <span className={`${styles.trend} ${styles[`trend-${stat.trend}`]}`}>
                        <FontAwesomeIcon icon={stat.trend === "up" ? faArrowUp : stat.trend === "down" ? faArrowDown : faStar} />
                      </span>
                    )}
                  </div>
                  <p className={styles.label}>{stat.label}</p>
                  {stat.description && <p className={styles.description}>{stat.description}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <div className={styles.testimonialsSection}>
            <div className={styles.testimonialsHead}>
              <h3>Professional Testimonials</h3>
              <p>What mentors and colleagues say</p>
            </div>

            {/* Featured Testimonial */}
            <div className={styles.featuredTestimonial}>
              <div className={styles.testimonialCard}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className={styles.star} />
                  ))}
                </div>
                <blockquote className={styles.quote}>{enhancedTestimonials[activeTestimonial].quote}</blockquote>

                <div className={styles.testimonialFooter}>
                  <div className={styles.testimonialMeta}>
                    <strong className={styles.role}>{enhancedTestimonials[activeTestimonial].role}</strong>
                    <p className={styles.context}>{enhancedTestimonials[activeTestimonial].context}</p>
                  </div>
                  {enhancedTestimonials[activeTestimonial].impact && (
                    <div className={styles.impact}>
                      <span className={styles.impactLabel}>Impact:</span>
                      <span className={styles.impactValue}>{enhancedTestimonials[activeTestimonial].impact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Testimonials Carousel */}
              {enhancedTestimonials.length > 1 && (
                <div className={styles.testimonialNav}>
                  {enhancedTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      className={idx === activeTestimonial ? `${styles.navDot} ${styles.active}` : styles.navDot}
                      onClick={() => setActiveTestimonial(idx)}
                      aria-label={`Show testimonial ${idx + 1}`}
                      aria-pressed={idx === activeTestimonial}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a
              href="#Contact"
              className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
              onClick={() => recordFunnelEvent("cta_contact_click")}
            >
              Start a Security Engagement
            </a>
            <a
              href="/Portfolio/blog"
              className={`${styles.ctaBtn} ${styles.ctaSecondary}`}
              onClick={() => recordFunnelEvent("cta_blog_click")}
            >
              Explore Full Reports
            </a>
          </div>
        </div>
      </MotionInView>
    </section>
  );
});

export default StatsTestimonials;
