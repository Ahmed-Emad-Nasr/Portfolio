"use client";

import { memo, useMemo, useState } from "react";
import styles from "./sensei-case-studies.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { caseEvidenceLibrary, caseStudyHighlights } from "@/app/core/data";

type EvidenceFilter = "All" | "LetsDefend" | "Simulation" | "Training";

const EVIDENCE_FILTERS: EvidenceFilter[] = ["All", "LetsDefend", "Simulation", "Training"];

const resolveEvidenceHref = (href: string): string => {
  if (typeof window === "undefined") return href;
  if (/^https?:\/\//i.test(href)) return href;

  const path = window.location.pathname;
  const scopePrefix = path.startsWith("/Portfolio/") || path === "/Portfolio" ? "/Portfolio" : "";

  if (href.startsWith("/")) {
    return `${scopePrefix}${href}`;
  }

  return `${scopePrefix}/${href}`;
};

const SenseiCaseStudies = memo(function SenseiCaseStudies() {
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState<EvidenceFilter>("All");

  const featuredStory = caseStudyHighlights[0];

  const storyMetrics = useMemo(() => {
    const totalProjects = caseStudyHighlights.length;
    const totalEvidence = caseEvidenceLibrary.length;
    const totalWords = caseStudyHighlights.reduce((count, item) => {
      return count + `${item.title} ${item.problem} ${item.action} ${item.result}`.split(/\s+/).length;
    }, 0);

    return [
      { label: "Stories", value: String(totalProjects) },
      { label: "Evidence files", value: String(totalEvidence) },
      { label: "Field note size", value: `${Math.max(3, Math.round(totalWords / 55))} min read` },
    ];
  }, []);

  const featuredKeywords = [featuredStory.domain, "Field Notes", "Operational change"];

  const filteredEvidence = useMemo(() => {
    if (activeEvidenceFilter === "All") return caseEvidenceLibrary;

    return caseEvidenceLibrary.filter((item) => {
      const platform = item.platform.toLowerCase();
      if (activeEvidenceFilter === "LetsDefend") return platform.includes("letsdefend");
      if (activeEvidenceFilter === "Training") return platform.includes("training");
      return platform.includes("simulation");
    });
  }, [activeEvidenceFilter]);

  return (
    <section className={styles.section} id="CaseStudies">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.ambientGlowAlt} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <SectionHeader japaneseText="事例" englishText="Case Studies" titleClassName={styles.title} />
          <p className={styles.lead}>A blog-style field journal of investigations, tuning work, and training outcomes with evidence attached.</p>
          <div className={styles.storyMetrics} aria-label="Case study summary metrics">
            {storyMetrics.map((metric) => (
              <div key={metric.label} className={styles.metricPill}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.blogLayout}>
          <MotionInView transition={{ duration: 0.18 }}>
            <article className={styles.featuredCard}>
              <div className={styles.featuredTop}>
                <span className={styles.featuredLabel}>Featured story</span>
                <span className={styles.featuredMeta}>~4 min read</span>
              </div>
              <div className={styles.featuredHero}>
                <div>
                  <span className={styles.domain}>{featuredStory.domain}</span>
                  <h3>{featuredStory.title}</h3>
                  <p className={styles.featuredIntro}>{featuredStory.problem}</p>
                </div>
                <div className={styles.featuredKeywords} aria-label="Story keywords">
                  {featuredKeywords.map((keyword) => (
                    <span key={keyword} className={styles.keywordChip}>{keyword}</span>
                  ))}
                </div>
              </div>
              <div className={styles.featuredGrid}>
                <div>
                  <span className={styles.storyLabel}>Problem</span>
                  <p>{featuredStory.problem}</p>
                </div>
                <div>
                  <span className={styles.storyLabel}>Action</span>
                  <p>{featuredStory.action}</p>
                </div>
                <div>
                  <span className={styles.storyLabel}>Result</span>
                  <p>{featuredStory.result}</p>
                </div>
              </div>
            </article>
          </MotionInView>
        </div>

        <div className={styles.evidenceBlock}>
          <div className={styles.evidenceHeader}>
            <div>
              <span className={styles.evidenceKicker}>Archive</span>
              <h3 className={styles.evidenceTitle}>Evidence Library</h3>
            </div>
            <p className={styles.evidenceLead}>Supporting files and write-ups from LetsDefend and simulation assignments.</p>
          </div>
          <div className={styles.evidenceFilters} role="group" aria-label="Evidence category filters">
            {EVIDENCE_FILTERS.map((filterItem) => (
              <button
                key={filterItem}
                type="button"
                className={`${styles.evidenceFilterBtn} ${activeEvidenceFilter === filterItem ? styles.activeFilter : ""}`}
                onClick={() => setActiveEvidenceFilter(filterItem)}
                aria-pressed={activeEvidenceFilter === filterItem}
              >
                {filterItem}
              </button>
            ))}
          </div>
          <p className={styles.evidenceCount} aria-live="polite">
            {filteredEvidence.length} item{filteredEvidence.length === 1 ? "" : "s"} shown
          </p>
          <div className={styles.evidenceGrid}>
            {filteredEvidence.map((item) => (
              <a
                key={item.id}
                className={styles.evidenceCard}
                href={resolveEvidenceHref(item.href)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${item.title} (${item.type})`}
                title={`Open ${item.title}`}
              >
                <span className={styles.evidenceType}>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.platform}</small>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiCaseStudies;
