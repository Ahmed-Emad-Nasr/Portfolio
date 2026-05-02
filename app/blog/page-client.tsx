"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import MotionInView from "@/app/core/components/MotionInView";
import {
  blogFeaturedYoutubeVideo,
  blogYoutubePlaylists,
  blogYoutubeVideos,
  caseEvidenceLibrary,
  YOUTUBE_CHANNEL_URL,
} from "@/app/core/data";
import AppBar from "@/app/components/blog_header/sensei-header";
import BlogCard from "./BlogCard";
import HomeSection from "@/app/components/blog_home/sensei-home";

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

// ─── Module-level constants ───────────────────────────────────────────────────

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
  autopsy: Array.from({ length: 13 }, (_, i) => `Assets/Cases/Autopsy/${i + 1}.png`),
  "data-exfiltration-investigation": Array.from({ length: 37 }, (_, i) => `Assets/Cases/Data Exfiltiration Investigation/${i + 1}.png`),
  "aws-guardduty-setup": Array.from({ length: 9 }, (_, i) => `Assets/Cases/AWS-GaurdDuty/${i + 1}.png`),
  "aws-athena-healthcare": Array.from({ length: 16 }, (_, i) => `Assets/Cases/Amazon S3 and Amazon Athena/${i + 1}.png`),
  "aws-kms-security": Array.from({ length: 25 }, (_, i) => `Assets/Cases/AWS KMS/${i + 1}.png`),
  "soc-env-depi-r3-project": [
    "Assets/Cases/SOC Enviroment DEPI R3 Project/1.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/2.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/3.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/4.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/5.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/6.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/7.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/8.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/9.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/create txt file to see if fim is working.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard1.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/CustomDashboard2.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/edit ossec on win.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/enable fim to folder ahmed.png",
    "Assets/Cases/SOC Enviroment DEPI R3 Project/it works and event appeard .png",
  ],
  "depi-r4-project": [
    "Assets/Cases/Depi R4 Project/Gemini_Generated_Image_sz9r8zsz9r8zsz9r (1).png",
  ],
  "lockbit-ransomware-forensics": Array.from({ length: 18 }, (_, i) => `Assets/Cases/LockBit/Screenshot (${85 + i}).png`),
  "serpent-stealer": Array.from({ length: 12 }, (_, i) => `Assets/Cases/Serpent Stealer/Screenshot (${135 + i}).png`),
  imagestegano: [
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
    "Assets/Cases/ImageStegano/Screenshot (120).png",
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

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const normalizePublicHref = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  const basePath = process.env.NODE_ENV === "production" ? "/Portfolio" : "";
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${basePath}${normalized}`.replace(/\/\//g, "/");
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

// Simple case-insensitive match
const matchesSearch = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.toLowerCase());

// Stable empty array ref — keeps React.memo working correctly
const EMPTY_SCREENSHOTS: string[] = [];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogPageClient() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");           // debounced
  const [pdfFilter, setPdfFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "popularity" | "difficulty">("recent");

  // ── Gallery state ─────────────────────────────────────────────────────────
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const galleryDialogRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // ── Embeds (lazy iframes) ────────────────────────────────────────────────
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});

  // ── Debounce search input (300 ms) ────────────────────────────────────────
  // Reduces filter re-computation on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // ── Filter options (stable, derived once) ────────────────────────────────

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

  const leadCase = useMemo(
    () => blogPdfResources.find((item) => item.id === wannacryId) ?? null,
    []
  );

  const visiblePdfCards = useMemo(
    () => (leadCase ? sortedPdfs.filter((item) => item.id !== leadCase.id) : sortedPdfs),
    [sortedPdfs, leadCase]
  );

  // ── Video / playlist filter ───────────────────────────────────────────────

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

  // ── Stats (computed once, stable) ────────────────────────────────────────

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

  // Keyboard & focus trap for gallery
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

  const currentGalleryShot =
    gallery && gallery.screenshots.length ? gallery.screenshots[gallery.index] : null;

  const caseOrder = useMemo(() => blogPdfResources.filter((item) => item.id !== cvResource.id), []);
  const leadCaseIndex = caseOrder.findIndex((item) => item.id === leadCase?.id);
  const previousCase = leadCaseIndex > 0 ? caseOrder[leadCaseIndex - 1] : null;
  const nextCase = leadCaseIndex >= 0 && leadCaseIndex < caseOrder.length - 1 ? caseOrder[leadCaseIndex + 1] : null;
  const relatedCases = useMemo(() => {
    if (!leadCase) return [];

    const leadTags = new Set(leadCase.tags ?? []);

    return caseOrder
      .filter((item) => item.id !== leadCase.id)
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
  }, [caseOrder, leadCase]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <main id="main-content" className={styles.page}>
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
                    <span className={styles.embedPlayButton}>▶ Play</span>
                  </button>
                )}
              </div>
              <div className={styles.featuredContent}>
                <p className={styles.featuredTag}>Featured Video</p>
                <h3>{featuredVideo.title}</h3>
                <a href={featuredVideo.sourceUrl} target="_blank" rel="noreferrer">
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
                <a href={normalizePublicHref(previousCase.href)} target="_blank" rel="noreferrer">
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
            <a href={normalizePublicHref(leadCase.href)} target="_blank" rel="noreferrer">
              Open Featured PDF
            </a>
          </article>

          <article className={styles.caseNavCard}>
            <span className={styles.caseNavLabel}>Next case</span>
            {nextCase ? (
              <>
                <h3>{nextCase.title}</h3>
                <p>{nextCase.category ?? nextCase.platform}</p>
                <a href={normalizePublicHref(nextCase.href)} target="_blank" rel="noreferrer">
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
                  rel="noreferrer"
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
                  quality={10}
                  placeholder="blur"
                  blurDataURL="/Assets/art-gallery/Images/logo/My_Logo.webp"
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
                  <a href={normalizePublicHref(item.href)} target="_blank" rel="noreferrer">
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
            <MotionInView key={item.id}>
              <BlogCard
                {...item}
                screenshots={caseScreenshotsByEvidenceId[item.id] ?? EMPTY_SCREENSHOTS}
                onOpenGallery={openGallery}
                onTagClick={setRawQuery}
                onToolClick={toggleToolFilter}
                getThumbnail={getThumbnail}
                normalizeHref={normalizePublicHref}
              />
            </MotionInView>
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
      <MotionInView className={styles.youtubeHub} aria-labelledby="youtube-hub-title">
        <div className={styles.blockHeading}>
          <h2 id="youtube-hub-title">YouTube Hub</h2>
          <p>All channel content grouped here: featured, playlists, and latest videos.</p>
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
      </MotionInView>

      {/* ── Playlists ─────────────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="blog-playlists-title">
        <MotionInView className={styles.blockHeading}>
          <h2 id="blog-playlists-title">YouTube Playlists</h2>
          <p>{filteredPlaylists.length} playlist(s) found.</p>
        </MotionInView>
        <div className={styles.playlistGrid}>
          {filteredPlaylists.map((playlist) => (
            <MotionInView key={playlist.playlistId}>
              <article className={styles.playlistCard}>
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
                  rel="noreferrer"
                  className={styles.playlistAction}
                >
                  Open Playlist
                </a>
              </article>
            </MotionInView>
          ))}
        </div>
        {filteredPlaylists.length === 0 && (
          <p className={styles.emptyState}>No playlist results match your current search.</p>
        )}
      </section>

      {/* ── Videos ────────────────────────────────────────────────────────── */}
      <section className={styles.block} aria-labelledby="blog-videos-title">
        <MotionInView className={styles.blockHeading}>
          <h2 id="blog-videos-title">YouTube Videos</h2>
          <p>{filteredVideos.length} result(s) found.</p>
        </MotionInView>
        <div className={styles.videoGrid}>
          {filteredVideos.map((video) => (
            <MotionInView key={video.videoId}>
              <article className={styles.videoCard}>
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
                      <span className={styles.embedPlayButton}>▶ Play Video</span>
                    </button>
                  )}
                </div>
                <div className={styles.videoCardContent}>
                  <h3>{video.title}</h3>
                  <p className={styles.videoDate}>{formatDate(video.publishedAt)}</p>
                </div>
              </article>
            </MotionInView>
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
                  quality={75}
                  placeholder="blur"
                  blurDataURL="/Assets/art-gallery/Images/logo/My_Logo.webp"
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
            rel="noreferrer"
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