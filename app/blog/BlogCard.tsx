"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TRAILING_SLASH } from "@/app/core/config/site";
import Image from "next/image";
import styles from "./page.module.css";
import anchorStyles from "./BlogCard.module.css";

interface BlogCardProps {
  /* NEW: it was already being passed inside {...item} but wasn't declared, so it was lost.
     Now it's the basis of the deep link (#case-<id>). */
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  /** PDF path — optional: the buttons are hidden when it's absent */
  href?: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
  /* If not passed, the card assumes /blog/{id}. Cards that aren't cases (like the
     CV card) must pass it explicitly, or the link leads to a page that was never generated. */
  detailHref?: string;
  screenshots: string[];
  onOpenGallery: (title: string, screenshots: string[], index?: number) => void;
  getThumbnail: (imgPath: string) => string;
  normalizeHref: (href: string) => string;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(({
  id, title, description, platform, type, category, difficulty, href, tags, tools, skillsGained,
  readTime, date, detailHref, screenshots, onOpenGallery, getThumbnail, normalizeHref
}) => {
  const detailPath = detailHref ?? `/blog/${id}`;
  const hasScreenshots = screenshots.length > 0;
  const primaryScreenshot = hasScreenshots ? screenshots[0] : null;
  const secondaryScreenshot = screenshots.length > 1 ? screenshots[1] : null;
  const extraCount = Math.max(0, screenshots.length - 2);

  // Very lightweight fallback state
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLongDescription = (description?.length ?? 0) > 140;

  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copyLink = useCallback(async () => {
    // The link goes to the standalone case page, not the anchor: that's the one with its own title,
    // description and image, so it displays correctly when shared anywhere.
    const path = normalizeHref(detailPath);
    const url = `${window.location.origin}${TRAILING_SLASH ? `${path}/` : path}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // The clipboard API needs a secure context — this fallback works anywhere
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
  }, [detailPath, normalizeHref]);

  return (
    <article
      id={`case-${id}`}
      className={[
        styles.pdfCard,
        anchorStyles.anchor,
        hasScreenshots ? styles.caseCardLarge : styles.caseCardTextOnly,
      ].filter(Boolean).join(" ")}
      data-fx="card"
    >
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
          {/* FIX: if a difficulty came in that isn't one of the three with a class, the lookup
              returned undefined and the class was literally written as "badge undefined" in the HTML */}
          {difficulty && (
            <span className={[styles.badge, styles[`difficulty-${difficulty.toLowerCase()}`]].filter(Boolean).join(" ")}>
              {difficulty}
            </span>
          )}
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
          <Link href={detailPath} data-fx="btn" data-btn="ghost">Open case</Link>
          {/* Not every case has a PDF — six of them have image-only evidence. Previously the buttons
              were always shown and led to a 404. */}
          {href && (
            <>
              <a href={normalizeHref(href)} target="_blank" rel="noopener noreferrer" data-fx="btn" data-btn="ghost" data-tone="accent">View PDF</a>
              <a href={normalizeHref(href)} download data-fx="btn" data-btn="ghost" data-tone="main">Download</a>
            </>
          )}
          {hasScreenshots && (
            <button type="button" onClick={() => onOpenGallery(title, screenshots, 0)} data-fx="btn" data-btn="ghost" data-tone="accent" data-btn-edge="dashed">
              View All Screenshots
            </button>
          )}
          {/* NEW: a direct link to this card alone — useful when sending a specific case
              in an interview instead of "scroll down a bit" */}
          <button
            type="button"
            onClick={copyLink}
            className={copied ? `${anchorStyles.copyAction} ${anchorStyles.copied}` : anchorStyles.copyAction}
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>

      {primaryScreenshot && (
        <div className={styles.pdfCardMedia}>
          <a href={normalizeHref(primaryScreenshot)} target="_blank" rel="noopener noreferrer" className={styles.primaryShot}>
            <Image 
              src={normalizeHref(primaryFailed ? primaryScreenshot : getThumbnail(primaryScreenshot))} 
              alt={`${title} — main screenshot`} 
              fill 
              sizes="(max-width: 992px) 70vw, 40vw" 
              loading="lazy"
              decoding="async" 
              onError={() => setPrimaryFailed(true)} 
            />
          </a>
          {secondaryScreenshot && (
            <div className={styles.shotGrid}>
              <a href={normalizeHref(secondaryScreenshot)} target="_blank" rel="noopener noreferrer" className={styles.shotThumb}>
                <Image 
                  src={normalizeHref(secondaryFailed ? secondaryScreenshot : getThumbnail(secondaryScreenshot))} 
                  alt={`${title} — additional screenshot`} 
                  fill 
                  sizes="18vw" 
                  decoding="async"
                  loading="lazy" 
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
