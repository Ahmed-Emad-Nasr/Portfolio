"use client";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import MotionInView from "@/app/core/components/MotionInView";
import { getThumbnail, formatDate, normalizePublicHref } from "./blog-utils";
import type { PdfResource, GalleryState, ChannelVideo } from "./blog-types";
import BlogHeroSection from "./components/BlogHeroSection";
import BlogCaseNavigator from "./components/BlogCaseNavigator";
import BlogPdfLibrarySection from "./components/BlogPdfLibrarySection";
import BlogMediaSections from "./components/BlogMediaSections";
import BlogGalleryModal from "./components/BlogGalleryModal";

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

  const hasActiveFilters = Boolean(
    rawQuery || difficultyFilter || categoryFilter || selectedTools.size > 0 || pdfFilter !== "All"
  );

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

      <BlogHeroSection
        leadCaseTitle={leadCase?.title ?? null}
        resourceCount={blogPdfResources.length}
        featuredVideo={featuredVideo}
        featuredPosterSrc={featuredPosterSrc}
        setFeaturedPosterSrc={setFeaturedPosterSrc}
        activeEmbeds={activeEmbeds}
        onActivateEmbed={activateEmbed}
      />

      <BlogCaseNavigator
        leadCase={leadCase}
        previousCase={previousCase}
        nextCase={nextCase}
        normalizeHref={normalizePublicHref}
      />

      <BlogPdfLibrarySection
        filteredCount={filteredPdfs.length}
        pdfTypeFilters={pdfTypeFilters}
        pdfFilter={pdfFilter}
        setPdfFilter={setPdfFilter}
        difficultyOptions={difficultyOptions}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        categoryOptions={categoryOptions}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        leadCase={leadCase}
        leadCaseSpotlightImage={leadCaseSpotlightImage}
        relatedCases={relatedCases}
        visiblePdfCards={visiblePdfCards}
        screenshotsById={caseScreenshotsByEvidenceId}
        rawQuery={rawQuery}
        setRawQuery={setRawQuery}
        toggleToolFilter={toggleToolFilter}
        openGallery={openGallery}
        normalizeHref={normalizePublicHref}
      />

      <BlogMediaSections
        totalCasesCount={caseEvidenceLibrary.length}
        casesWithScreenshotsCount={casesWithScreenshotsCount}
        totalScreenshotAssets={totalScreenshotAssets}
        filteredChannelVideos={filteredChannelVideos}
        filteredPlaylists={filteredPlaylists}
        featuredVideo={featuredVideo}
        activeEmbeds={activeEmbeds}
        onActivateEmbed={activateEmbed}
        formatDate={formatDate}
        youtubeChannelUrl={YOUTUBE_CHANNEL_URL}
      />

      <BlogGalleryModal
        gallery={gallery}
        currentShot={currentGalleryShotNormalized}
        setGallery={setGallery}
        goGallery={goGallery}
      />

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
          <a href="/" className={styles.secondaryAction}>
            Back to Portfolio
          </a>
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