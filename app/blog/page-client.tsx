"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import {
  blogFeaturedYoutubeVideo,
  blogYoutubePlaylists,
  blogYoutubeVideos,
  caseEvidenceLibrary,
  YOUTUBE_CHANNEL_URL,
} from "@/app/core/data";
import DesktopQuickCTA from "@/app/core/components/DesktopQuickCTA";
import MobileQuickActions from "@/app/core/components/MobileQuickActions";
import { recordFunnelEvent } from "@/app/core/utils/engagement";
import VisualModeToggle from "@/app/core/components/VisualModeToggle";

const AnimatedBackground = dynamic(
  () => import("@/app/components/animated_background/animated_background"),
  { ssr: false }
);

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

const cvResource: PdfResource = {
  id: "soc-analyst-cv",
  title: "Ahmed Emad SOC Analyst CV",
  platform: "Professional Profile",
  type: "PDF CV",
  href: "Assets/cv/AhmedEmadNasr_CV.pdf",
};

// Ensure WannaCry is always first in the writeups
const wannacryId = "malware-analysis-wannacry";
const wannacryCase = caseEvidenceLibrary.find((item) => item.id === wannacryId);
const otherCases = caseEvidenceLibrary.filter((item) => item.id !== wannacryId);
const blogPdfResources: PdfResource[] = wannacryCase ? [cvResource, wannacryCase, ...otherCases] : [cvResource, ...caseEvidenceLibrary];

const buildScreenshotRange = (
  folder: string,
  start: number,
  end: number,
  excluded: number[] = []
): string[] => {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
    .filter((number) => !excluded.includes(number))
    .map((number) => `Assets/Cases/${folder}/Screenshot (${number}).png`);
};

