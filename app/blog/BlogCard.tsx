"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TRAILING_SLASH } from "@/app/core/config/site";
import Image from "next/image";
import styles from "./page.module.css";
import anchorStyles from "./BlogCard.module.css";

interface BlogCardProps {
  /* NEW: كان بيتبعت أصلاً جوه {...item} بس مكانش معرّف، فكان بيضيع.
     دلوقتي هو أساس الـ deep link (#case-<id>). */
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  /** مسار الـ PDF — اختياري: الزراير بتختفي لما يكون مش موجود */
  href?: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
  /* لو مش متبعت، الكارت بيفترض /blog/{id}. الكروت اللي مش cases (زي كارت
     الـ CV) لازم تبعته صراحةً، وإلا اللينك بيودّي على صفحة متولّدتش. */
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

  // Fallback State خفيف جداً
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLongDescription = (description?.length ?? 0) > 140;

  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copyLink = useCallback(async () => {
    // اللينك بيروح لصفحة الـ case المستقلة مش للأنكور: دي اللي ليها عنوان
    // ووصف وصورة خاصين بيها، فبتبان صح لما تتبعت في أي حتة.
    const path = normalizeHref(detailPath);
    const url = `${window.location.origin}${TRAILING_SLASH ? `${path}/` : path}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API محتاج secure context — الـ fallback ده بيشتغل في أي مكان
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
          {/* FIX: لو جه difficulty مش من التلاتة اللي ليهم كلاس، الـ lookup كان
              بيرجّع undefined والكلاس بيتكتب حرفياً "badge undefined" في الـ HTML */}
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
          <Link href={detailPath} className={styles.primaryAction}>Open case</Link>
          {/* مش كل case ليه PDF — ستة منهم أدلتهم صور بس. قبل كده الزراير
              كانت بتتعرض دايماً وبتودّي على 404. */}
          {href && (
            <>
              <a href={normalizeHref(href)} target="_blank" rel="noopener noreferrer" className={styles.viewAction}>View PDF</a>
              <a href={normalizeHref(href)} download className={styles.downloadAction}>Download</a>
            </>
          )}
          {hasScreenshots && (
            <button type="button" onClick={() => onOpenGallery(title, screenshots, 0)} className={`${styles.galleryOpenAction} ${styles.viewAction}`}>
              View All Screenshots
            </button>
          )}
          {/* NEW: لينك مباشر للكارت ده لوحده — مفيد وإنت بتبعت case معيّنة
              في إنترفيو بدل "انزل تحت شوية" */}
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
              sizes="(max-width: 991px) 70vw, 40vw" 
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
