"use client";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import Link from "next/link";
import dynamic from "next/dynamic";
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
} from "@/app/core/data/cases";
import styles from "./page.module.css";
import MotionInView from "@/app/core/components/MotionInView";
import { formatDate, normalizePublicHref } from "./blog-utils";
import type { PdfResource, GalleryState, ChannelVideo } from "./blog-types";

const BlogHeroSection = dynamic(() => import("./components/BlogHeroSection"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={HERO_PLACEHOLDER_STYLE} />,
});

const BlogCaseNavigator = dynamic(() => import("./components/BlogCaseNavigator"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={NAV_PLACEHOLDER_STYLE} />,
});

const BlogPdfLibrarySection = dynamic(() => import("./components/BlogPdfLibrarySection"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={PDF_PLACEHOLDER_STYLE} />,
});

const BlogMediaSections = dynamic(() => import("./components/BlogMediaSections"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={MEDIA_PLACEHOLDER_STYLE} />,
});

const BlogGalleryModal = dynamic(() => import("./components/BlogGalleryModal"), {
  ssr: false,
  loading: () => null,
});

const AppBar = dynamic(() => import("@/app/components/blog_header/sensei-header"), {
  ssr: false,
  loading: () => null,
});

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

// ─── Static derivations (computed once at module load, never recreated) ───────

// Fix #5: Were useMemo([], []) inside the component — equivalent to module-level constants.
const PDF_TYPE_FILTERS: string[] = [
  "All",
  ...Array.from(new Set(blogPdfResources.map((item) => item.type))),
];

const DIFFICULTY_OPTIONS: string[] = Array.from(
  new Set(blogPdfResources.map((item) => item.difficulty).filter((d): d is string => Boolean(d)))
);

const CATEGORY_OPTIONS: string[] = Array.from(
  new Set(blogPdfResources.map((item) => item.category).filter((c): c is string => Boolean(c)))
);

// Fix #6: Pure derivations from static data.
const CASES_WITH_SCREENSHOTS_COUNT = caseEvidenceLibrary.filter(
  (item) => (caseScreenshotsByEvidenceId[item.id] ?? []).length > 0
).length;

const TOTAL_SCREENSHOT_ASSETS = Object.values(caseScreenshotsByEvidenceId).reduce(
  (sum, shots) => sum + shots.length,
  0
);

// Fix #7: leadCase, caseOrder, navigation, and relatedCases are all static — no state dep.
const LEAD_CASE: PdfResource | null =
  blogPdfResources.find((item) => item.id === wannacryId) ?? null;

const CASE_ORDER: PdfResource[] = blogPdfResources.filter((item) => item.id !== cvResource.id);

const _leadIdx = CASE_ORDER.findIndex((item) => item.id === LEAD_CASE?.id);
const LEAD_CASE_NAVIGATION = {
  leadCaseIndex: _leadIdx,
  previousCase: _leadIdx > 0 ? CASE_ORDER[_leadIdx - 1] : null,
  nextCase:
    _leadIdx >= 0 && _leadIdx < CASE_ORDER.length - 1 ? CASE_ORDER[_leadIdx + 1] : null,
};

const _leadTags = new Set(LEAD_CASE?.tags ?? []);
const RELATED_CASES: PdfResource[] = LEAD_CASE
  ? blogPdfResources
      .filter((item) => item.id !== LEAD_CASE.id && item.id !== cvResource.id)
      .map((item) => {
        let score = 0;
        if (LEAD_CASE.category && item.category === LEAD_CASE.category) score += 3;
        if (LEAD_CASE.difficulty && item.difficulty === LEAD_CASE.difficulty) score += 1;
        score += (item.tags ?? []).filter((tag) => _leadTags.has(tag)).length * 2;
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ item }) => item)
  : [];

// Fix #9: Pre-compute date timestamps once — avoids new Date() on every sort comparator call.
const PDF_DATE_MS = new Map<string, number>(
  blogPdfResources.map((item) => [item.id, item.date ? new Date(item.date).getTime() : 0])
);

const HERO_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "28rem",
};

const NAV_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "18rem",
};

const PDF_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "52rem",
};