const caseScreenshotsByEvidenceId: Record<string, string[]> = {
      "malware-analysis-wannacry": [
        // 1.png to 38.png
        ...Array.from({length: 38}, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/${i+1}.png`),
        // Screenshot (343).png to Screenshot (366).png
        ...Array.from({length: 24}, (_, i) => `Assets/Cases/Malware Analysis and Prevention Strategy/Screenshot (${343+i}).png`),
      ],
    "wifi-cracking-walkthrough": [
      "Assets/Cases/Wifi Cracking/Screenshot_2026-03-21_111817.webp",
    ],
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
  "email-analysis-room-report": [
    "Assets/Cases/Email_Analysis_Room/1.png",
    "Assets/Cases/Email_Analysis_Room/2.png",
    "Assets/Cases/Email_Analysis_Room/3.png",
    "Assets/Cases/Email_Analysis_Room/4.png",
    "Assets/Cases/Email_Analysis_Room/5.png",
    "Assets/Cases/Email_Analysis_Room/6.png",
    "Assets/Cases/Email_Analysis_Room/7.png",
    "Assets/Cases/Email_Analysis_Room/8.png",
    "Assets/Cases/Email_Analysis_Room/9.png",
    "Assets/Cases/Email_Analysis_Room/10.png",
  ],
  "set-tool-writeup-pdf": buildScreenshotRange("SET TOOL Writeup", 32, 46, [36, 39]),
  "set-tool-writeup-docx": buildScreenshotRange("SET TOOL Writeup", 32, 46, [36, 39]),
};

const normalizePublicHref = (href: string): string => {
  if (typeof window === "undefined") return href;
  if (/^https?:\/\//i.test(href)) return href;

  const path = window.location.pathname;
  const scopePrefix =
    path.startsWith("/Portfolio/") || path === "/Portfolio" ? "/Portfolio" : "";

  const normalized = href.startsWith("/") ? href : `/${href}`;
  return encodeURI(`${scopePrefix}${normalized}`);
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

  const pdfTypeFilters = useMemo(() => {
    const uniqueTypes = Array.from(new Set(blogPdfResources.map((item) => item.type)));
    return ["All", ...uniqueTypes];
  }, []);

  const difficultyOptions = useMemo(() => {
    const difficulties = Array.from(new Set(blogPdfResources.map((item) => item.difficulty).filter((d): d is string => Boolean(d))));
    return difficulties;
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(blogPdfResources.map((item) => item.category).filter((c): c is string => Boolean(c))));
    return categories;
  }, []);

  const toolsOptions = useMemo(() => {
    const allTools = new Set<string>();
    blogPdfResources.forEach((item) => {
      item.tools?.forEach((tool) => allTools.add(tool));
    });
    return Array.from(allTools).sort();
  }, []);

  const filteredPdfs = useMemo(() => {
    return blogPdfResources.filter((item) => {
      const typeMatches = pdfFilter === "All" || item.type === pdfFilter;
      const difficultyMatches = !difficultyFilter || item.difficulty === difficultyFilter;
      const categoryMatches = !categoryFilter || item.category === categoryFilter;
      const toolsMatch = selectedTools.size === 0 || (item.tools && item.tools.some((tool) => selectedTools.has(tool)));
      const textMatches =
        matchesSearch(item.title, query) ||
        matchesSearch(item.description || "", query) ||
        matchesSearch(item.platform, query) ||
        matchesSearch(item.type, query) ||
        (item.tags && item.tags.some((tag) => matchesSearch(tag, query)));

      return typeMatches && difficultyMatches && categoryMatches && toolsMatch && textMatches;
    });
  }, [pdfFilter, difficultyFilter, categoryFilter, selectedTools, query]);

  const sortedPdfs = useMemo(() => {
    const sorted = [...filteredPdfs].sort((a, b) => {
      const aHasScreenshots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bHasScreenshots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      
      // Quick sort: cases with screenshots first
      if (aHasScreenshots !== bHasScreenshots) {
        return aHasScreenshots ? -1 : 1;
      }

      // Then apply user's sort preference
      switch (sortBy) {
        case "recent":
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0) -
                 (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0);
        case "popularity":
          return (bHasScreenshots ? 1 : 0) - (aHasScreenshots ? 1 : 0);
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredPdfs, sortBy]);

  // Always spotlight WannaCry
  const wannacryId = "malware-analysis-wannacry";
  const leadCase = blogPdfResources.find((item) => item.id === wannacryId) ?? null;

  const visiblePdfCards = useMemo(() => {
    if (!leadCase) return sortedPdfs;
    return sortedPdfs.filter((item) => item.id !== leadCase.id);
  }, [sortedPdfs, leadCase]);

  const featuredVideo = blogFeaturedYoutubeVideo;

  const filteredVideos = useMemo(() => {
    return blogYoutubeVideos.filter((video) => {
      const isNotFeatured = video.videoId !== featuredVideo.videoId;
      const textMatches = matchesSearch(video.title, query);
      return isNotFeatured && textMatches;
    });
  }, [featuredVideo.videoId, query]);

  const filteredPlaylists = useMemo(() => {
    return blogYoutubePlaylists.filter((playlist) =>
      matchesSearch(playlist.title, query)
    );
  }, [query]);

  const casesWithScreenshotsCount = useMemo(() => {
    return caseEvidenceLibrary.filter(
      (item) => (caseScreenshotsByEvidenceId[item.id] ?? []).length > 0
    ).length;
  }, []);

  const totalScreenshotAssets = useMemo(() => {
    return Object.values(caseScreenshotsByEvidenceId).reduce(
      (sum, shots) => sum + shots.length,
      0
    );
  }, []);

  useEffect(() => {
    if (!gallery) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const dialog = galleryDialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setGallery(null);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        recordFunnelEvent("gallery_navigate");
        goGallery(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        recordFunnelEvent("gallery_navigate");
        goGallery(-1);
        return;
      }

      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [gallery]);

  const openGallery = (title: string, screenshots: string[], index = 0) => {
    if (!screenshots.length) return;
    recordFunnelEvent("gallery_open");
    setGallery({
      title,
      screenshots,
      index: Math.min(Math.max(index, 0), screenshots.length - 1),
    });
  };

  const goGallery = (delta: number) => {
    setGallery((current) => {
      if (!current) return null;
      const nextIndex =
        (current.index + delta + current.screenshots.length) %
        current.screenshots.length;
      return { ...current, index: nextIndex };
    });
  };

  const activateEmbed = (key: string) => {
    setActiveEmbeds((current) => ({ ...current, [key]: true }));
  };

  const toggleToolFilter = (tool: string) => {
    setSelectedTools((current) => {
      const next = new Set(current);
      if (next.has(tool)) {
        next.delete(tool);
      } else {
        next.add(tool);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setPdfFilter("All");
    setDifficultyFilter(null);
    setCategoryFilter(null);
    setSelectedTools(new Set());
    setQuery("");
  };

  const hasActiveFilters = query || difficultyFilter || categoryFilter || selectedTools.size > 0 || pdfFilter !== "All";

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 40) return;

    recordFunnelEvent("gallery_navigate");
    if (deltaX < 0) {
      goGallery(1);
    } else {
      goGallery(-1);
    }
  };

  const currentGalleryShot =
    gallery && gallery.screenshots.length
      ? gallery.screenshots[gallery.index]
      : null;

  useEffect(() => {
    let isMounted = true;
    const MIN_READY_DELAY_MS = 120;

    const waitForWindowLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_READY_DELAY_MS);
    });

    const bootstrap = async () => {
      await waitForWindowLoad;
      await minDelay;

      if (!isMounted) return;
      window.requestAnimationFrame(() => {
        if (isMounted) setIsPageReady(true);
      });
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main id="main-content" className={styles.page} style={{ position: "relative" }}>
      <LoadingScreen isLoading={!isPageReady} />

      <div
        style={{
          opacity: isPageReady ? 1 : 0,
          pointerEvents: isPageReady ? "auto" : "none",
          minHeight: isPageReady ? "auto" : "100vh",
          overflow: isPageReady ? "visible" : "hidden",
        }}
      >
        <AnimatedBackground />
        <VisualModeToggle />

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
              <Link
                href="/"
                className={`${styles.secondaryAction} ${styles.backAction}`}
              >
                Back To Portfolio
              </Link>
            </div>

            <nav className={styles.quickLinks} aria-label="Quick section shortcuts">
              <a href="#blog-pdfs-title" className={styles.quickLink}>
                PDF Cases
              </a>
              <a href="#blog-playlists-title" className={styles.quickLink}>
                Playlists
              </a>
              <a href="#blog-videos-title" className={styles.quickLink}>
                Videos
              </a>
              <a href="#youtube-hub-title" className={styles.quickLink}>
                YouTube Hub
              </a>
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

      <section className={styles.block} aria-labelledby="blog-pdfs-title">
        <div className={styles.blockHeading}>
          <h2 id="blog-pdfs-title">PDF Library</h2>
          <p>{filteredPdfs.length} result(s) found.</p>
        </div>

        {leadCase ? (
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
                    <button
                      key={tag}
                      type="button"
                      className={styles.tagButton}
                      onClick={() => setQuery(tag)}
                      title={`Search for ${tag}`}
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
                        title={`Filter by ${tool}`}
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
                  rel="noreferrer"
                  className={styles.viewAction}
                  onClick={() => recordFunnelEvent("pdf_view_click")}
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
                      caseScreenshotsByEvidenceId[leadCase.id] ?? [],
                      0
                    )
                  }
                  className={`${styles.galleryOpenAction} ${styles.viewAction}`}
                >
                  View All Screenshots
                </button>
              </div>
            </div>
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
          </article>
        ) : null}

        <div className={styles.pdfGrid}>
          {visiblePdfCards.map((item, idx) => {
            const href = normalizePublicHref(item.href);
            const screenshots = caseScreenshotsByEvidenceId[item.id] ?? [];
            const hasScreenshots = screenshots.length > 0;
            // Only show up to 2 screenshots per card for performance

            // Helper to get thumbnail path for a screenshot
            const getThumbnail = (imgPath: string) => {
              if (!imgPath) return imgPath;
              // e.g. Assets/Cases/BruteForce_Room/Screenshot (228).png => Assets/Cases/thumbnails/BruteForce_Room__Screenshot (228).webp
              const rel = imgPath.replace(/^Assets\/Cases\//, "").replace(/[\\/]/g, "__").replace(/\.(png|jpg|jpeg)$/i, ".webp");
              return `Assets/Cases/thumbnails/${rel}`;
            };

            const cardScreenshots = screenshots.slice(0, 2);
            const extraScreenshotsCount = Math.max(0, screenshots.length - 2);
            const primaryScreenshot = cardScreenshots[0];
            const secondaryScreenshot = cardScreenshots[1];

            return (
              <article
                key={item.id}
                className={[
                  styles.pdfCard,
                  hasScreenshots ? styles.caseCardLarge : "",
                  styles.fadeInUp
                ].join(" ")}
                style={{ animationDelay: `${0.08 * idx + 0.1}s` }}
              >
                <div className={styles.caseCardHead}>
                  <p className={styles.badge}>{item.type}</p>
                  {hasScreenshots ? (
                    <span className={styles.shotCount}>{screenshots.length} screenshots</span>
                  ) : null}
                </div>

                <h3
                  className={styles.cardTitle}
                  tabIndex={0}
                  aria-label={item.title}
                  onFocus={e => e.currentTarget.classList.add(styles.cardTitle)}
                  onBlur={e => e.currentTarget.classList.remove(styles.cardTitle)}
                >
                  {item.title}
                  <span className={styles.cardTooltip}>{item.description || "No description available."}</span>
                </h3>
                {item.description && <p className={styles.cardDescription}>{item.description}</p>}
                <p className={styles.cardPlatform}>{item.platform}</p>

                <div className={styles.caseMetadata}>
                  {item.difficulty && (
                    <span className={`${styles.badge} ${styles[`difficulty-${item.difficulty.toLowerCase()}`]}`}>{item.difficulty}</span>
                  )}
                  {item.category && <span className={styles.badge}>{item.category}</span>}
                  {item.readTime && <span className={styles.badge}>{item.readTime} min</span>}


                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className={styles.tagsListInline}>
                    {item.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagButtonSmall}
                        onClick={() => setQuery(tag)}
                        title={`Search for ${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                    {item.tags.length > 3 && <span className={styles.moreTagsBadge}>+{item.tags.length - 3}</span>}
                  </div>
                )}

                {item.tools && item.tools.length > 0 && (
                  <div className={styles.toolsListCompact}>
                    {item.tools.slice(0, 2).map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        className={styles.toolButtonSmall}
                        onClick={() => toggleToolFilter(tool)}
                        title={`Filter by ${tool}`}
                      >
                        {tool}
                      </button>
                    ))}
                    {item.tools.length > 2 && <span className={styles.moreToolsBadge}>+{item.tools.length - 2}</span>}
                  </div>
                )}

                {primaryScreenshot ? (
                  <div className={styles.screenshotArea}>
                    <a
                      href={normalizePublicHref(primaryScreenshot)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.primaryShot}
                      aria-label={`Open main screenshot for ${item.title}`}
                    >
                      <Image
                        src={normalizePublicHref(getThumbnail(primaryScreenshot))}
                        alt={`${item.title} main screenshot`}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 991px) 70vw, 40vw"
                        loading="lazy"
                        onError={(e) => {
                          // fallback to original if thumbnail missing
                          (e.target as HTMLImageElement).src = normalizePublicHref(primaryScreenshot);
                        }}
                      />
                    </a>

                    {secondaryScreenshot ? (
                      <div className={styles.shotGrid}>
                        <a
                          key={`${item.id}-shot-${secondaryScreenshot}`}
                          href={normalizePublicHref(secondaryScreenshot)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.shotThumb}
                          aria-label={`Open screenshot 2 for ${item.title}`}
                        >
                          <Image
                            src={normalizePublicHref(getThumbnail(secondaryScreenshot))}
                            alt={`${item.title} screenshot 2`}
                            fill
                            sizes="(max-width: 560px) 45vw, 18vw"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = normalizePublicHref(secondaryScreenshot);
                            }}
                          />
                        </a>
                        {extraScreenshotsCount > 0 ? (
                          <span className={styles.moreShotsBadge}>+{extraScreenshotsCount}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.cardActions}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.viewAction}
                    onClick={() => recordFunnelEvent("pdf_view_click")}
                  >
                    View PDF
                  </a>
                  <a href={href} download className={styles.downloadAction}>
                    Download
                  </a>
                  {hasScreenshots ? (
                    <button
                      type="button"
                      onClick={() => openGallery(item.title, screenshots, 0)}
                      className={`${styles.galleryOpenAction} ${styles.viewAction}`}
                    >
                      View All Screenshots
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {filteredPdfs.length === 0 ? (
          <p className={styles.emptyState}>No PDF results match your current search/filter.</p>
        ) : null}
      </section>

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

      <section className={styles.youtubeHub} aria-labelledby="youtube-hub-title">
        <div className={styles.blockHeading}>
          <h2 id="youtube-hub-title">YouTube Hub</h2>
          <p>
            All channel content is grouped here at the end: featured, playlists,
            and latest videos.
          </p>
        </div>
        <div className={styles.youtubeHubActions}>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className={`${styles.primaryAction} ${styles.channelAction}`}
          >
            Open YouTube Channel
          </a>
        </div>
      </section>

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

        {filteredPlaylists.length === 0 ? (
          <p className={styles.emptyState}>No playlist results match your current search.</p>
        ) : null}
      </section>

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

        {filteredVideos.length === 0 ? (
          <p className={styles.emptyState}>No video results match your current search.</p>
        ) : null}
      </section>

      {gallery && currentGalleryShot ? (
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
            onClick={(event) => event.stopPropagation()}
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
              <button
                type="button"
                className={styles.galleryNav}
                onClick={() => {
                  recordFunnelEvent("gallery_navigate");
                  goGallery(-1);
                }}
                aria-label="Previous screenshot"
              >
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

              <button
                type="button"
                className={styles.galleryNav}
                onClick={() => {
                  recordFunnelEvent("gallery_navigate");
                  goGallery(1);
                }}
                aria-label="Next screenshot"
              >
                Next
              </button>
            </div>

            <div className={styles.galleryThumbs}>
              {gallery.screenshots.map((shot, index) => {
                const isActive = index === gallery.index;
                return (
                  <button
                    key={`${gallery.title}-${shot}`}
                    type="button"
                    className={
                      isActive
                        ? `${styles.galleryThumbButton} ${styles.activeGalleryThumb}`
                        : styles.galleryThumbButton
                    }
                    onClick={() => {
                      recordFunnelEvent("gallery_navigate");
                      setGallery({ ...gallery, index });
                    }}
                    aria-label={`Open screenshot ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <section className={styles.blogClosing} aria-labelledby="blog-closing-title">
        <div>
          <span className={styles.blogClosingKicker}>Final note</span>
          <h2 id="blog-closing-title">If you want the full story, start with the PDF archive and continue with the videos.</h2>
          <p>
            The blog is structured like a field notebook: short entry points, deeper evidence, and a direct path back to the portfolio.
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

      <DesktopQuickCTA />
      <MobileQuickActions />
      </div>
    </main>
  );
}

// Back to Top Button component (must be outside BlogPageClient)
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
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

