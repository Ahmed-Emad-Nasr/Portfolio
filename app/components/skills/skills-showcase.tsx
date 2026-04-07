"use client";

/*
 * File: skills-showcase.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Display enhanced skills with proficiency levels and categories
 */

import { memo, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faShield, faCode, faCloud, faBell } from "@fortawesome/free-solid-svg-icons";
import styles from "./skills-showcase.module.css";
import { enhancedSkills, type Skill } from "@/app/core/data";
import MotionInView from "@/app/core/components/MotionInView";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type SkillCategory = Skill["category"];

const CATEGORY_ICONS: Record<SkillCategory, any> = {
  "SIEM & Monitoring": faBell,
    "Incident Response": faShield,
  "Threat Detection": faCheckCircle,
  "Automation & Programming": faCode,
  "Cloud & Infrastructure": faCloud,
};

const CATEGORY_ORDER: SkillCategory[] = [
  "SIEM & Monitoring",
  "Incident Response",
  "Threat Detection",
  "Automation & Programming",
  "Cloud & Infrastructure",
];

const getProficiencyColor = (proficiency: Skill["proficiency"]): string => {
  switch (proficiency) {
    case "Expert":
      return "#ff6b6b";
    case "Advanced":
      return "#ffd93d";
    case "Intermediate":
      return "#6bcf7f";
    case "Beginner":
      return "#4da6ff";
    default:
      return "#cccccc";
  }
};

const SkillsShowcase = memo(function SkillsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "All">("All");

  const categories = useMemo(() => CATEGORY_ORDER, []);

  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      "SIEM & Monitoring": [],
      "Incident Response": [],
      "Threat Detection": [],
      "Automation & Programming": [],
      "Cloud & Infrastructure": [],
    };

    enhancedSkills.forEach((skill) => {
      grouped[skill.category].push(skill);
    });

    return grouped;
  }, []);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === "All") {
      return enhancedSkills;
    }
    return skillsByCategory[selectedCategory] || [];
  }, [selectedCategory, skillsByCategory]);

  const stats = useMemo(() => {
    const experts = enhancedSkills.filter((s) => s.proficiency === "Expert").length;
    const advanced = enhancedSkills.filter((s) => s.proficiency === "Advanced").length;
    const total = enhancedSkills.length;
    return { experts, advanced, total };
  }, []);

  return (
    <section className={styles.section} aria-label="Technical Skills Showcase">
      <MotionInView>
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Skills & Expertise</h2>
            <p className={styles.subtitle}>Core competencies in SOC operations, incident response, and cybersecurity.</p>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <strong>{stats.total}</strong>
              <span>Total Skills</span>
            </div>
            <div className={styles.stat}>
              <strong>{stats.advanced}</strong>
              <span>Advanced Level</span>
            </div>
            <div className={styles.stat}>
              <strong>{stats.experts}</strong>
              <span>Expert Level</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className={styles.filterWrap}>
            <button
              className={selectedCategory === "All" ? `${styles.filterBtn} ${styles.active}` : styles.filterBtn}
              onClick={() => setSelectedCategory("All")}
              aria-pressed={selectedCategory === "All"}
            >
              All Skills
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? `${styles.filterBtn} ${styles.active}` : styles.filterBtn}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                <FontAwesomeIcon icon={CATEGORY_ICONS[category]} />
                {category}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className={styles.skillsGrid}>
            {filteredSkills.map((skill) => (
              <div key={skill.name} className={styles.skillCard}>
                <div className={styles.skillHead}>
                  <h4>{skill.name}</h4>
                  <span
                    className={styles.proficiencyBadge}
                    style={{ borderColor: getProficiencyColor(skill.proficiency), color: getProficiencyColor(skill.proficiency) }}
                  >
                    {skill.proficiency}
                  </span>
                </div>

                <p className={styles.categoryLabel}>{skill.category}</p>

                {skill.yearsExperience && (
                  <p className={styles.experience}>{skill.yearsExperience}+ years experience</p>
                )}

                {skill.relatedTools && skill.relatedTools.length > 0 && (
                  <div className={styles.relatedTools}>
                    <span className={styles.toolsLabel}>Tools:</span>
                    <div className={styles.toolsList}>
                      {skill.relatedTools.slice(0, 2).map((tool) => (
                        <span key={tool} className={styles.toolTag}>
                          {tool}
                        </span>
                      ))}
                      {skill.relatedTools.length > 2 && <span className={styles.moreTools}>+{skill.relatedTools.length - 2}</span>}
                    </div>
                  </div>
                )}

                <div className={styles.proficiencyBar}>
                  <div
                    className={styles.fill}
                    style={{
                      width: skill.proficiency === "Expert" ? "100%" : skill.proficiency === "Advanced" ? "80%" : skill.proficiency === "Intermediate" ? "60%" : "40%",
                      backgroundColor: getProficiencyColor(skill.proficiency),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.ctaRow}>
            <a
              href="#Contact"
              className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
              onClick={() => recordFunnelEvent("cta_contact_click")}
            >
              Discuss Your Security Scope
            </a>
            <a
              href="/Portfolio/blog"
              className={`${styles.ctaBtn} ${styles.ctaSecondary}`}
              onClick={() => recordFunnelEvent("cta_blog_click")}
            >
              See Full Case Writeups
            </a>
          </div>

          {filteredSkills.length === 0 && <p className={styles.emptyState}>No skills found in this category.</p>}
        </div>
      </MotionInView>
    </section>
  );
});

export default SkillsShowcase;