const MEDIA_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "42rem",
};

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

  // Fix #1: Plain function — no deps, useCallback adds overhead for nothing.
  const prefetchGalleryShots = (title: string, screenshots: string[], index = 0): void => {
    if (typeof window === "undefined" || screenshots.length === 0) return;
    screenshots.slice(index, index + 2).forEach((shot) => {
      const image = new window.Image();
      image.decoding = "async";
      image.loading = "eager";
      image.src = normalizePublicHref(shot);
      image.alt = title;
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

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
    // Fix #9: Use pre-computed timestamps from module-level map — no new Date() per comparison.
    const difficultyOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
    return [...filteredPdfs].sort((a, b) => {
      const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      if (aShots !== bShots) return aShots ? -1 : 1;
      switch (sortBy) {
        case "recent":
          return (PDF_DATE_MS.get(b.id) ?? 0) - (PDF_DATE_MS.get(a.id) ?? 0);
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

  // Fix #7: LEAD_CASE is a module-level constant — no useMemo needed.
  const leadCase = LEAD_CASE;

  const visiblePdfCards = useMemo(
    () => (leadCase ? sortedPdfs.filter((item) => item.id !== leadCase.id) : sortedPdfs),
    [sortedPdfs, leadCase]
  );

  // ── Video / playlist filter ───────────────────────────────────────────────

  const featuredVideo = blogFeaturedYoutubeVideo;

  // Fix #8: featuredVideo is module-level — only real dep is query.
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
  // Fix #8: featuredVideo is module-level — redundant primitive deps removed.
  }, [query]);

  const filteredPlaylists = useMemo(
    () => blogYoutubePlaylists.filter((p) => matchesSearch(p.title, query)),
    [query]
  );

  // ── Stats (Fix #6) ───────────────────────────────────────────────────────
  // Derived from static data — pulled to module-level constants above.
  const casesWithScreenshotsCount = CASES_WITH_SCREENSHOTS_COUNT;
  const totalScreenshotAssets = TOTAL_SCREENSHOT_ASSETS;

  // ── Gallery handlers (Fix #2, #3) ────────────────────────────────────────
  // useCallback here — these are passed as props to memoized children (BlogCard via BlogPdfLibrarySection)

  const goGallery = useCallback((delta: number): void => {
    setGallery((cur) => {
      if (!cur) return null;
      const nextIndex = (cur.index + delta + cur.screenshots.length) % cur.screenshots.length;
      return { ...cur, index: nextIndex };
    });
  }, []);

  const openGallery = useCallback((title: string, screenshots: string[], index = 0): void => {
    if (!screenshots.length) return;
    prefetchGalleryShots(title, screenshots, index);
    setGallery({
      title,
      screenshots,
      index: Math.min(Math.max(index, 0), screenshots.length - 1),
    });
  }, []);

  // ── Other handlers (Fix #4) ───────────────────────────────────────────────

  const activateEmbed = useCallback((key: string): void =>
    setActiveEmbeds((cur) => ({ ...cur, [key]: true })), []);

  const toggleToolFilter = useCallback((tool: string): void => {
    setSelectedTools((cur) => {
      const next = new Set(cur);
      next.has(tool) ? next.delete(tool) : next.add(tool);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback((): void => {
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

  // Fix #7: All navigation and related-case data is static — use module-level constants.
  const { previousCase, nextCase } = LEAD_CASE_NAVIGATION;
  const relatedCases = RELATED_CASES;

  // Stable wrapper — setRawQuery (from useState) is already stable, but wrapping
  // avoids a new function identity on every render when passed as onTagClick prop.
  const handleTagClick = useCallback((tag: string) => setRawQuery(tag), []);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <main id="main-content" className={styles.page}>
      <LoadingScreen />
      <AppBar />

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
        pdfTypeFilters={PDF_TYPE_FILTERS}
        pdfFilter={pdfFilter}
        setPdfFilter={setPdfFilter}
        difficultyOptions={DIFFICULTY_OPTIONS}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        categoryOptions={CATEGORY_OPTIONS}
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
        prefetchGallery={prefetchGalleryShots}
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

      {gallery ? (
        <BlogGalleryModal
          gallery={gallery}
          currentShot={currentGalleryShotNormalized}
          setGallery={setGallery}
          goGallery={goGallery}
        />
      ) : null}

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
    </main>
  );
}