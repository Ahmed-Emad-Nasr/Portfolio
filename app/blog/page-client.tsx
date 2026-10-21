"use client";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState, useEffect, useRef, useDeferredValue } from "react";
import { blogYoutubeVideos, blogYoutubePlaylists, blogFeaturedYoutubeVideo, YOUTUBE_CHANNEL_URL } from "@/app/core/config/youtube";
import { caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import styles from "./page.module.css";
import { formatDate, normalizePublicHref } from "./blog-utils";
import type { PdfResource, GalleryState } from "./blog-types";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import BlogFilterBar, { type Facet } from "./components/BlogFilterBar";

// FIX: every one of these was `ssr: false`, so the exported /blog/index.html
// contained NO case studies, NO titles, NO links — an empty shell. All the
// CollectionPage + DigitalDocument JSON-LD in page.tsx described content that
// was not in the HTML. Dropping `ssr: false` keeps the code-splitting (the JS
// still loads as a separate chunk) while prerendering the markup at build time.
import AppBar from "./blog_header/sensei-header";
import BlogPdfLibrarySection from "./components/BlogPdfLibrarySection";

const BlogMediaSections = dynamic(() => import("./components/BlogMediaSections"));
const KanjiDivider = dynamic(() => import("@/app/core/components/KanjiDivider"));
// The modal genuinely never renders on load — ssr:false is correct HERE.
const BlogGalleryModal = dynamic(() => import("./components/BlogGalleryModal"), { ssr: false });

/*
 * `startHere` arrives pre-rendered from page.tsx (a Server Component). If this file
 * imported the component directly it would become a client component and bundle the case
 * library into the browser bundle — the same reason the ATT&CK map is passed as a prop
 * on the home page.
 *
 * sortedPdfs / searchIndex / categoryFacets / toolFacets and the three counter
 * numbers are all computed in page.tsx at build time now — previously they were
 * computed here (in the browser) on every page load. caseScreenshotsByEvidenceId
 * is still imported here directly because the gallery needs the actual image paths at
 * interaction time, not just numbers.
 */
type BlogPageClientProps = {
  startHere?: React.ReactNode;
  sortedPdfs: PdfResource[];
  searchIndex: Record<string, string>;
  categoryFacets: Facet[];
  toolFacets: Facet[];
  totalCasesCount: number;
  casesWithScreenshotsCount: number;
  totalScreenshotAssets: number;
  cvResourceId: string;
};

export default function BlogPageClient({
  startHere,
  sortedPdfs,
  searchIndex,
  categoryFacets,
  toolFacets,
  totalCasesCount,
  casesWithScreenshotsCount,
  totalScreenshotAssets,
  cvResourceId,
}: BlogPageClientProps) {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});

  // ── Filter state ────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([]);

  // useDeferredValue: typing in the field stays instant even if re-rendering the cards
  // lags by a frame or two. Cheaper and more accurate than a manual debounce.
  const deferredQuery = useDeferredValue(query);

  const isFiltering =
    deferredQuery.trim() !== "" || activeCategory !== null || activeTools.length > 0;

  const visiblePdfs = useMemo(() => {
    if (!isFiltering) return sortedPdfs;

    const needle = deferredQuery.trim().toLowerCase();

    return sortedPdfs.filter((item) => {
      // The CV isn't a case — it disappears as soon as you start filtering so it doesn't take a result slot
      if (item.id === cvResourceId) return false;

      if (needle && !(searchIndex[item.id] ?? "").includes(needle)) return false;
      if (activeCategory && item.category !== activeCategory) return false;

      // OR within the same filter: "show me the ones with Wazuh or Volatility"
      if (activeTools.length > 0) {
        const tools = item.tools ?? [];
        if (!activeTools.some((tool) => tools.includes(tool))) return false;
      }

      return true;
    });
  }, [sortedPdfs, isFiltering, deferredQuery, activeCategory, activeTools, searchIndex, cvResourceId]);

  // ── Sync filters with the URL ───────────────────────────────────────────
  // We deliberately don't use useSearchParams / router.replace: the former forces a Suspense
  // boundary and takes the page out of the full static export, and the latter
  // re-renders the whole tree on every keystroke. history.replaceState does the same job
  // without either of those.
  const filtersHydrated = useRef(false);

  useEffect(() => {
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setActiveCategory(params.get("cat"));
      const tools = params.get("tools");
      setActiveTools(tools ? tools.split(",").filter(Boolean) : []);
    };

    // We read after mount, not during render: the HTML built on the server
    // has no filters, so starting from a filtered state would cause a hydration mismatch.
    readFromUrl();
    filtersHydrated.current = true;

    // The browser's back button must restore the filters that were active
    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  useEffect(() => {
    if (!filtersHydrated.current) return;

    // debounce: Safari limits the number of replaceState calls per minute, and writing on
    // every keystroke easily hits that limit.
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (activeCategory) params.set("cat", activeCategory);
      if (activeTools.length) params.set("tools", activeTools.join(","));

      const search = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, activeCategory, activeTools]);

  const toggleTool = useCallback((tool: string) => {
    setActiveTools((current) =>
      current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setActiveCategory(null);
    setActiveTools([]);
  }, []);

  const channelVideos = useMemo(() => {
    const featured = { ...blogFeaturedYoutubeVideo, sourceUrl: blogFeaturedYoutubeVideo.sourceUrl };
    const others = blogYoutubeVideos.map((v) => ({ ...v, sourceUrl: `https://youtu.be/${v.videoId}` }));
    return [featured, ...others];
  }, []);

  const goGallery = useCallback((delta: number) => {
    setGallery((cur) => cur ? { ...cur, index: (cur.index + delta + cur.screenshots.length) % cur.screenshots.length } : null);
  }, []);

  const openGallery = useCallback((title: string, screenshots: string[], index = 0) => {
    if (screenshots.length) setGallery({ title, screenshots, index: Math.min(Math.max(index, 0), screenshots.length - 1) });
  }, []);

  /*
   * PERF: the "scroll blur" overlay lived here — a scroll listener toggling a
   * full-screen backdrop-filter (blur + saturate) between the animated
   * background and the content. Measured on the built site, that one layer
   * plus the card blurs cut the blog to ~28 frames per scroll pass on a fast
   * desktop (vs ~140 without), because every backdrop-filter forces the
   * compositor to re-render everything behind it on every frame the
   * background moves. The visual difference with it removed: an average of
   * ~1 brightness level out of 255 — the bubbles are soft gradients already,
   * blurring them by 4px changes nothing you can see. So it went, listener
   * and all.
   */

  // ── Deep link (#case-<id>) ──────────────────────────────────────────────
  // The browser tries to jump to the hash before the cards are mounted, so it silently fails.
  // We retry until the element appears, and stop after exactly 2 seconds instead of
  // searching for a broken link forever.
  const hashTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#case-")) return;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // The header offset is handled by scroll-margin-top in BlogCard.module.css
        el.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
      if (attempts++ < 20) hashTimer.current = window.setTimeout(tryScroll, 100);
    };

    hashTimer.current = window.setTimeout(tryScroll, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(hashTimer.current);
    };
  }, []);

  return (
    <main id="main-content" className={styles.page}>
      <LoadingScreen />
      <AppBar />
      
      {/* A short reading path before the full library: 38 reports in a single list
          overwhelm whoever opens it, and most people opening this page have five minutes. */}
      {startHere}

      <BlogPdfLibrarySection
        visiblePdfCards={visiblePdfs}
        screenshotsById={caseScreenshotsByEvidenceId}
        openGallery={openGallery} 
        normalizeHref={normalizePublicHref}
        leadCase={null}
        leadCaseSpotlightImage={null}
        filterBar={
          <BlogFilterBar
            query={query}
            onQueryChange={setQuery}
            categories={categoryFacets}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            tools={toolFacets}
            activeTools={activeTools}
            onToolToggle={toggleTool}
            resultCount={visiblePdfs.length}
            totalCount={totalCasesCount}
            onReset={resetFilters}
          />
        }
        onResetFilters={resetFilters}
        isFiltering={isFiltering}
      />

      <KanjiDivider text="Reports • Screenshots • Investigation • Evidence" reverse angle={-1.2} />
      
      <BlogMediaSections
        totalCasesCount={totalCasesCount} 
        casesWithScreenshotsCount={casesWithScreenshotsCount}
        totalScreenshotAssets={totalScreenshotAssets}
        filteredChannelVideos={channelVideos} 
        filteredPlaylists={blogYoutubePlaylists}
        featuredVideo={blogFeaturedYoutubeVideo} activeEmbeds={activeEmbeds}
        onActivateEmbed={(k: string) => setActiveEmbeds(c => ({...c, [k]: true}))}
        formatDate={formatDate} youtubeChannelUrl={YOUTUBE_CHANNEL_URL}
      />
      {gallery && <BlogGalleryModal gallery={gallery} currentShot={gallery.screenshots[gallery.index] ? normalizePublicHref(gallery.screenshots[gallery.index]) : null} setGallery={setGallery} goGallery={goGallery} />}
    </main>
  );
}
