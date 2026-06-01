import React, { useState } from "react";
import Image from "next/image";
import MotionInView from "@/app/core/components/MotionInView";
import BlogCard from "../BlogCard";
import styles from "../page.module.css";
import type { PdfResource } from "../blog-types";
import { EMPTY_SCREENSHOTS } from "@/app/core/data/cases";
import { useEffect } from "react";

type BlogPdfLibrarySectionProps = {
  filteredCount: number;
  pdfTypeFilters: string[];
  pdfFilter: string;
  setPdfFilter: (value: string) => void;
  difficultyOptions: string[];
  difficultyFilter: string | null;
  setDifficultyFilter: (value: string | null) => void;
  categoryOptions: string[];
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  sortBy: "recent" | "popularity" | "difficulty";
  setSortBy: (value: "recent" | "popularity" | "difficulty") => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  leadCase: PdfResource | null;
  leadCaseSpotlightImage: string | null;
  relatedCases: PdfResource[];
  visiblePdfCards: PdfResource[];
  screenshotsById: Record<string, string[]>;
  rawQuery: string;
  setRawQuery: (value: string) => void;
  toggleToolFilter: (tool: string) => void;
  openGallery: (title: string, screenshots: string[], index?: number) => void;
  normalizeHref: (href: string) => string;
};

