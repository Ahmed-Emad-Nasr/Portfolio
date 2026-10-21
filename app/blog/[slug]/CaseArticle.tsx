"use client";

/*
 * blog/[slug]/CaseArticle.tsx
 * Author: Ahmed Emad Nasr
 *
 * The body of the case page. A client component because it needs the image gallery and copy, but
 * all the text is prerendered normally into the HTML — so Google and OG crawlers
 * see the full content without JS.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { normalizePublicHref, getThumbnail, formatDate } from "../blog-utils";
import type { GalleryState } from "../blog-types";
import blogStyles from "../page.module.css";
import styles from "./case.module.css";
import ActionIcon from "../components/ActionIcon";
import { useCopyLink } from "../components/useCopyLink";

const BlogGalleryModal = dynamic(() => import("../components/BlogGalleryModal"), { ssr: false });

type CaseItem = {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  category: string;
  difficulty: string;
  href?: string;
  tags: readonly string[];
  tools: readonly string[];
  skillsGained: readonly string[];
  readTime: number;
  date: string;
};

type Sibling = { id: string; title: string } | null;

/* Computed in page.tsx (Server Component) and delivered ready-made — this component is
   client, so any import of attack.ts or cases.ts here would be bundled into the browser. */
type Technique = { id: string; name: string; tactic: string };
type Related = {
  id: string;
  title: string;
  category: string;
  readTime: number;
  sharedTechniques: number;
};

/*
 * getThumbnail() turns "1.webp" into "1-thumb.webp" — it assumes every image
 * has a thumbnail on disk. That assumption isn't true for every case: the link-check
 * script found nine images in one case looking for a -thumb that doesn't exist,
 * so the evidence grid showed broken tiles.
 *
 * BlogCard already has this protection (it falls back to the full image on error), but
 * the case page didn't. This component unifies the behaviour.
 *
 * Note that the state must live in a per-image component — if it were in the parent,
 * one failing image would make every image fall back to full size.
 */
function CaseShot({
  shot,
  index,
  total,
  title,
  onOpen,
}: {
  shot: string;
  index: number;
  total: number;
  title: string;
  onOpen: (index: number) => void;
}) {
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <button
      type="button"
      className={styles.shot}
      onClick={() => onOpen(index)}
      aria-label={`Open screenshot ${index + 1} of ${total}`}
    >
      <Image
        src={normalizePublicHref(thumbFailed ? shot : getThumbnail(shot))}
        alt={`${title} — screenshot ${index + 1}`}
        fill
        sizes="(max-width: 992px) 45vw, 24vw"
        loading="lazy"
        decoding="async"
        onError={() => setThumbFailed(true)}
      />
    </button>
  );
}

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
  const { state: copyState, copy } = useCopyLink();

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

  const copyLink = useCallback(() => {
    void copy(`${window.location.origin}${window.location.pathname}`);
  }, [copy]);

  const difficultyClass = blogStyles[`difficulty-${item.difficulty.toLowerCase()}`];

  return (
    <main id="main-content" className={styles.page}>
      {/* A navigation bar specific to this page: the regular blog header scrolls to sections
          that don't exist here, so it would be dead buttons. */}
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
          {/* This case may have image-only evidence. When there's no PDF, there are no buttons —
              better than a button that leads to a 404. */}
          {item.href && (
            <>
              <a
                href={normalizePublicHref(item.href)}
                target="_blank"
                rel="noopener noreferrer"
                data-fx="btn" data-btn="solid" className={blogStyles.primaryAction}
              >
                <ActionIcon name="external" /> View PDF
              </a>
              <a href={normalizePublicHref(item.href)} download data-fx="btn" data-btn="ghost" data-tone="main">
                <ActionIcon name="download" /> Download
              </a>
            </>
          )}
          {screenshots.length > 0 && (
            <button
              type="button"
              onClick={() => openGallery(0)}
              data-fx="btn" data-btn="ghost" data-tone="accent" data-btn-edge="dashed"
            >
              <ActionIcon name="gallery" /> Screenshots
              <span className={blogStyles.btnCount}>{screenshots.length}</span>
            </button>
          )}
          {/* FIX: same as BlogCard — no data-fx="btn", so the global `button` hover
              (red background, white text) overrode this button's own hover. */}
          <button
            type="button"
            onClick={copyLink}
            data-fx="btn"
            data-btn="ghost"
            data-state={copyState === "idle" ? undefined : copyState}
            className={styles.copyAction}
          >
            <ActionIcon key={copyState} name={copyState === "done" ? "check" : copyState === "error" ? "alert" : "link"} />
            <span aria-live="polite">
              {copyState === "done" ? "Copied!" : copyState === "error" ? "Copy failed" : "Copy link"}
            </span>
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
                // The link takes you back to the library filtered on this tool/tag
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
                <CaseShot
                  key={shot}
                  shot={shot}
                  index={i}
                  total={screenshots.length}
                  title={item.title}
                  onOpen={openGallery}
                />
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
                  <Link href={`/blog/${entry.id}`} className={styles.relatedCard} data-fx="card" data-card="compact">
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
