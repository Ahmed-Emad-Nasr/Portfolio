"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import {
  blogFeaturedYoutubeVideo,
  blogYoutubePlaylists,
  blogYoutubeVideos,
  caseEvidenceLibrary,
  YOUTUBE_CHANNEL_URL,
} from "@/app/core/data";
import BlogCard from "./BlogCard";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants (module-level) ───────────────────────────────

const cvResource: PdfResource = {
  id: "soc-analyst-cv",
  title: "Ahmed Emad SOC Analyst CV",
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

const buildScreenshotRange = (
  folder: string,
  start: number,
  end: number,
  excluded: number[] = []
): string[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i)
    .filter((n) => !excluded.includes(n))
    .map((n) => `Assets/Cases/${folder}/Screenshot (${n}).png`);

const caseScreenshotsByEvidenceId: Record<string, string[]> = {
      "lockbit-ransomware-forensics": Array.from({ length: 18 }, (_, i) => `Assets/Cases/LockBit/Screenshot (${85 + i}).png`),
      "imagestegano": [
        "Assets/Cases/ImageStegano/Screenshot (104).png",
        "Assets/Cases/ImageStegano/Screenshot (105).png",
        "Assets/Cases/ImageStegano/Screenshot (106).png",
        "Assets/Cases/ImageStegano/Screenshot (108).png",
        "Assets/Cases/ImageStegano/Screenshot (109).png",
        "Assets/Cases/ImageStegano/Screenshot (110).png",
        "Assets/Cases/ImageStegano/Screenshot (112).png",
        "Assets/Cases/ImageStegano/Screenshot (113).png",
        "Assets/Cases/ImageStegano/Screenshot (114).png",
        "Assets/Cases/ImageStegano/Screenshot (115).png",
        "Assets/Cases/ImageStegano/Screenshot (116).png",
        "Assets/Cases/ImageStegano/Screenshot (117).png",
        "Assets/Cases/ImageStegano/Screenshot (118).png",
        "Assets/Cases/ImageStegano/Screenshot (119).png",
        "Assets/Cases/ImageStegano/Screenshot (120).png"
      ],
    "hidden-backdoor-report": Array.from({ length: 25 }, (_, i) => `Assets/Cases/Hidden Backdoor/Screenshot (${50 + i}).png`),
  "malware-analysis-wannacry": [
    ...Array.from({ length: 38 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/${i + 1}.png`),
    ...Array.from({ length: 24 }, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/Screenshot (${343 + i}).png`),
  ],
  "wifi-cracking-walkthrough": ["Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp"],
  "ass6-mitre": [
    "Assets/Cases/ass_6/1.png",
    "Assets/Cases/ass_6/2.png",
    "Assets/Cases/ass_6/3.png",
    "Assets/Cases/ass_6/4.png",
  ],
  "soc127-pdf": buildScreenshotRange("SOC127", 131, 134),
  "soc205-pdf": buildScreenshotRange("SOC205", 154, 162),
  "soc257-pdf": buildScreenshotRange("SOC257", 135, 140),
  "soc274-pdf": buildScreenshotRange("SOC274", 122, 130),
  "soc282-pdf": buildScreenshotRange("SOC282", 144, 149),
  "soc326-report": buildScreenshotRange("SOC326", 100, 121),
  "soc336-report": buildScreenshotRange("SOC336", 165, 178, [169]),
  "soc338-pdf": buildScreenshotRange("SOC338", 83, 90),
  "soc342-pdf": buildScreenshotRange("SOC342", 91, 99),
  "unload-malware-report": buildScreenshotRange("Unload_Malware", 201, 211),
  "malware2-report": buildScreenshotRange("Malware2", 245, 256),
  "bruteforce-room-report": buildScreenshotRange("BruteForce_Room", 228, 244),
  "malicious-web-traffic-room-report": buildScreenshotRange("MaliciousWebTraffic_Room", 268, 282),
  "email-analysis-room-report": Array.from({ length: 10 }, (_, i) => `Assets/Cases/Email_Analysis_Room/${i + 1}.png`),
  "usb-forensics-report": [
    "Assets/Cases/Usb Forencics/Screenshot (3).png",
    "Assets/Cases/Usb Forencics/Screenshot (4).png",
    "Assets/Cases/Usb Forencics/Screenshot (5).png",
    "Assets/Cases/Usb Forencics/Screenshot (6).png",
    "Assets/Cases/Usb Forencics/Screenshot (7).png",
    "Assets/Cases/Usb Forencics/Screenshot (8).png",
    "Assets/Cases/Usb Forencics/Screenshot (9).png",
    "Assets/Cases/Usb Forencics/Screenshot (10).png",
    "Assets/Cases/Usb Forencics/Screenshot (11).png",
    "Assets/Cases/Usb Forencics/Screenshot (13).png",
    "Assets/Cases/Usb Forencics/Screenshot (14).png",
    "Assets/Cases/Usb Forencics/Screenshot (15).png",
  ],
  "ettercap-case": [
    "Assets/Cases/EtterCap/Screenshot (27).png",
    "Assets/Cases/EtterCap/Screenshot (28).png",
    "Assets/Cases/EtterCap/Screenshot (29).png",
    "Assets/Cases/EtterCap/Screenshot (31).png",
    "Assets/Cases/EtterCap/Screenshot (32).png",
    "Assets/Cases/EtterCap/Screenshot (33).png",
    "Assets/Cases/EtterCap/Screenshot (34).png",
    "Assets/Cases/EtterCap/Screenshot (35).png",
    "Assets/Cases/EtterCap/Screenshot (36).png",
  ],
};

// ─── Pure helpers (No window checks to prevent Hydration errors) ───────

const normalizePublicHref = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  // Use a predictable path for both SSR and CSR
  const basePath = process.env.NODE_ENV === "production" ? "/Portfolio" : "";
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${basePath}${normalized}`.replace(/\/\//g, "/"); // Safe format
};

const getThumbnail = (imgPath: string): string => {
  if (!imgPath) return imgPath;
  const rel = imgPath
    .replace(/^Assets\/Cases\//, "")
    .replace(/[\\/]/g, "__")
    .replace(/\.(png|jpg|jpeg)$/i, ".webp");
  return `Assets/Cases/thumbnails/${rel}`;
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const matchesSearch = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.toLowerCase());

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogPageClient() {
  const [query, setQuery] = useState("");
  const [pdfFilter, setPdfFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "popularity" | "difficulty">("recent");
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});
  const [isPageReady, setIsPageReady] = useState(false);
  
  const galleryDialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // ── Derived filter options ──────────────────────────────────────────────────

  const pdfTypeFilters = useMemo(() => {
    const uniqueTypes = Array.from(new Set(blogPdfResources.map((item) => item.type)));
    return ["All", ...uniqueTypes];
  }, []);

  const difficultyOptions = useMemo(
    () =>
      Array.from(
        new Set(blogPdfResources.map((item) => item.difficulty).filter((d): d is string => Boolean(d)))
      ),
    []
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(blogPdfResources.map((item) => item.category).filter((c): c is string => Boolean(c)))
      ),
    []
  );

  // ── Filtered + sorted PDFs ──────────────────────────────────────────────────

  const filteredPdfs = useMemo(() => {
    return blogPdfResources.filter((item) => {
      if (pdfFilter !== "All" && item.type !== pdfFilter) return false;
      if (difficultyFilter && item.difficulty !== difficultyFilter) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (selectedTools.size > 0 && !item.tools?.some((t) => selectedTools.has(t))) return false;
      return (
        matchesSearch(item.title, query) ||
        matchesSearch(item.description || "", query) ||
        matchesSearch(item.platform, query) ||
        matchesSearch(item.type, query) ||
        (item.tags?.some((tag) => matchesSearch(tag, query)) ?? false)
      );
    });
  }, [pdfFilter, difficultyFilter, categoryFilter, selectedTools, query]);

  const sortedPdfs = useMemo(() => {
    const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
    return [...filteredPdfs].sort((a, b) => {
      const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      if (aShots !== bShots) return aShots ? -1 : 1;
      switch (sortBy) {
        case "recent":
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case "difficulty":
          return (
            (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0)
          );
        case "popularity":
          return (bShots ? 1 : 0) - (aShots ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [filteredPdfs, sortBy]);

  const leadCase = useMemo(
    () => blogPdfResources.find((item) => item.id === wannacryId) ?? null,
    []
  );

  const visiblePdfCards = useMemo(
    () => (leadCase ? sortedPdfs.filter((item) => item.id !== leadCase.id) : sortedPdfs),
    [sortedPdfs, leadCase]
  );

  // ── Video / playlist filter ────────────────────────────────────────────────

  const featuredVideo = blogFeaturedYoutubeVideo;

  const filteredVideos = useMemo(
    () =>
      blogYoutubeVideos.filter(
        (v) => v.videoId !== featuredVideo.videoId && matchesSearch(v.title, query)
      ),
    [featuredVideo.videoId, query]
  );

  const filteredPlaylists = useMemo(
    () => blogYoutubePlaylists.filter((p) => matchesSearch(p.title, query)),
    [query]
  );

  // ── Stats ──────────────────────────────────────────────────────────────────

  const casesWithScreenshotsCount = useMemo(
    () => caseEvidenceLibrary.filter((item) => (caseScreenshotsByEvidenceId[item.id] ?? []).length > 0).length,
    []
  );

  const totalScreenshotAssets = useMemo(
    () => Object.values(caseScreenshotsByEvidenceId).reduce((sum, shots) => sum + shots.length, 0),
    []
  );

  // ── Gallery ────────────────────────────────────────────────────────────────

  const goGallery = useCallback((delta: number) => {
    setGallery((cur) => {
      if (!cur) return null;
      const nextIndex = (cur.index + delta + cur.screenshots.length) % cur.screenshots.length;
      return { ...cur, index: nextIndex };
    });
  }, []);

  const openGallery = useCallback((title: string, screenshots: string[], index = 0) => {
    if (!screenshots.length) return;
    setGallery({ title, screenshots, index: Math.min(Math.max(index, 0), screenshots.length - 1) });
  }, []);

  useEffect(() => {
    if (!gallery) return;
    const prev = document.activeElement as HTMLElement | null;
    const dialog = galleryDialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');
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

  // ── Other handlers ─────────────────────────────────────────────────────────

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
    query || difficultyFilter || categoryFilter || selectedTools.size > 0 || pdfFilter !== "All";

  const currentGalleryShot =
    gallery && gallery.screenshots.length ? gallery.screenshots[gallery.index] : null;

  // ── Page ready ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;
    const ready =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true }));
    const minDelay = new Promise<void>((res) => setTimeout(res, 120));

    Promise.all([ready, minDelay]).then(() => {
      if (mounted) requestAnimationFrame(() => { if (mounted) setIsPageReady(true); });
    });

    return () => { mounted = false; };
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <main id="main-content" className={styles.page} style={{ position: "relative" }}>
      <LoadingScreen isLoading={!isPageReady} />
      <div
        style={{
          opacity: isPageReady ? 1 : 0,
          pointerEvents: isPageReady ? "auto" : "none",
          minHeight: isPageReady ? "auto" : "100vh",
          overflow: isPageReady ? "visible" : "hidden",
          transition: "opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <span className={styles.heroGlow} aria-hidden="true" />
          <p className={styles.kicker}>Knowledge Hub</p>
          <h1>Blog, Reports, and Technical Videos</h1>
          <p>
            A single place for my PDF reports, assignments, and security videos.
            Use search and filters to find what you want quickly.
          </p>
          <div className={styles.heroGrid}>
            <div className={styles.heroMainContent}>
              <div className={styles.metrics}>
                <article>
                  <strong>{blogPdfResources.length}</strong>
                  <span>PDF Resources</span>
                </article>
                <article>
                  <strong>{blogYoutubeVideos.length + 1}</strong>
                  <span>Total Videos</span>
                </article>
                <article>
                  <strong>24/7</strong>
                  <span>On-Demand Access</span>
                </article>
              </div>
              <div className={styles.heroActions}>
                <a href="#blog-pdfs-title" className={styles.primaryAction}>
                  Explore Cases First
                </a>
                <Link href="/" className={`${styles.secondaryAction} ${styles.backAction}`}>
                  Back To Portfolio
                </Link>
              </div>
              <nav className={styles.quickLinks} aria-label="Quick section shortcuts">
                <a href="#blog-pdfs-title" className={styles.quickLink}>PDF Cases</a>
                <a href="#blog-playlists-title" className={styles.quickLink}>Playlists</a>
                <a href="#blog-videos-title" className={styles.quickLink}>Videos</a>
                <a href="#youtube-hub-title" className={styles.quickLink}>YouTube Hub</a>
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
                      src={`https://i.ytimg.com/vi/${featuredVideo.videoId}/hqdefault.jpg`}
                      alt={featuredVideo.title}
                      fill
                      sizes="(max-width: 991px) 100vw, 50vw"
                      loading="lazy"
                    />
                    <span className={styles.embedPlayButton}>Play</span>
                  </button>
                )}
              </div>
              <div className={styles.featuredContent}>
                <p className={styles.featuredTag}>Featured Video</p>
                <h3>{featuredVideo.title}</h3>
                <a href={featuredVideo.sourceUrl} target="_blank" rel="noreferrer">
                  Watch on YouTube
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* ── PDF Library ──────────────────────────────────────────────────── */}
        <section className={styles.block} aria-labelledby="blog-pdfs-title">
          <div className={styles.blockHeading}>
            <h2 id="blog-pdfs-title">PDF Library</h2>
            <p>{filteredPdfs.length} result(s) found.</p>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search cases, tags, tools…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search PDF resources"
            />

            {/* Type filter */}
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

            {/* Difficulty filter */}
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

            {/* Category filter */}
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

            {/* Sort */}
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

            {/* Clear filters */}
            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
                ✕ Clear Filters
              </button>
            )}
          </div>

          {/* WannaCry spotlight */}
          {leadCase && (
            <article className={styles.caseSpotlight}>
              <div className={styles.caseSpotlightBody}>
                <p className={styles.caseSpotlightTag}>Case Spotlight</p>
                <h3>{leadCase.title}</h3>
                <p>{leadCase.description || "Featured first for quick navigation."}</p>
                <div className={styles.caseMetadata}>
                  {leadCase.difficulty && (
                    <span className={`${styles.badge} ${styles[`difficulty-${leadCase.difficulty.toLowerCase()}`]}`}>
                      {leadCase.difficulty}
                    </span>
                  )}
                  {leadCase.category && <span className={styles.badge}>{leadCase.category}</span>}
                  {leadCase.readTime && <span className={styles.badge}>{leadCase.readTime} min read</span>}
                </div>
                {leadCase.tags && leadCase.tags.length > 0 && (
                  <div className={styles.tagsList}>
                    {leadCase.tags.slice(0, 4).map((tag) => (
                      <button key={tag} type="button" className={styles.tagButton} onClick={() => setQuery(tag)}>
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
                        <button key={tool} type="button" className={styles.toolButton} onClick={() => toggleToolFilter(tool)}>
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.cardActions}>
                  <a href={normalizePublicHref(leadCase.href)} target="_blank" rel="noreferrer" className={styles.viewAction}>
                    View PDF
                  </a>
                  <a href={normalizePublicHref(leadCase.href)} download className={styles.downloadAction}>
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => openGallery(leadCase.title, caseScreenshotsByEvidenceId[leadCase.id] ?? [], 0)}
                    className={`${styles.galleryOpenAction} ${styles.viewAction}`}
                  >
                    View All Screenshots
                  </button>
                </div>
              </div>
              {caseScreenshotsByEvidenceId[leadCase.id]?.[0] && (
                <a
                  href={normalizePublicHref(caseScreenshotsByEvidenceId[leadCase.id][0])}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.caseSpotlightMedia}
                  aria-label={`Open spotlight screenshot for ${leadCase.title}`}
                >
                  <Image
                    src={normalizePublicHref(caseScreenshotsByEvidenceId[leadCase.id][0])}
                    alt={`${leadCase.title} spotlight screenshot`}
                    fill
                    sizes="(max-width: 991px) 100vw, 38vw"
                    loading="lazy"
                  />
                </a>
              )}
            </article>
          )}

          {/* PDF cards grid */}
          <div className={styles.pdfGrid}>
            {visiblePdfCards.map((item, idx) => (
              <BlogCard
                key={item.id}
                {...item}
                screenshots={caseScreenshotsByEvidenceId[item.id] ?? []}
                onOpenGallery={() => openGallery(item.title, caseScreenshotsByEvidenceId[item.id] ?? [], 0)}
                onTagClick={setQuery}
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
        <section className={styles.insightStrip} aria-label="Case library highlights">
          <article className={styles.insightCard}>
            <strong>{caseEvidenceLibrary.length}</strong>
            <span>Total Cases</span>
          </article>
          <article className={styles.insightCard}>
            <strong>{casesWithScreenshotsCount}</strong>
            <span>Cases With Screenshots</span>
          </article>
          <article className={styles.insightCard}>
            <strong>{totalScreenshotAssets}</strong>
            <span>Screenshot Assets</span>
          </article>
        </section>

        {/* ── YouTube Hub ───────────────────────────────────────────────────── */}
        <section className={styles.youtubeHub} aria-labelledby="youtube-hub-title">
          <div className={styles.blockHeading}>
            <h2 id="youtube-hub-title">YouTube Hub</h2>
            <p>All channel content grouped here: featured, playlists, and latest videos.</p>
          </div>
          <div className={styles.youtubeHubActions}>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" className={`${styles.primaryAction} ${styles.channelAction}`}>
              Open YouTube Channel
            </a>
          </div>
        </section>

        {/* ── Playlists ─────────────────────────────────────────────────────── */}
        <section className={styles.block} aria-labelledby="blog-playlists-title">
          <div className={styles.blockHeading}>
            <h2 id="blog-playlists-title">YouTube Playlists</h2>
            <p>{filteredPlaylists.length} playlist(s) found.</p>
          </div>
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
                        src={`https://i.ytimg.com/vi/${featuredVideo.videoId}/hqdefault.jpg`}
                        alt={playlist.title}
                        fill
                        sizes="(max-width: 991px) 100vw, 40vw"
                        loading="lazy"
                      />
                      <span className={styles.embedPlayButton}>Play Playlist</span>
                    </button>
                  )}
                </div>
                <div className={styles.playlistContent}>
                  <h3>{playlist.title}</h3>
                  {playlist.description && <p className={styles.playlistDescription}>{playlist.description}</p>}
                  {playlist.tags && playlist.tags.length > 0 && (
                    <div className={styles.playlistTags}>
                      {playlist.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={styles.playlistTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {playlist.videoCount && <p className={styles.playlistVideoCount}>{playlist.videoCount} videos</p>}
                </div>
                <a href={playlist.sourceUrl} target="_blank" rel="noreferrer" className={styles.playlistAction}>
                  Open Playlist
                </a>
              </article>
            ))}
          </div>
          {filteredPlaylists.length === 0 && (
            <p className={styles.emptyState}>No playlist results match your current search.</p>
          )}
        </section>

        {/* ── Videos ────────────────────────────────────────────────────────── */}
        <section className={styles.block} aria-labelledby="blog-videos-title">
          <div className={styles.blockHeading}>
            <h2 id="blog-videos-title">YouTube Videos</h2>
            <p>{filteredVideos.length} result(s) found.</p>
          </div>
          <div className={styles.videoGrid}>
            {filteredVideos.map((video) => (
              <article key={video.videoId} className={styles.videoCard}>
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
                        fill
                        sizes="(max-width: 991px) 100vw, 40vw"
                        loading="lazy"
                      />
                      <span className={styles.embedPlayButton}>Play Video</span>
                    </button>
                  )}
                </div>
                <div className={styles.videoCardContent}>
                  <h3>{video.title}</h3>
                  <p className={styles.videoDate}>{formatDate(video.publishedAt)}</p>
                </div>
              </article>
            ))}
          </div>
          {filteredVideos.length === 0 && (
            <p className={styles.emptyState}>No video results match your current search.</p>
          )}
        </section>

        {/* ── Gallery overlay ───────────────────────────────────────────────── */}
        {gallery && currentGalleryShot && (
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
                  Close
                </button>
              </div>

              <div className={styles.galleryStage}>
                <button type="button" className={styles.galleryNav} onClick={() => goGallery(-1)} aria-label="Previous screenshot">
                  Prev
                </button>
                <a
                  href={normalizePublicHref(currentGalleryShot)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.galleryImageWrap}
                  aria-label="Open current screenshot in new tab"
                  onTouchStart={handleGalleryTouchStart}
                  onTouchEnd={handleGalleryTouchEnd}
                >
                  <Image
                    src={normalizePublicHref(currentGalleryShot)}
                    alt={`${gallery.title} screenshot ${gallery.index + 1}`}
                    fill
                    sizes="(max-width: 991px) 95vw, 78vw"
                    loading="lazy"
                  />
                </a>
                <button type="button" className={styles.galleryNav} onClick={() => goGallery(1)} aria-label="Next screenshot">
                  Next
                </button>
              </div>

              <div className={styles.galleryThumbs}>
                {gallery.screenshots.map((shot, index) => (
                  <button
                    key={`${gallery.title}-${shot}`}
                    type="button"
                    className={index === gallery.index ? `${styles.galleryThumbButton} ${styles.activeGalleryThumb}` : styles.galleryThumbButton}
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
        <section className={styles.blogClosing} aria-labelledby="blog-closing-title">
          <div>
            <span className={styles.blogClosingKicker}>Final note</span>
            <h2 id="blog-closing-title">
              If you want the full story, start with the PDF archive and continue with the videos.
            </h2>
            <p>
              The blog is structured like a field notebook: short entry points, deeper evidence, and a direct path back
              to the portfolio.
            </p>
          </div>
          <div className={styles.blogClosingActions}>
            <Link href="/" className={styles.secondaryAction}>
              Back to Portfolio
            </Link>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" className={styles.primaryAction}>
              Open YouTube Channel
            </a>
          </div>
        </section>

      </div>

      <BackToTop />
    </main>
  );
}

// ─── Back to Top ──────────────────────────────────────────────────────────────

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className={styles.backToTop}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}