export default function BlogPdfLibrarySection({
  filteredCount,
  pdfTypeFilters,
  pdfFilter,
  setPdfFilter,
  difficultyOptions,
  difficultyFilter,
  setDifficultyFilter,
  categoryOptions,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  hasActiveFilters,
  clearAllFilters,
  leadCase,
  leadCaseSpotlightImage,
  relatedCases,
  visiblePdfCards,
  screenshotsById,
  rawQuery,
  setRawQuery,
  toggleToolFilter,
  openGallery,
  normalizeHref,
}: BlogPdfLibrarySectionProps) {
  const PAGE_SIZE = 4;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [visiblePdfCards.length]);

  return (
    <section className={styles.block} aria-labelledby="blog-pdfs-title">
      <MotionInView className={styles.blockHeading}>
        <h2 id="blog-pdfs-title">PDF Library</h2>
        <p>{filteredCount} result(s) found.</p>
      </MotionInView>

      <MotionInView className={styles.toolbar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search cases, tags, tools…"
          value={rawQuery}
          onChange={(event) => setRawQuery(event.target.value)}
          aria-label="Search PDF resources"
        />

        <div className={styles.modeSwitch} role="group" aria-label="Filter by type">
          {pdfTypeFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.modeButton} ${pdfFilter === filter ? styles.modeButtonActive : ""}`}
              onClick={() => setPdfFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {difficultyOptions.length > 0 && (
          <div className={styles.sortButtons} role="group" aria-label="Filter by difficulty">
            {difficultyOptions.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className={`${styles.sortButton} ${difficultyFilter === difficulty ? styles.activeSort : ""}`}
                onClick={() => setDifficultyFilter(difficultyFilter === difficulty ? null : difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
        )}

        {categoryOptions.length > 0 && (
          <div className={styles.sortButtons} role="group" aria-label="Filter by category">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.sortButton} ${categoryFilter === category ? styles.activeSort : ""}`}
                onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className={styles.sortButtons} role="group" aria-label="Sort order">
          {(["recent", "difficulty", "popularity"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.sortButton} ${sortBy === value ? styles.activeSort : ""}`}
              onClick={() => setSortBy(value)}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
            ✕ Clear Filters
          </button>
        )}
      </MotionInView>

      {leadCase && (
        <MotionInView className={styles.caseSpotlight}>
          <div className={styles.caseSpotlightBody}>
            <p className={styles.caseSpotlightTag}>Case Spotlight</p>
            <h3>{leadCase.title}</h3>
            <p>{leadCase.description || "Featured first for quick navigation."}</p>
            <div className={styles.caseMetadata}>
              {leadCase.difficulty && (
                <span className={`${styles.badge} ${styles[`difficulty-${leadCase.difficulty.toLowerCase()}`]}`}>
                  {leadCase.difficulty}
                </span>
              )}
              {leadCase.category && <span className={styles.badge}>{leadCase.category}</span>}
              {leadCase.readTime && <span className={styles.badge}>{leadCase.readTime} min read</span>}
            </div>
            {leadCase.tags && leadCase.tags.length > 0 && (
              <div className={styles.tagsList}>
                {leadCase.tags.slice(0, 4).map((tag) => (
                  <button key={tag} type="button" className={styles.tagButton} onClick={() => setRawQuery(tag)}>
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            {leadCase.tools && leadCase.tools.length > 0 && (
              <div className={styles.toolsList}>
                <p className={styles.toolsLabel}>Tools:</p>
                <div className={styles.toolsGrid}>
                  {leadCase.tools.map((tool) => (
                    <button key={tool} type="button" className={styles.toolButton} onClick={() => toggleToolFilter(tool)}>
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.cardActions}>
              <a href={normalizeHref(leadCase.href)} target="_blank" rel="noopener noreferrer" className={styles.viewAction}>
                View PDF
              </a>
              <a href={normalizeHref(leadCase.href)} download className={styles.downloadAction}>
                Download
              </a>
              <button
                type="button"
                onClick={() => openGallery(leadCase.title, screenshotsById[leadCase.id] ?? EMPTY_SCREENSHOTS, 0)}
                className={`${styles.galleryOpenAction} ${styles.viewAction}`}
              >
                View All Screenshots
              </button>
            </div>
          </div>

          {leadCaseSpotlightImage && (
            <a
              href={leadCaseSpotlightImage}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.caseSpotlightMedia}
              aria-label={`Open spotlight screenshot for ${leadCase.title}`}
            >
              <Image
                src={leadCaseSpotlightImage}
                alt={`${leadCase.title} spotlight screenshot`}
                fill
                sizes="(max-width: 991px) 100vw, 38vw"
                loading="lazy"
                quality={10}
              />
            </a>
          )}
        </MotionInView>
      )}

      {relatedCases.length > 0 && (
        <MotionInView className={styles.relatedCasesStrip} aria-label="Related cases">
          <div className={styles.blockHeading}>
            <h2>Related Cases</h2>
            <p>Cases with a similar category, difficulty, or keyword set.</p>
          </div>
          <div className={styles.relatedCasesGrid}>
            {relatedCases.map((item) => (
              <article key={item.id} className={styles.relatedCaseCard}>
                <p className={styles.relatedCaseLabel}>{item.category ?? item.type}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className={styles.caseMetadata}>
                  {item.difficulty && (
                    <span className={`${styles.badge} ${styles[`difficulty-${item.difficulty.toLowerCase()}`]}`}>
                      {item.difficulty}
                    </span>
                  )}
                  {item.readTime && <span className={styles.badge}>{item.readTime} min read</span>}
                </div>
                <a href={normalizeHref(item.href)} target="_blank" rel="noopener noreferrer">Open PDF</a>
              </article>
            ))}
          </div>
        </MotionInView>
      )}

      <div className={styles.pdfGrid}>
        {visiblePdfCards.slice(0, visibleCount).map((item) => (
          <BlogCard
            key={item.id}
            {...item}
            screenshots={screenshotsById[item.id] ?? EMPTY_SCREENSHOTS}
            onOpenGallery={openGallery}
            onTagClick={setRawQuery}
            onToolClick={toggleToolFilter}
            getThumbnail={(value) => value.replace(/(\.webp|\.png|\.jpg|\.jpeg)$/i, "-thumb$1")}
            normalizeHref={normalizeHref}
          />
        ))}
      </div>

      {visibleCount < visiblePdfCards.length && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => setVisibleCount((n) => Math.min(visiblePdfCards.length, n + PAGE_SIZE))}
              aria-label="Show more PDF results"
          >
              Show more
          </button>
        </div>
      )}

      {filteredCount === 0 && (
        <p className={styles.emptyState}>No PDF results match your current search/filter.</p>
      )}
    </section>
  );
}
