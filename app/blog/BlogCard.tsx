"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface BlogCardProps {
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  href: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
  screenshots: string[];
  onOpenGallery: (title: string, screenshots: string[], index?: number) => void;
  getThumbnail: (imgPath: string) => string;
  normalizeHref: (href: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(({
  title, description, platform, type, category, difficulty, href, tags, tools, skillsGained,
  readTime, date, screenshots, onOpenGallery, getThumbnail, normalizeHref
}) => {
  const hasScreenshots = screenshots.length > 0;
  const primaryScreenshot = hasScreenshots ? screenshots[0] : null;
  const secondaryScreenshot = screenshots.length > 1 ? screenshots[1] : null;
  const extraCount = Math.max(0, screenshots.length - 2);

  // Fallback State خفيف جداً
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const isLongDescription = (description?.length ?? 0) > 140;

  return (
    <article className={[styles.pdfCard, hasScreenshots ? styles.caseCardLarge : styles.caseCardTextOnly].filter(Boolean).join(" ")}>
      <div className={styles.pdfCardBody}>
        <div className={styles.caseCardHead}>
          <p className={styles.badge}>{type}</p>
          {hasScreenshots && <span className={styles.shotCount}>{screenshots.length} screenshots</span>}
        </div>

        <h3 className={styles.cardTitle}>{title}</h3>

        {description && (
          <>
            <p className={descExpanded ? styles.cardDescriptionExpanded : styles.cardDescription}>{description}</p>
            {isLongDescription && (
              <button
                type="button"
                className={styles.descToggle}
                onClick={() => setDescExpanded((v) => !v)}
                aria-expanded={descExpanded}
              >
                {descExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </>
        )}
        <p className={styles.cardPlatform}>{platform}</p>

        <div className={styles.caseMetadata}>
          {difficulty && <span className={`${styles.badge} ${styles[`difficulty-${difficulty.toLowerCase()}`]}`}>{difficulty}</span>}
          {category && <span className={styles.badge}>{category}</span>}
          {readTime && <span className={styles.badge}>{readTime} min</span>}
          {date && <span className={styles.badge}>{date}</span>}
        </div>

        {tags && tags.length > 0 && (
          <div className={styles.tagsListInline}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tagButtonSmall}>{tag}</span>
            ))}
            {tags.length > 3 && <span className={styles.moreTagsBadge}>+{tags.length - 3}</span>}
          </div>
        )}

        {tools && tools.length > 0 && (
          <div className={styles.toolsListCompact}>
            {tools.slice(0, 2).map((tool) => (
              <span key={tool} className={styles.toolButtonSmall}>{tool}</span>
            ))}
            {tools.length > 2 && <span className={styles.moreToolsBadge}>+{tools.length - 2}</span>}
          </div>
        )}

        {skillsGained && skillsGained.length > 0 && (
          <div className={styles.skillsListCompact}>
            {skillsGained.slice(0, 3).map((skill) => (
              <span key={skill} className={styles.skillButtonSmall}>{skill}</span>
            ))}
            {skillsGained.length > 3 && <span className={styles.moreSkillsBadge}>+{skillsGained.length - 3}</span>}
          </div>
        )}

        <div className={styles.cardActions}>
          <a href={normalizeHref(href)} target="_blank" className={styles.viewAction}>View PDF</a>
          <a href={normalizeHref(href)} download className={styles.downloadAction}>Download</a>
          {hasScreenshots && (
            <button type="button" onClick={() => onOpenGallery(title, screenshots, 0)} className={`${styles.galleryOpenAction} ${styles.viewAction}`}>
              View All Screenshots
            </button>
          )}
        </div>
      </div>

      {primaryScreenshot && (
        <div className={styles.pdfCardMedia}>
          <a href={normalizeHref(primaryScreenshot)} target="_blank" className={styles.primaryShot}>
            <Image 
              src={normalizeHref(primaryFailed ? primaryScreenshot : getThumbnail(primaryScreenshot))} 
              alt={`${title} — main screenshot`} 
              fill 
              sizes="(max-width: 991px) 70vw, 40vw" 
              loading="lazy"
              decoding="async" 
              quality={20} 
              onError={() => setPrimaryFailed(true)} 
            />
          </a>
          {secondaryScreenshot && (
            <div className={styles.shotGrid}>
              <a href={normalizeHref(secondaryScreenshot)} target="_blank" className={styles.shotThumb}>
                <Image 
                  src={normalizeHref(secondaryFailed ? secondaryScreenshot : getThumbnail(secondaryScreenshot))} 
                  alt={`${title} — additional screenshot`} 
                  fill 
                  sizes="18vw" 
                  decoding="async"
                  loading="lazy" 
                  quality={25} 
                  onError={() => setSecondaryFailed(true)} 
                />
              </a>
              {extraCount > 0 && <span className={styles.moreShotsBadge}>+{extraCount}</span>}
            </div>
          )}
        </div>
      )}
    </article>
  );
});

BlogCard.displayName = "BlogCard";
export default BlogCard;