"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import MotionInView from "@/app/core/components/MotionInView";
import BlogCard from "../BlogCard";
import styles from "../page.module.css";
import type { PdfResource } from "../blog-types";
import { EMPTY_SCREENSHOTS } from "@/app/core/data/cases";
import { getThumbnail } from "../blog-utils";

const PAGE_SIZE = 4;

// 1. تنظيف الـ Props ومسح كل ما يخص الفلاتر
type BlogPdfLibrarySectionProps = {
  visiblePdfCards: PdfResource[];
  screenshotsById: Record<string, string[]>;
  openGallery: (title: string, screenshots: string[], index?: number) => void;
  normalizeHref: (href: string) => string;
  leadCase: PdfResource | null;
  leadCaseSpotlightImage: string | null;
};

export default function BlogPdfLibrarySection({
  leadCase, 
  leadCaseSpotlightImage,
  visiblePdfCards, 
  screenshotsById, 
  openGallery, 
  normalizeHref,
}: BlogPdfLibrarySectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [visiblePdfCards.length]);

  return (
    <section className={styles.block}>
      <MotionInView className={styles.blockHeading}>
        <h2 id="blog-pdfs-title">PDF Library</h2>
        {/* 2. استبدال filteredCount بـ visiblePdfCards.length */}
        <p>{visiblePdfCards.length} result(s) found.</p>
      </MotionInView>

      {/* تم مسح الـ <MotionInView className={styles.toolbar}> بالكامل من هنا */}

      {leadCase && (
        <MotionInView className={styles.caseSpotlight}>
          <div className={styles.caseSpotlightBody}>
            <p className={styles.caseSpotlightTag}>Case Spotlight</p>
            <h3>{leadCase.title}</h3>
            <p>{leadCase.description || "Featured first for quick navigation."}</p>
            
            <div className={styles.caseMetadata}>
              {leadCase.difficulty && <span className={`${styles.badge} ${styles[`difficulty-${leadCase.difficulty.toLowerCase()}`]}`}>{leadCase.difficulty}</span>}
              {leadCase.category && <span className={styles.badge}>{leadCase.category}</span>}
              {leadCase.readTime && <span className={styles.badge}>{leadCase.readTime} min read</span>}
            </div>

            {leadCase.tags && leadCase.tags.length > 0 && (
              <div className={styles.tagsListInline}>
                {leadCase.tags.slice(0, 4).map((tag) => (
                  // تم إزالة onClick للـ tag
                  <button key={tag} type="button" className={styles.tagButtonSmall}>#{tag}</button>
                ))}
              </div>
            )}

            {leadCase.tools && leadCase.tools.length > 0 && (
              <div className={styles.toolsListCompact}>
                {leadCase.tools.map((tool) => (
                  // تم إزالة onClick للـ tool
                  <button key={tool} type="button" className={styles.toolButtonSmall}>{tool}</button>
                ))}
              </div>
            )}

            <div className={styles.cardActions}>
              <a href={normalizeHref(leadCase.href)} target="_blank" className={styles.viewAction}>View PDF</a>
              <a href={normalizeHref(leadCase.href)} download className={styles.downloadAction}>Download</a>
              <button type="button" onClick={() => openGallery(leadCase.title, screenshotsById[leadCase.id] ?? EMPTY_SCREENSHOTS, 0)} className={`${styles.galleryOpenAction} ${styles.viewAction}`}>
                View All Screenshots
              </button>
            </div>
          </div>
          {leadCaseSpotlightImage && (
            <a href={leadCaseSpotlightImage} target="_blank" className={styles.caseSpotlightMedia}>
              <Image src={leadCaseSpotlightImage} alt="spotlight" fill sizes="(max-width: 991px) 100vw, 38vw" loading="lazy" decoding="async" quality={25} />
            </a>
          )}
        </MotionInView>
      )}

      <div className={styles.pdfGrid}>
        {visiblePdfCards.slice(0, visibleCount).map((item) => (
          <BlogCard
            key={item.id}
            {...item}
            screenshots={screenshotsById[item.id] ?? EMPTY_SCREENSHOTS}
            onOpenGallery={openGallery}
            // تم مسح onTagClick و onToolClick عشان شيلنا الفلاتر
            getThumbnail={getThumbnail}
            normalizeHref={normalizeHref}
          />
        ))}
      </div>

      {visibleCount < visiblePdfCards.length && (
        <div className={styles.loadMoreWrap}>
          <button type="button" className={styles.primaryAction} onClick={() => setVisibleCount((n) => Math.min(visiblePdfCards.length, n + PAGE_SIZE))}>
            Show more
          </button>
        </div>
      )}

      {/* تم تبسيط الـ Empty state */}
      {visiblePdfCards.length === 0 && <p className={styles.emptyState}>No PDF results found.</p>}
    </section>
  );
}