"use client";

/*
 * blog/[slug]/CaseArticle.tsx
 * Author: Ahmed Emad Nasr
 *
 * جسم صفحة الـ case. client component لأنه محتاج معرض الصور والنسخ، بس
 * كل النص بيتعمله prerender عادي في الـ HTML — يعني جوجل والـ OG crawlers
 * بيشوفوا المحتوى كامل من غير JS.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { normalizePublicHref, getThumbnail, formatDate } from "../blog-utils";
import type { GalleryState } from "../blog-types";
import blogStyles from "../page.module.css";
import styles from "./case.module.css";

const BlogGalleryModal = dynamic(() => import("../components/BlogGalleryModal"), { ssr: false });

type CaseItem = {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  category: string;
  difficulty: string;
  href: string;
  tags: readonly string[];
  tools: readonly string[];
  skillsGained: readonly string[];
  readTime: number;
  date: string;
};

type Sibling = { id: string; title: string } | null;

/* بتتحسب في page.tsx (Server Component) وبتوصل جاهزة — الكومبوننت ده
   client، فأي import لـ attack.ts أو cases.ts هنا كان هيتحزم في المتصفح. */
type Technique = { id: string; name: string; tactic: string };
type Related = {
  id: string;
  title: string;
  category: string;
  readTime: number;
  sharedTechniques: number;
};

export default function CaseArticle({
  item,
  screenshots,
  previous,
  next,
  techniques = [],
  related = [],
}: {
  item: CaseItem;
  screenshots: string[];
  previous: Sibling;
  next: Sibling;
  techniques?: readonly Technique[];
  related?: readonly Related[];
}) {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const goGallery = useCallback((delta: number) => {
    setGallery((cur) =>
      cur
        ? { ...cur, index: (cur.index + delta + cur.screenshots.length) % cur.screenshots.length }
        : null,
    );
  }, []);

  const openGallery = useCallback(
    (index: number) => {
      if (screenshots.length) setGallery({ title: item.title, screenshots, index });
    },
    [item.title, screenshots],
  );

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
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
  }, []);

  const difficultyClass = blogStyles[`difficulty-${item.difficulty.toLowerCase()}`];

  return (
    <main id="main-content" className={styles.page}>
      {/* شريط تنقّل خاص بالصفحة دي: هيدر البلوج العادي بيـscroll لأقسام
          مش موجودة هنا، فبيبقى أزرار ميتة. */}
      <nav className={styles.bar} aria-label="Breadcrumb">
        <Link href="/blog" className={styles.backLink}>
          ← All cases
        </Link>
        <span className={styles.barSep} aria-hidden="true">
          /
        </span>
        <span className={styles.barCurrent}>{item.category}</span>
      </nav>

      <article id="case-body" className={styles.article}>
        <header className={styles.head}>
          <p className={styles.kicker}>{item.type}</p>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.platform}>{item.platform}</p>

          <div className={blogStyles.caseMetadata}>
            <span className={`${blogStyles.badge} ${difficultyClass ?? ""}`}>{item.difficulty}</span>
            <span className={blogStyles.badge}>{item.category}</span>
            <span className={blogStyles.badge}>{item.readTime} min read</span>
            <span className={blogStyles.badge}>{formatDate(item.date)}</span>
          </div>
        </header>

        <p className={styles.summary}>{item.description}</p>

        <div className={blogStyles.cardActions}>
          <a
            href={normalizePublicHref(item.href)}
            target="_blank"
            rel="noopener noreferrer"
            className={blogStyles.viewAction}
          >
            View PDF
          </a>
          <a href={normalizePublicHref(item.href)} download className={blogStyles.downloadAction}>
            Download
          </a>
          {screenshots.length > 0 && (
            <button
              type="button"
              onClick={() => openGallery(0)}
              className={`${blogStyles.galleryOpenAction} ${blogStyles.viewAction}`}
            >
              View All Screenshots
            </button>
          )}
          <button type="button" onClick={copyLink} className={copied ? `${styles.copyAction} ${styles.copied}` : styles.copyAction}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>

        <section className={styles.facts} aria-label="Case details">
          <div className={styles.factBlock}>
            <h2 className={styles.factTitle}>Tools</h2>
            <div className={blogStyles.toolsListCompact}>
              {item.tools.map((tool) => (
                <span key={tool} className={blogStyles.toolButtonSmall}>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.factBlock}>
            <h2 className={styles.factTitle}>Skills demonstrated</h2>
            <div className={blogStyles.skillsListCompact}>
              {item.skillsGained.map((skill) => (
                <span key={skill} className={blogStyles.skillButtonSmall}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.factBlock}>
            <h2 className={styles.factTitle}>Tags</h2>
            <div className={blogStyles.tagsListInline}>
              {item.tags.map((tag) => (
                // اللينك بيرجّعك للمكتبة وهي مفلترة على الأداة/التاج ده
                <Link key={tag} href={`/blog?q=${encodeURIComponent(tag)}`} className={blogStyles.tagButtonSmall}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {screenshots.length > 0 && (
          <section className={styles.shots} aria-label="Screenshots">
            <h2 className={styles.factTitle}>
              Evidence — {screenshots.length} screenshot(s)
            </h2>
            <div className={styles.shotGrid}>
              {screenshots.map((shot, i) => (
                <button
                  key={shot}
                  type="button"
                  className={styles.shot}
                  onClick={() => openGallery(i)}
                  aria-label={`Open screenshot ${i + 1} of ${screenshots.length}`}
                >
                  <Image
                    src={normalizePublicHref(getThumbnail(shot))}
                    alt={`${item.title} — screenshot ${i + 1}`}
                    fill
                    sizes="(max-width: 991px) 45vw, 24vw"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {techniques.length > 0 && (
          <section className={styles.attack} aria-labelledby="case-attack-title">
            <h2 className={styles.factTitle} id="case-attack-title">
              MITRE ATT&amp;CK — {techniques.length} technique(s)
            </h2>
            <ul className={styles.attackList}>
              {techniques.map((technique) => (
                <li key={technique.id} className={styles.attackChip}>
                  <span className={styles.attackId}>{technique.id}</span>
                  <span className={styles.attackName}>{technique.name}</span>
                </li>
              ))}
            </ul>
            <p className={styles.attackNote}>
              <Link href="/#Coverage">See the full coverage map →</Link>
            </p>
          </section>
        )}

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="case-related-title">
            <h2 className={styles.factTitle} id="case-related-title">
              Related reports
            </h2>
            <ul className={styles.relatedList}>
              {related.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/blog/${entry.id}`} className={styles.relatedCard}>
                    <span className={styles.relatedTitle}>{entry.title}</span>
                    <span className={styles.relatedMeta}>
                      {entry.category} · {entry.readTime} min
                      {entry.sharedTechniques > 0 &&
                        ` · ${entry.sharedTechniques} shared technique(s)`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className={styles.siblings} aria-label="Other cases">
          {previous ? (
            <Link href={`/blog/${previous.id}`} className={styles.sibling}>
              <span className={styles.siblingLabel}>← Previous</span>
              <span className={styles.siblingTitle}>{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/blog/${next.id}`} className={`${styles.sibling} ${styles.siblingNext}`}>
              <span className={styles.siblingLabel}>Next →</span>
              <span className={styles.siblingTitle}>{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      {gallery && (
        <BlogGalleryModal
          gallery={gallery}
          currentShot={
            gallery.screenshots[gallery.index]
              ? normalizePublicHref(gallery.screenshots[gallery.index])
              : null
          }
          setGallery={setGallery}
          goGallery={goGallery}
        />
      )}
    </main>
  );
}
