"use client";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  blogYoutubeVideos,
  blogYoutubePlaylists,
  blogFeaturedYoutubeVideo,
  YOUTUBE_CHANNEL_URL,
} from "@/app/core/data/youtube";
import {
  caseEvidenceLibrary,
  caseScreenshotsByEvidenceId,
  EMPTY_SCREENSHOTS,
} from "@/app/core/data/cases";
import AppBar from "@/app/components/blog_header/sensei-header";
import BlogCard from "./BlogCard";
import HomeSection from "@/app/components/home/sensei-home";
import BackToTop from "@/app/components/portfolio-back-to-top";
import styles from "./page.module.css";
import Link from "next/link";
import MotionInView from "@/app/core/components/MotionInView";
import Image from "next/image";


// ─── Types ───────────────────────────────────────────────────────────────────

type PdfResource = {
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
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
};

type GalleryState = {
  title: string;
  screenshots: string[];
  index: number;
};

type ChannelVideo = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt?: string;
  sourceUrl: string;
};

// ─── Module-level constants ───────────────────────────────────────────────────

const cvResource: PdfResource = {
  id: "soc-analyst-cv",
  title: "Ahmed Emad Nasr SOC Analyst CV",
  platform: "Professional Profile",
  type: "PDF CV",
  href: "Assets/cv/AhmedEmadNasr_CV.pdf",
};

