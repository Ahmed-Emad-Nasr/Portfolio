"use client";

import React from "react";
import Image from "next/image";
import styles from "./page.module.css";

// Placeholder shown when both thumbnail and full-size image fail to load
const IMG_FALLBACK = "/Assets/art-gallery/logo/logo.png";

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
  onPrefetchGallery?: (title: string, screenshots: string[], index?: number) => void;
  onTagClick?: (tag: string) => void;
  onToolClick?: (tool: string) => void;
  getThumbnail: (imgPath: string) => string;
  normalizeHref: (href: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(
  ({
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
    date,
    screenshots,
    onOpenGallery,
    onPrefetchGallery,
    onTagClick,
    onToolClick,
    getThumbnail,
    normalizeHref,
  }) => {
    const hasScreenshots = screenshots.length > 0;
    const primaryScreenshot = screenshots[0];
    const secondaryScreenshot = screenshots[1];
    const cardRef = React.useRef<HTMLElement | null>(null);
    const [shouldRenderMedia, setShouldRenderMedia] = React.useState(false);

    // Track load state for each image independently:
    // null  → no image / not yet attempted
    // string → current src to try
    // Three-tier fallback: thumbnail → full-size original → placeholder
    const [primarySrc, setPrimarySrc] = React.useState<string | null>(
      primaryScreenshot ? normalizeHref(getThumbnail(primaryScreenshot)) : null
    );
    const [secondarySrc, setSecondarySrc] = React.useState<string | null>(
      secondaryScreenshot ? normalizeHref(getThumbnail(secondaryScreenshot)) : null
    );

    const extraCount = Math.max(0, screenshots.length - 2);
    const difficultyKey = difficulty?.toLowerCase() as "easy" | "medium" | "hard" | undefined;

    const handleTagClick = React.useCallback((tag: string) => onTagClick?.(tag), [onTagClick]);
    const handleToolClick = React.useCallback((tool: string) => onToolClick?.(tool), [onToolClick]);

    // Three-tier fallback: thumbnail → original → placeholder
    const handlePrimaryError = React.useCallback(() => {
      setPrimarySrc((cur) => {
        if (!cur) return IMG_FALLBACK;
        const original = primaryScreenshot ? normalizeHref(primaryScreenshot) : null;
        if (original && cur !== original) return original;
        return IMG_FALLBACK;
      });
    }, [primaryScreenshot, normalizeHref]);

    const handleSecondaryError = React.useCallback(() => {
      setSecondarySrc((cur) => {
        if (!cur) return IMG_FALLBACK;
        const original = secondaryScreenshot ? normalizeHref(secondaryScreenshot) : null;
        if (original && cur !== original) return original;
        return IMG_FALLBACK;
      });
    }, [secondaryScreenshot, normalizeHref]);

    React.useEffect(() => {
      if (!hasScreenshots) return;
      const node = cardRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          setShouldRenderMedia(true);
          observer.disconnect();
        },
        { rootMargin: "240px 0px" }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [hasScreenshots]);

    return (
      <article
        ref={cardRef}
        className={[
          styles.pdfCard,
          hasScreenshots ? styles.caseCardLarge : styles.caseCardTextOnly,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.pdfCardBody}>
          <div className={styles.caseCardHead}>
            <p className={styles.badge}>{type}</p>
            {hasScreenshots && (
              <span className={styles.shotCount}>{screenshots.length} screenshots</span>
            )}
          </div>

          <h3 className={styles.cardTitle}>
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
            {/* Bug fix: date was declared in the interface but never rendered */}
            {date && <span className={styles.badge}>{date}</span>}
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
                  {tag}
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

          <div className={styles.cardActions}>
            <a
              href={normalizeHref(href)}
              target="_blank"
              rel="noopener noreferrer"
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
                onClick={() => onOpenGallery(title, screenshots, 0)}
                onMouseEnter={() => onPrefetchGallery?.(title, screenshots, 0)}
                onFocus={() => onPrefetchGallery?.(title, screenshots, 0)}
                className={`${styles.galleryOpenAction} ${styles.viewAction}`}
              >
                View All Screenshots
              </button>
            )}
          </div>
        </div>

        {primaryScreenshot && (
          <div className={styles.pdfCardMedia}>
            <a
              href={normalizeHref(primaryScreenshot)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryShot}
              aria-label={`Open main screenshot for ${title}`}
            >
              {shouldRenderMedia && primarySrc && (
                <Image
                  src={primarySrc}
                  alt={`${title} main screenshot`}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 991px) 70vw, 40vw"
                  loading="lazy"
                  quality={30}
                  onError={handlePrimaryError}
                />
              )}
            </a>

            {secondaryScreenshot && (
              <div className={styles.shotGrid}>
                <a
                  href={normalizeHref(secondaryScreenshot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shotThumb}
                  aria-label={`Open screenshot 2 for ${title}`}
                >
                  {shouldRenderMedia && secondarySrc && (
                    <Image
                      src={secondarySrc}
                      alt={`${title} screenshot 2`}
                      fill
                      sizes="(max-width: 560px) 45vw, 18vw"
                      loading="lazy"
                      quality={30}
                      onError={handleSecondaryError}
                    />
                  )}
                </a>
                {extraCount > 0 && (
                  <span className={styles.moreShotsBadge}>+{extraCount}</span>
                )}
              </div>
            )}
          </div>
        )}
      </article>
    );
  }
);

BlogCard.displayName = "BlogCard";

export default BlogCard;