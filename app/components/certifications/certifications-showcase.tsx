"use client";

/*
 * File: certifications-showcase.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Display enhanced certifications with difficulty and category
 */

import { memo, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faShieldAlt, faCloud, faNetworkWired, faCode, faTrophy } from "@fortawesome/free-solid-svg-icons";
import styles from "./certifications-showcase.module.css";
import { enhancedCertifications, type Certification } from "@/app/core/data";
import MotionInView from "@/app/core/components/MotionInView";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type CertCategory = Certification["category"];

const CATEGORY_ICONS: Record<CertCategory, any> = {
  Security: faShieldAlt,
  Cloud: faCloud,
  Networking: faNetworkWired,
  Development: faCode,
  Training: faTrophy,
};

const DIFFICULTY_COLORS: Record<Certification["difficulty"], string> = {
  Beginner: "#4da6ff",
  Intermediate: "#6bcf7f",
  Advanced: "#ffd93d",
};

const CertificationsShowcase = memo(function CertificationsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<CertCategory | "All">("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(enhancedCertifications.map((c) => c.category)));
    return cats;
  }, []);

  const filteredCerts = useMemo(() => {
    if (selectedCategory === "All") {
      return enhancedCertifications;
    }
    return enhancedCertifications.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  const certsByDifficulty = useMemo(() => {
    const byDiff: Record<string, number> = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    enhancedCertifications.forEach((c) => {
      byDiff[c.difficulty]++;
    });
    return byDiff;
  }, []);

  return (
    <section className={styles.section} aria-label="Certifications & Achievements">
      <MotionInView>
        <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Certifications & Awards</h2>
                <p className={styles.subtitle}>Industry-recognized certifications and professional achievements in cybersecurity.</p>

          {/* Stats Overview */}
          <div className={styles.statsOverview}>
            <div className={styles.statCard}>
              <strong>{enhancedCertifications.length}</strong>
              <span>Total Certifications</span>
            </div>
            <div className={styles.statCard}>
              <strong>{certsByDifficulty.Advanced}</strong>
              <span>Advanced Level</span>
            </div>
            <div className={styles.statCard}>
              <strong>{certsByDifficulty.Intermediate}</strong>
              <span>Intermediate</span>
            </div>
            <div className={styles.statCard}>
              <strong>{certsByDifficulty.Beginner}</strong>
              <span>Beginner Friendly</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className={styles.categoryFilter}>
            <button
              className={selectedCategory === "All" ? `${styles.catBtn} ${styles.active}` : styles.catBtn}
              onClick={() => setSelectedCategory("All")}
              aria-pressed={selectedCategory === "All"}
            >
              All Credentials
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? `${styles.catBtn} ${styles.active}` : styles.catBtn}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                <FontAwesomeIcon icon={CATEGORY_ICONS[category]} />
                {category}
              </button>
            ))}
          </div>

          {/* Certifications Grid */}
          <div className={styles.certsGrid}>
            {filteredCerts.map((cert, index) => (
              <div key={`${cert.title}-${cert.issuer}`} className={styles.certCard}>
                <div className={styles.certHead}>
                  <div className={styles.badgeArea}>
                    <div
                      className={styles.difficultyBadge}
                      style={{ borderColor: DIFFICULTY_COLORS[cert.difficulty], backgroundColor: `${DIFFICULTY_COLORS[cert.difficulty]}22` }}
                    >
                      <span style={{ color: DIFFICULTY_COLORS[cert.difficulty] }}>{cert.difficulty}</span>
                    </div>
                    <span className={styles.categoryBadge}>
                      <FontAwesomeIcon icon={CATEGORY_ICONS[cert.category]} />
                      {cert.category}
                    </span>
                  </div>
                  <div className={styles.indexCircle}>{index + 1}</div>
                </div>

                <h3>{cert.title}</h3>
                <p className={styles.issuer}>{cert.issuer}</p>

                {cert.scoreOrAchievement && (
                  <div className={styles.achievement}>
                    <strong>Achievement:</strong>
                    <span>{cert.scoreOrAchievement}</span>
                  </div>
                )}

                {cert.issueDate && (
                  <p className={styles.date}>
                    Issued: {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                  </p>
                )}

                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" className={styles.certLink}>
                    View Credential
                    <span className={styles.arrow}>→</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className={styles.ctaRow}>
            <a
              href="#Contact"
              className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
              onClick={() => recordFunnelEvent("cta_contact_click")}
            >
              Request Verification Session
            </a>
            <a
              href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20discuss%20a%20security%20engagement."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.ctaBtn} ${styles.ctaSecondary}`}
              onClick={() => recordFunnelEvent("cta_whatsapp_click")}
            >
              Chat on WhatsApp
            </a>
          </div>

          {filteredCerts.length === 0 && <p className={styles.emptyState}>No certifications found in this category.</p>}
        </div>
      </MotionInView>
    </section>
  );
});

export default CertificationsShowcase;