const wannacryId = "malware-analysis-wannacry";
const wannacryCase = caseEvidenceLibrary.find((item) => item.id === wannacryId);
const otherCases = caseEvidenceLibrary.filter((item) => item.id !== wannacryId);
const blogPdfResources: PdfResource[] = wannacryCase
  ? [cvResource, wannacryCase, ...otherCases]
  : [cvResource, ...caseEvidenceLibrary];

 

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const normalizePublicHref = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.NODE_ENV === "production" ? "/Portfolio" : "");
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${basePath}${normalized}`.replace(/\/\//g, "/");
};

const getThumbnail = (imgPath: string): string => {
  // Heuristic: prefer a -thumb variant next to the original file (e.g. Screenshot (1)-thumb.webp).
  // The UI has a safe fallback (onError) to the original image if the thumbnail doesn't exist.
  return imgPath.replace(/(\.webp|\.png|\.jpg|\.jpeg)$/i, "-thumb$1");
};

// 1. Date Caching Setup
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateCache = new Map<string, string>();

const formatDate = (value: string): string => {
  if (dateCache.has(value)) return dateCache.get(value)!;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  
  const formatted = dateFormatter.format(parsed);
  dateCache.set(value, formatted);
  return formatted;
};

const matchesSearch = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.toLowerCase());

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogPageClient() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [pdfFilter, setPdfFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "popularity" | "difficulty">("recent");

  // ── Gallery state ─────────────────────────────────────────────────────────
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const galleryDialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [featuredPosterSrc, setFeaturedPosterSrc] = useState(
    `https://i.ytimg.com/vi/${blogFeaturedYoutubeVideo.videoId}/hqdefault.jpg`
  );

  // ── Embeds (lazy iframes) ────────────────────────────────────────────────
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const basePath = process.env.NODE_ENV === "production" ? "/Portfolio" : "";
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
      // Ignore SW registration failures; app should continue normally.
    });
  }, []);

  // ── Filter options ────────────────────────────────────────────────────────

  const pdfTypeFilters = useMemo(() => {
    const uniqueTypes = Array.from(new Set(blogPdfResources.map((item) => item.type)));
    return ["All", ...uniqueTypes];
  }, []);

  const difficultyOptions = useMemo(
    () =>
      Array.from(
        new Set(
          blogPdfResources
            .map((item) => item.difficulty)
            .filter((d): d is string => Boolean(d))
        )
      ),
    []
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          blogPdfResources
            .map((item) => item.category)
            .filter((c): c is string => Boolean(c))
        )
      ),
    []
  );

  // ── Filtered + sorted PDFs ────────────────────────────────────────────────

  const filteredPdfs = useMemo(() => {
    const q = query.toLowerCase();
    return blogPdfResources.filter((item) => {
      if (pdfFilter !== "All" && item.type !== pdfFilter) return false;
      if (difficultyFilter && item.difficulty !== difficultyFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (selectedTools.size > 0 && !item.tools?.some((t) => selectedTools.has(t))) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        item.platform.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [pdfFilter, difficultyFilter, categoryFilter, selectedTools, query]);

  const sortedPdfs = useMemo(() => {
    const difficultyOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
    return [...filteredPdfs].sort((a, b) => {
      const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      if (aShots !== bShots) return aShots ? -1 : 1;
      switch (sortBy) {
        case "recent":
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case "difficulty":
          return (
            (difficultyOrder[b.difficulty ?? ""] || 0) -
            (difficultyOrder[a.difficulty ?? ""] || 0)
          );
        case "popularity":
          return (bShots ? 1 : 0) - (aShots ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [filteredPdfs, sortBy]);

  // leadCase is derived from a module-level constant — deps array is intentionally empty.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leadCase = useMemo(
    () => blogPdfResources.find((item) => item.id === wannacryId) ?? null,
    // blogPdfResources is module-level and never changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const visiblePdfCards = useMemo(
    () => (leadCase ? sortedPdfs.filter((item) => item.id !== leadCase.id) : sortedPdfs),
    [sortedPdfs, leadCase]
  );

  // ── Video / playlist filter ───────────────────────────────────────────────

  const featuredVideo = blogFeaturedYoutubeVideo;

  // filteredChannelVideos: featured video is always shown first (even when query is empty),
  // but is also filtered by query so results are consistent — previously the featured video
  // would always appear even when it didn't match the search term.
  const filteredChannelVideos = useMemo<ChannelVideo[]>(() => {
    const featured: ChannelVideo = {
      videoId: featuredVideo.videoId,
      title: featuredVideo.title,
      description: featuredVideo.description,
      sourceUrl: featuredVideo.sourceUrl,
    };

    const others = blogYoutubeVideos
      .filter((video) => matchesSearch(video.title, query))
      .map((video) => ({
        ...video,
        sourceUrl: `https://youtu.be/${video.videoId}`,
      }));

    // Always include featured first; apply query filter to it as well so
    // it doesn't appear as a ghost result that doesn't match the search term.
    const featuredMatches = !query || matchesSearch(featured.title, query);
    const merged: ChannelVideo[] = featuredMatches ? [featured, ...others] : others;

    const seen = new Set<string>();
    return merged.filter((video) => {
      if (seen.has(video.videoId)) return false;
      seen.add(video.videoId);
      return true;
    });
  }, [query, featuredVideo.videoId, featuredVideo.title, featuredVideo.description, featuredVideo.sourceUrl]);

  const filteredPlaylists = useMemo(
    () => blogYoutubePlaylists.filter((p) => matchesSearch(p.title, query)),
    [query]
  );

  // ── Stats ────────────────────────────────────────────────────────────────

  const casesWithScreenshotsCount = useMemo(
    () =>
      caseEvidenceLibrary.filter((item) => (caseScreenshotsByEvidenceId[item.id] ?? []).length > 0)
        .length,
    []
  );

  const totalScreenshotAssets = useMemo(
    () => Object.values(caseScreenshotsByEvidenceId).reduce((sum, shots) => sum + shots.length, 0),
    []
  );

  // ── Gallery handlers ──────────────────────────────────────────────────────

  const goGallery = useCallback((delta: number) => {
    setGallery((cur) => {
      if (!cur) return null;
      const nextIndex = (cur.index + delta + cur.screenshots.length) % cur.screenshots.length;
      return { ...cur, index: nextIndex };
    });
  }, []);

  const openGallery = useCallback((title: string, screenshots: string[], index = 0) => {
    if (!screenshots.length) return;
    setGallery({
      title,
      screenshots,
      index: Math.min(Math.max(index, 0), screenshots.length - 1),
    });
  }, []);

  useEffect(() => {
    if (!gallery) return;
    const prev = document.activeElement as HTMLElement | null;
    const dialog = galleryDialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setGallery(null); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); goGallery(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); goGallery(-1); return; }
      if (e.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); prev?.focus(); };
  }, [gallery, goGallery]);

  // ── Other handlers ────────────────────────────────────────────────────────

  const activateEmbed = useCallback(
    (key: string) => setActiveEmbeds((cur) => ({ ...cur, [key]: true })),
    []
  );

  const toggleToolFilter = useCallback((tool: string) => {
    setSelectedTools((cur) => {
      const next = new Set(cur);
      next.has(tool) ? next.delete(tool) : next.add(tool);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setPdfFilter("All");
    setDifficultyFilter(null);
    setCategoryFilter(null);
    setSelectedTools(new Set());
    setRawQuery("");
    setQuery("");
  }, []);

  const handleGalleryTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const handleGalleryTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (touchStartXRef.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const deltaX = endX - touchStartXRef.current;
      touchStartXRef.current = null;
      if (Math.abs(deltaX) < 40) return;
      goGallery(deltaX < 0 ? 1 : -1);
    },
    [goGallery]
  );

  const hasActiveFilters =
    rawQuery || difficultyFilter || categoryFilter || selectedTools.size > 0 || pdfFilter !== "All";

  // 3. Pre-calculated Normalized hrefs for gallery and spotlight
  const currentGalleryShot =
    gallery && gallery.screenshots.length ? gallery.screenshots[gallery.index] : null;
  const currentGalleryShotNormalized = currentGalleryShot ? normalizePublicHref(currentGalleryShot) : null;

  const leadCaseSpotlightImage = leadCase && caseScreenshotsByEvidenceId[leadCase.id]?.[0]
    ? normalizePublicHref(caseScreenshotsByEvidenceId[leadCase.id][0])
    : null;

  const caseOrder = useMemo(() => blogPdfResources.filter((item) => item.id !== cvResource.id), []);
  const { leadCaseIndex, previousCase, nextCase } = useMemo(() => {
    const idx = caseOrder.findIndex((item) => item.id === leadCase?.id);
    return {
      leadCaseIndex: idx,
      previousCase: idx > 0 ? caseOrder[idx - 1] : null,
      nextCase: idx >= 0 && idx < caseOrder.length - 1 ? caseOrder[idx + 1] : null,
    };
  }, [caseOrder, leadCase]);
  
  const relatedCases = useMemo(() => {
    if (!leadCase) return [];

    const leadTags = new Set(leadCase.tags ?? []);

    return blogPdfResources
      .filter((item) => item.id !== leadCase.id && item.id !== cvResource.id)
      .map((item) => {
        let score = 0;

        if (leadCase.category && item.category && item.category === leadCase.category) {
          score += 3;
        }

        if (leadCase.difficulty && item.difficulty && item.difficulty === leadCase.difficulty) {
          score += 1;
        }

        score += (item.tags ?? []).filter((tag) => leadTags.has(tag)).length * 2;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ item }) => item);
  }, [leadCase]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <main id="main-content" className={styles.page}>
      <LoadingScreen />
      <AppBar />
      <HomeSection />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <MotionInView className={styles.heroInner}>
          <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Portfolio</Link>
            <span aria-hidden="true" className={styles.breadcrumbSeparator}>/</span>
            <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
            <span aria-hidden="true" className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{leadCase?.title ?? "Cases"}</span>
          </nav>
          <span className={styles.heroGlow} aria-hidden="true" />
          <p className={styles.kicker}>Ahmed Emad Nasr</p>
          <h1>Security Blog & Technical Reports</h1>
          <p>
            A single place for my SOC incident reports, DFIR writeups, and technical videos.
            Use search and filters to find what you need quickly.
          </p>

          <div className={styles.heroGrid}>
            <div className={styles.heroMainContent}>
              <div className={styles.metrics}>
                <article>
                  <strong>{blogPdfResources.length}</strong>
                  <span>PDF Resources</span>
                </article>
                <article>
                  <strong>36</strong>
                  <span>Total Videos</span>
                </article>
                <article>
                  <strong>24/7</strong>
                  <span>On-Demand</span>
                </article>
              </div>

              <div className={styles.heroActions}>
                <a href="#blog-pdfs-title" className={styles.primaryAction}>
                  Explore Cases
                </a>
                <Link href="/" className={`${styles.secondaryAction} ${styles.backAction}`}>
                  Back To Portfolio
                </Link>
              </div>

              <nav className={styles.quickLinks} aria-label="Quick section shortcuts">
                <a href="#blog-pdfs-title" className={styles.quickLink}>PDF Cases</a>
                <a href="#blog-playlists-title" className={styles.quickLink}>Playlists</a>
                <a href="#youtube-hub-title" className={styles.quickLink}>Channel Videos</a>
              </nav>
            </div>

            <article className={`${styles.featuredCard} ${styles.heroFeaturedCard}`}>
              <div className={styles.featuredFrame}>
                {activeEmbeds["featured-video"] ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}`}
                    title={featuredVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.embedPreview}
                    onClick={() => activateEmbed("featured-video")}
                    aria-label={`Play ${featuredVideo.title}`}
                  >
                    <Image
                      src={featuredPosterSrc}
                      alt={featuredVideo.title}
                      className={styles.embedPreviewImage}
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      unoptimized
                      onError={() => {
                        if (featuredPosterSrc.includes("maxresdefault")) {
                          setFeaturedPosterSrc(`https://i.ytimg.com/vi/${featuredVideo.videoId}/hqdefault.jpg`);
                          return;
                        }

                        if (featuredPosterSrc.includes("hqdefault")) {
                          setFeaturedPosterSrc(`https://i.ytimg.com/vi/${featuredVideo.videoId}/mqdefault.jpg`);
                          return;
                        }

                        setFeaturedPosterSrc("/Assets/art-gallery/Images/logo/My_Logo.webp");
                      }}
                    />
                    <span className={styles.embedPlayButton}>▶ Play</span>
                  </button>
                )}
              </div>
              <div className={styles.featuredContent}>
                <p className={styles.featuredTag}>Featured Video</p>
                <h2>{featuredVideo.title}</h2>
                <a href={featuredVideo.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube ↗
                </a>
              </div>
            </article>
          </div>
        </MotionInView>
      </section>

      {/* ── PDF Library ──────────────────────────────────────────────────── */}
      {leadCase && (
        <MotionInView className={styles.caseNavigator} aria-label="Case navigation">
          <article className={styles.caseNavCard}>
            <span className={styles.caseNavLabel}>Previous case</span>
            {previousCase ? (
              <>
                <h3>{previousCase.title}</h3>
                <p>{previousCase.category ?? previousCase.platform}</p>
                <a href={normalizePublicHref(previousCase.href)} target="_blank" rel="noopener noreferrer">
                  Open PDF
                </a>
              </>
            ) : (
              <p>Start with the featured case.</p>
            )}
          </article>

          <article className={`${styles.caseNavCard} ${styles.caseNavCenter}`}>
            <span className={styles.caseNavLabel}>Current case</span>
            <h3>{leadCase.title}</h3>
            <p>{leadCase.description}</p>
            <a href={normalizePublicHref(leadCase.href)} target="_blank" rel="noopener noreferrer">
              Open Featured PDF
            </a>
          </article>

          <article className={styles.caseNavCard}>
            <span className={styles.caseNavLabel}>Next case</span>
            {nextCase ? (
              <>
                <h3>{nextCase.title}</h3>
                <p>{nextCase.category ?? nextCase.platform}</p>
                <a href={normalizePublicHref(nextCase.href)} target="_blank" rel="noopener noreferrer">
                  Open PDF
                </a>
              </>
            ) : (
              <p>More cases are available below.</p>
            )}
          </article>
        </MotionInView>
      )}

      <section className={styles.block} aria-labelledby="blog-pdfs-title">
        <MotionInView className={styles.blockHeading}>
          <h2 id="blog-pdfs-title">PDF Library</h2>
          <p>{filteredPdfs.length} result(s) found.</p>
        </MotionInView>

        {/* Toolbar */}
        <MotionInView className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search cases, tags, tools…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
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
              {difficultyOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`${styles.sortButton} ${difficultyFilter === d ? styles.activeSort : ""}`}
                  onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {categoryOptions.length > 0 && (
            <div className={styles.sortButtons} role="group" aria-label="Filter by category">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.sortButton} ${categoryFilter === c ? styles.activeSort : ""}`}
                  onClick={() => setCategoryFilter(categoryFilter === c ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className={styles.sortButtons} role="group" aria-label="Sort order">
            {(["recent", "difficulty", "popularity"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.sortButton} ${sortBy === s ? styles.activeSort : ""}`}
                onClick={() => setSortBy(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
              ✕ Clear Filters
            </button>
          )}
        </MotionInView>

        {/* WannaCry spotlight */}
        {leadCase && (
          <MotionInView className={styles.caseSpotlight}>
            <div className={styles.caseSpotlightBody}>
              <p className={styles.caseSpotlightTag}>Case Spotlight</p>
              <h3>{leadCase.title}</h3>
              <p>{leadCase.description || "Featured first for quick navigation."}</p>
              <div className={styles.caseMetadata}>
                {leadCase.difficulty && (
                  <span
                    className={`${styles.badge} ${styles[`difficulty-${leadCase.difficulty.toLowerCase()}`]}`}
                  >
                    {leadCase.difficulty}
                  </span>
                )}
                {leadCase.category && <span className={styles.badge}>{leadCase.category}</span>}
                {leadCase.readTime && (
                  <span className={styles.badge}>{leadCase.readTime} min read</span>
                )}
              </div>
              {leadCase.tags && leadCase.tags.length > 0 && (
                <div className={styles.tagsList}>
                  {leadCase.tags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={styles.tagButton}
                      onClick={() => setRawQuery(tag)}
                    >
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
                      <button
                        key={tool}
                        type="button"
                        className={styles.toolButton}
                        onClick={() => toggleToolFilter(tool)}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.cardActions}>
                <a
                  href={normalizePublicHref(leadCase.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewAction}
                >
                  View PDF
                </a>
                <a
                  href={normalizePublicHref(leadCase.href)}
                  download
                  className={styles.downloadAction}
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() =>
                    openGallery(
                      leadCase.title,
                      caseScreenshotsByEvidenceId[leadCase.id] ?? EMPTY_SCREENSHOTS,
                      0
                    )
                  }
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
                  <a href={normalizePublicHref(item.href)} target="_blank" rel="noopener noreferrer">
                    Open PDF
                  </a>
                </article>
              ))}
            </div>
          </MotionInView>
        )}

        {/* PDF cards grid */}
        <div className={styles.pdfGrid}>
          {visiblePdfCards.map((item) => (
            <BlogCard
              key={item.id}
              {...item}
              screenshots={caseScreenshotsByEvidenceId[item.id] ?? EMPTY_SCREENSHOTS}
              onOpenGallery={openGallery}
              onTagClick={setRawQuery}
              onToolClick={toggleToolFilter}
              getThumbnail={getThumbnail}
              normalizeHref={normalizePublicHref}
            />
          ))}
        </div>

        {filteredPdfs.length === 0 && (
          <p className={styles.emptyState}>No PDF results match your current search/filter.</p>
        )}
      </section>

      {/* ── Insight strip ─────────────────────────────────────────────────── */}
      <MotionInView className={styles.insightStrip} aria-label="Case library highlights">
        <article className={styles.insightCard}>
          <strong>{caseEvidenceLibrary.length}</strong>
          <span>Total Cases</span>
        </article>
        <article className={styles.insightCard}>
          <strong>{casesWithScreenshotsCount}</strong>
          <span>With Screenshots</span>
        </article>
        <article className={styles.insightCard}>
          <strong>{totalScreenshotAssets}</strong>
          <span>Screenshot Assets</span>
        </article>
      </MotionInView>
        
      {/* ── YouTube Hub ───────────────────────────────────────────────────── */}
      <MotionInView className={styles.youtubeHub} aria-labelledby="youtube-hub-title" initial="visible">
        <div className={styles.blockHeading}>
          <h2 id="youtube-hub-title">YouTube Hub</h2>
          <p>All channel videos appear here in one place, including the featured video.</p>
        </div>
        <p className={styles.youtubeHubSummary}>{filteredChannelVideos.length} video(s) available.</p>
        <div className={styles.youtubeHubActions}>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.primaryAction} ${styles.channelAction}`}
          >
            Open YouTube Channel
          </a>
        </div>

        <div className={styles.youtubeHubGrid}>
          {filteredChannelVideos.map((video) => (
            <article key={`hub-video-${video.videoId}`} className={styles.videoCard}>
                <div className={styles.videoFrame}>
                  {activeEmbeds[`video-${video.videoId}`] ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.embedPreview}
                      onClick={() => activateEmbed(`video-${video.videoId}`)}
                      aria-label={`Play ${video.title}`}
                    >
                      <Image
                        src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                        alt={video.title}
                        className={styles.embedPreviewImage}
                        width={480}
                        height={270}
                        loading="lazy"
                        decoding="async"
                        unoptimized
                      />
                      <span className={styles.embedPlayButton}>▶ Play Video</span>
                    </button>
                  )}
                </div>
                <div className={styles.videoCardContent}>
                  <h3>{video.title}</h3>
                  {video.publishedAt && <p className={styles.videoDate}>{formatDate(video.publishedAt)}</p>}
                </div>
                <a
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.playlistAction}
                >
                  Watch on YouTube
                </a>
              </article>
          ))}
        </div>

        {filteredChannelVideos.length === 0 && (
          <p className={styles.emptyState}>No channel videos match your current search.</p>
        )}
      </MotionInView>

      {/* ── Playlists ─────────────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="blog-playlists-title">
        <MotionInView className={styles.blockHeading}>
          <h2 id="blog-playlists-title">YouTube Playlists</h2>
          <p>{filteredPlaylists.length} playlist(s) found.</p>
        </MotionInView>
        <div className={styles.playlistGrid}>
          {filteredPlaylists.map((playlist) => (
            <article key={playlist.playlistId} className={styles.playlistCard}>
                <div className={styles.playlistFrame}>
                  {activeEmbeds[`playlist-${playlist.playlistId}`] ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.playlistId}`}
                      title={playlist.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.embedPreview}
                      onClick={() => activateEmbed(`playlist-${playlist.playlistId}`)}
                      aria-label={`Play ${playlist.title}`}
                    >
                      <Image
                        src={`https://i.ytimg.com/vi/${playlist.thumbnailVideoId ?? featuredVideo.videoId}/hqdefault.jpg`}
                        alt={playlist.title}
                        className={styles.embedPreviewImage}
                        width={480}
                        height={270}
                        loading="lazy"
                        decoding="async"
                        unoptimized
                      />
                      <span className={styles.embedPlayButton}>▶ Play Playlist</span>
                    </button>
                  )}
                </div>
                <div className={styles.playlistContent}>
                  <h3>{playlist.title}</h3>
                  {playlist.description && (
                    <p className={styles.playlistDescription}>{playlist.description}</p>
                  )}
                  {playlist.tags && playlist.tags.length > 0 && (
                    <div className={styles.playlistTags}>
                      {playlist.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={styles.playlistTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {playlist.videoCount && (
                    <p className={styles.playlistVideoCount}>{playlist.videoCount} videos</p>
                  )}
                </div>
                <a
                  href={playlist.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.playlistAction}
                >
                  Open Playlist
                </a>
              </article>
          ))}
        </div>
        {filteredPlaylists.length === 0 && (
          <p className={styles.emptyState}>No playlist results match your current search.</p>
        )}
      </section>

      {/* ── Gallery overlay ───────────────────────────────────────────────── */}
      {gallery && currentGalleryShotNormalized && (
        <div
          className={styles.galleryOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`${gallery.title} screenshots gallery`}
          onClick={() => setGallery(null)}
        >
          <div
            ref={galleryDialogRef}
            className={styles.galleryDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.galleryHeader}>
              <h3 className={styles.galleryTitle}>{gallery.title}</h3>
              <p className={styles.galleryCounter}>
                Screenshot {gallery.index + 1} of {gallery.screenshots.length}
              </p>
              <button
                type="button"
                className={styles.galleryClose}
                onClick={() => setGallery(null)}
                aria-label="Close screenshots gallery"
              >
                ✕ Close
              </button>
            </div>

            <div className={styles.galleryStage}>
              <button
                type="button"
                className={styles.galleryNav}
                onClick={() => goGallery(-1)}
                aria-label="Previous screenshot"
              >
                ←
              </button>
              <a
                href={currentGalleryShotNormalized}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.galleryImageWrap}
                aria-label="Open current screenshot in new tab"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <Image
                  src={currentGalleryShotNormalized}
                  alt={`${gallery.title} screenshot ${gallery.index + 1}`}
                  fill
                  sizes="(max-width: 991px) 95vw, 78vw"
                  loading="lazy"
                  quality={75}
                />
              </a>
              <button
                type="button"
                className={styles.galleryNav}
                onClick={() => goGallery(1)}
                aria-label="Next screenshot"
              >
                →
              </button>
            </div>

            <div className={styles.galleryThumbs}>
              {gallery.screenshots.map((shot, index) => (
                <button
                  key={`${gallery.title}-${shot}`}
                  type="button"
                  className={
                    index === gallery.index
                      ? `${styles.galleryThumbButton} ${styles.activeGalleryThumb}`
                      : styles.galleryThumbButton
                  }
                  onClick={() => setGallery({ ...gallery, index })}
                  aria-label={`Open screenshot ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Closing ───────────────────────────────────────────────────────── */}
      <MotionInView className={styles.blogClosing} aria-labelledby="blog-closing-title">
        <div>
          <span className={styles.blogClosingKicker}>Final note</span>
          <h2 id="blog-closing-title">
            If you want the full story, start with the PDF archive and continue with the videos.
          </h2>
          <p>
            The blog is structured like a field notebook: short entry points, deeper evidence, and a
            direct path back to the portfolio.
          </p>
        </div>
        <div className={styles.blogClosingActions}>
          <Link href="/" className={styles.secondaryAction}>
            Back to Portfolio
          </Link>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryAction}
          >
            Open YouTube Channel
          </a>
        </div>
      </MotionInView>

      <BackToTop />
    </main>
  );
}