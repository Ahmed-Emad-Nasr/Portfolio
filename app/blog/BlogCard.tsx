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
  readTime?: number;
  date?: string;
  screenshots: string[];
  onOpenGallery: (title: string, screenshots: string[], index?: number) => void;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
  getThumbnail: (imgPath: string) => string;
  normalizeHref: (href: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(({
  title, description, platform, type, category, difficulty, href, tags, tools,
  readTime, date, screenshots, onOpenGallery, onTagClick, onToolClick, getThumbnail, normalizeHref
}) => {
  const hasScreenshots = screenshots.length > 0;
  const primaryScreenshot = hasScreenshots ? screenshots[0] : null;
  const secondaryScreenshot = screenshots.length > 1 ? screenshots[1] : null;
  const extraCount = Math.max(0, screenshots.length - 2);

  // Fallback State خفيف جداً: لو ملف الـ thumb مش موجود، هنعرض الصورة الأصلية
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);

  return (
    <article className={[styles.pdfCard, hasScreenshots ? styles.caseCardLarge : styles.caseCardTextOnly].filter(Boolean).join(" ")}>
      <div className={styles.pdfCardBody}>
        <div className={styles.caseCardHead}>
          <p className={styles.badge}>{type}</p>
          {hasScreenshots && <span className={styles.shotCount}>{screenshots.length} screenshots</span>}
        </div>

        <h3 className={styles.cardTitle}>
          {title}
          {description && <span className={styles.cardTooltip}>{description}</span>}
        </h3>

        {description && <p className={styles.cardDescription}>{description}</p>}
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
              <button key={tag} type="button" className={styles.tagButtonSmall} onClick={() => onTagClick?.(tag)}>{tag}</button>
            ))}
            {tags.length > 3 && <span className={styles.moreTagsBadge}>+{tags.length - 3}</span>}
          </div>
        )}

        {tools && tools.length > 0 && (
          <div className={styles.toolsListCompact}>
            {tools.slice(0, 2).map((tool) => (
              <button key={tool} type="button" className={styles.toolButtonSmall} onClick={() => onToolClick?.(tool)}>{tool}</button>
            ))}
            {tools.length > 2 && <span className={styles.moreToolsBadge}>+{tools.length - 2}</span>}
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
              alt="main" 
              fill 
              sizes="(max-width: 991px) 70vw, 40vw" 
              loading="lazy" 
              quality={70} 
              onError={() => setPrimaryFailed(true)} // ← سطر الإنقاذ
            />
          </a>
          {secondaryScreenshot && (
            <div className={styles.shotGrid}>
              <a href={normalizeHref(secondaryScreenshot)} target="_blank" className={styles.shotThumb}>
                <Image 
                  src={normalizeHref(secondaryFailed ? secondaryScreenshot : getThumbnail(secondaryScreenshot))} 
                  alt="thumb" 
                  fill 
                  sizes="18vw" 
                  loading="lazy" 
                  quality={50} 
                  onError={() => setSecondaryFailed(true)} // ← سطر الإنقاذ
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