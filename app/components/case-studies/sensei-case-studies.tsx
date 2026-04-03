"use client";

import { memo, useMemo, useState } from "react";
import styles from "./sensei-case-studies.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { caseEvidenceLibrary, caseStudyHighlights, faqItems } from "@/app/core/data";

type EvidenceFilter = "All" | "LetsDefend" | "Simulation" | "Training";

const EVIDENCE_FILTERS: EvidenceFilter[] = ["All", "LetsDefend", "Simulation", "Training"];

const SenseiCaseStudies = memo(function SenseiCaseStudies() {
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState<EvidenceFilter>("All");

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
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <SectionHeader japaneseText="事例" englishText="Case Studies + FAQ" titleClassName={styles.title} />
          <p className={styles.lead}>Real work snapshots with practical outcomes across SOC, DFIR, and training.</p>
        </div>

        <div className={styles.grid}>
          {caseStudyHighlights.map((item, index) => (
            <MotionInView
              key={item.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.15) }}
              threshold={0.12}
              triggerOnce
            >
              <article className={styles.card}>
                <span className={styles.domain}>{item.domain}</span>
                <h3>{item.title}</h3>
                <p><strong>Problem:</strong> {item.problem}</p>
                <p><strong>Action:</strong> {item.action}</p>
                <p><strong>Result:</strong> {item.result}</p>
              </article>
            </MotionInView>
          ))}
        </div>

        <div className={styles.evidenceBlock}>
          <h3 className={styles.evidenceTitle}>Evidence Library</h3>
          <p className={styles.evidenceLead}>Uploaded case files from LetsDefend and simulation assignments.</p>
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
                href={item.href}
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

        <div className={styles.faqBlock} id="FAQ">
          <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
          <p className={styles.faqLead}>Quick answers covering scope, delivery, and collaboration.</p>
          <div className={styles.faqGrid}>
            {faqItems.map((item, index) => (
              <MotionInView
                key={`${item.q}-${index}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.14, delay: Math.min(index * 0.02, 0.12) }}
                threshold={0.12}
                triggerOnce
              >
                <article className={styles.faqCard}>
                  <span className={styles.faqCategory}>{item.category}</span>
                  <h4>{item.q}</h4>
                  <p>{item.a}</p>
                </article>
              </MotionInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiCaseStudies;
