"use client";

import React from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface BlogCardProps {
  id: string;
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
  onOpenGallery: () => void;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
  getThumbnail: (imgPath: string) => string;
  normalizeHref: (href: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(
  ({
    id,
    title,
    description,
    platform,
    type,
    category,
    difficulty,
    href,
    tags,
    tools,
    readTime,
    screenshots,
    onOpenGallery,
    onTagClick,
    onToolClick,
    getThumbnail,
    normalizeHref,
  }) => {
    const hasScreenshots = screenshots.length > 0;
    const primaryScreenshot = screenshots[0];
    const secondaryScreenshot = screenshots[1];
    const extraCount = Math.max(0, screenshots.length - 2);
    const difficultyKey = difficulty?.toLowerCase() as "easy" | "medium" | "hard" | undefined;

    const handleTagClick = React.useCallback((tag: string) => onTagClick?.(tag), [onTagClick]);
    const handleToolClick = React.useCallback((tool: string) => onToolClick?.(tool), [onToolClick]);

    return (
      <article
        className={[
          styles.pdfCard,
          hasScreenshots ? styles.caseCardLarge : "",
          /* تم إزالة styles.fadeInUp لتحسين الأداء */
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.caseCardHead}>
          <p className={styles.badge}>{type}</p>
          {hasScreenshots && (
            <span className={styles.shotCount}>{screenshots.length} screenshots</span>
          )}
        </div>

        <h3 className={styles.cardTitle} tabIndex={0} aria-label={title}>
          {title}
          {description && (
            <span className={styles.cardTooltip}>{description}</span>
          )}
        </h3>

        {description && (
          <p className={styles.cardDescription}>{description}</p>
        )}

        <p className={styles.cardPlatform}>{platform}</p>

        <div className={styles.caseMetadata}>
          {difficultyKey && (
            <span
              className={`${styles.badge} ${styles[`difficulty-${difficultyKey}`]}`}
            >
              {difficulty}
            </span>
          )}
          {category && <span className={styles.badge}>{category}</span>}
          {readTime && <span className={styles.badge}>{readTime} min</span>}
        </div>

        {tags && tags.length > 0 && (
          <div className={styles.tagsListInline}>
            {tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                className={styles.tagButtonSmall}
                onClick={() => handleTagClick(tag)}
                title={`Search for ${tag}`}
              >
                #{tag}
              </button>
            ))}
            {tags.length > 3 && (
              <span className={styles.moreTagsBadge}>+{tags.length - 3}</span>
            )}
          </div>
        )}

        {tools && tools.length > 0 && (
          <div className={styles.toolsListCompact}>
            {tools.slice(0, 2).map((tool) => (
              <button
                key={tool}
                type="button"
                className={styles.toolButtonSmall}
                onClick={() => handleToolClick(tool)}
                title={`Filter by ${tool}`}
              >
                {tool}
              </button>
            ))}
            {tools.length > 2 && (
              <span className={styles.moreToolsBadge}>+{tools.length - 2}</span>
            )}
          </div>
        )}

        {primaryScreenshot && (
          <div className={styles.screenshotArea}>
            <a
              href={normalizeHref(primaryScreenshot)}
              target="_blank"
              rel="noreferrer"
              className={styles.primaryShot}
              aria-label={`Open main screenshot for ${title}`}
            >
              <Image
                src={normalizeHref(getThumbnail(primaryScreenshot))}
                alt={`${title} main screenshot`}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 991px) 70vw, 40vw"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = normalizeHref(primaryScreenshot);
                }}
              />
            </a>

            {secondaryScreenshot && (
              <div className={styles.shotGrid}>
                <a
                  href={normalizeHref(secondaryScreenshot)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.shotThumb}
                  aria-label={`Open screenshot 2 for ${title}`}
                >
                  <Image
                    src={normalizeHref(getThumbnail(secondaryScreenshot))}
                    alt={`${title} screenshot 2`}
                    fill
                    sizes="(max-width: 560px) 45vw, 18vw"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = normalizeHref(secondaryScreenshot);
                    }}
                  />
                </a>
                {extraCount > 0 && (
                  <span className={styles.moreShotsBadge}>+{extraCount}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.cardActions}>
          <a
            href={normalizeHref(href)}
            target="_blank"
            rel="noreferrer"
            className={styles.viewAction}
          >
            View PDF
          </a>
          <a
            href={normalizeHref(href)}
            download
            className={styles.downloadAction}
          >
            Download
          </a>
          {hasScreenshots && (
            <button
              type="button"
              onClick={onOpenGallery}
              className={`${styles.galleryOpenAction} ${styles.viewAction}`}
            >
              View All Screenshots
            </button>
          )}
        </div>
      </article>
    );
  }
);

BlogCard.displayName = "BlogCard";

export default BlogCard;