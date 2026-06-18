"use client";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { blogYoutubeVideos, blogYoutubePlaylists, blogFeaturedYoutubeVideo, YOUTUBE_CHANNEL_URL } from "@/app/core/data/youtube";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/data/cases";
import styles from "./page.module.css";
import { formatDate, normalizePublicHref } from "./blog-utils";
import type { PdfResource, GalleryState, ChannelVideo } from "./blog-types";

// Dynamic Imports (خفيفة وبدون aria أو roles)
const BlogHeroSection = dynamic(() => import("./components/BlogHeroSection"), { ssr: false });
const BlogCaseNavigator = dynamic(() => import("./components/BlogCaseNavigator"), { ssr: false });
const BlogPdfLibrarySection = dynamic(() => import("./components/BlogPdfLibrarySection"), { ssr: false });
const BlogMediaSections = dynamic(() => import("./components/BlogMediaSections"), { ssr: false });
const BlogGalleryModal = dynamic(() => import("./components/BlogGalleryModal"), { ssr: false });
const AppBar = dynamic(() => import("@/app/components/blog_header/sensei-header"), { ssr: false });

const cvResource: PdfResource = { id: "soc-analyst-cv", title: "Ahmed Emad Nasr SOC Analyst CV", platform: "Professional Profile", type: "PDF CV", href: "Assets/cv/AhmedEmadNasr_CV.pdf" };
const wannacryId = "malware-analysis-wannacry";
const wannacryCase = caseEvidenceLibrary.find((item) => item.id === wannacryId);
const blogPdfResources: PdfResource[] = wannacryCase ? [cvResource, wannacryCase, ...caseEvidenceLibrary.filter(item => item.id !== wannacryId)] : [cvResource, ...caseEvidenceLibrary];

const matchesSearch = (value: string, query: string): boolean => value.toLowerCase().includes(query.toLowerCase());

// ثوابت مستخرجة لتخفيف الـ Renders
const PDF_TYPE_FILTERS = ["All", ...Array.from(new Set(blogPdfResources.map((item) => item.type)))];
const DIFFICULTY_OPTIONS = Array.from(new Set(blogPdfResources.map((item) => item.difficulty).filter(Boolean))) as string[];
const CATEGORY_OPTIONS = Array.from(new Set(blogPdfResources.map((item) => item.category).filter(Boolean))) as string[];
const LEAD_CASE = blogPdfResources.find((item) => item.id === wannacryId) ?? null;
const CASE_ORDER = blogPdfResources.filter((item) => item.id !== cvResource.id);
const _leadIdx = CASE_ORDER.findIndex((item) => item.id === LEAD_CASE?.id);
const PDF_DATE_MS = new Map(blogPdfResources.map((item) => [item.id, item.date ? new Date(item.date).getTime() : 0]));

export default function BlogPageClient() {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [pdfFilter, setPdfFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"recent" | "popularity" | "difficulty">("recent");
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [featuredPosterSrc, setFeaturedPosterSrc] = useState(`https://i.ytimg.com/vi/${blogFeaturedYoutubeVideo.videoId}/hqdefault.jpg`);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

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
        item.platform.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        (item.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [pdfFilter, difficultyFilter, categoryFilter, selectedTools, query]);

  const sortedPdfs = useMemo(() => {
    const diffMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
    return [...filteredPdfs].sort((a, b) => {
      const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      if (aShots !== bShots) return aShots ? -1 : 1;
      if (sortBy === "recent") return (PDF_DATE_MS.get(b.id) ?? 0) - (PDF_DATE_MS.get(a.id) ?? 0);
      if (sortBy === "difficulty") return (diffMap[b.difficulty ?? ""] || 0) - (diffMap[a.difficulty ?? ""] || 0);
      return 0;
    });
  }, [filteredPdfs, sortBy]);

  const visiblePdfCards = useMemo(() => (LEAD_CASE ? sortedPdfs.filter((item) => item.id !== LEAD_CASE.id) : sortedPdfs), [sortedPdfs]);

  const filteredChannelVideos = useMemo(() => {
    const featured = { ...blogFeaturedYoutubeVideo, sourceUrl: blogFeaturedYoutubeVideo.sourceUrl };
    const others = blogYoutubeVideos.filter((v) => matchesSearch(v.title, query)).map((v) => ({ ...v, sourceUrl: `https://youtu.be/${v.videoId}` }));
    return (!query || matchesSearch(featured.title, query)) ? [featured, ...others] : others;
  }, [query]);

  const filteredPlaylists = useMemo(() => blogYoutubePlaylists.filter((p) => matchesSearch(p.title, query)), [query]);

  // Handlers مبسطة جداً
  const goGallery = useCallback((delta: number) => {
    setGallery((cur) => cur ? { ...cur, index: (cur.index + delta + cur.screenshots.length) % cur.screenshots.length } : null);
  }, []);

  const openGallery = useCallback((title: string, screenshots: string[], index = 0) => {
    if (screenshots.length) setGallery({ title, screenshots, index: Math.min(Math.max(index, 0), screenshots.length - 1) });
  }, []);

  const toggleToolFilter = useCallback((tool: string) => {
    setSelectedTools((cur) => { const next = new Set(cur); next.has(tool) ? next.delete(tool) : next.add(tool); return next; });
  }, []);

  const clearAllFilters = useCallback(() => {
    setPdfFilter("All"); setDifficultyFilter(null); setCategoryFilter(null); setSelectedTools(new Set()); setRawQuery(""); setQuery("");
  }, []);

  return (
    <main id="main-content" className={styles.page}>
      <AppBar />
      <BlogHeroSection
        leadCaseTitle={LEAD_CASE?.title} resourceCount={blogPdfResources.length}
        featuredVideo={blogFeaturedYoutubeVideo} featuredPosterSrc={featuredPosterSrc}
        setFeaturedPosterSrc={setFeaturedPosterSrc} activeEmbeds={activeEmbeds}
        onActivateEmbed={(k: string) => setActiveEmbeds(c => ({...c, [k]: true}))}
      />
      <BlogCaseNavigator
        leadCase={LEAD_CASE} previousCase={_leadIdx > 0 ? CASE_ORDER[_leadIdx - 1] : null}
        nextCase={_leadIdx >= 0 && _leadIdx < CASE_ORDER.length - 1 ? CASE_ORDER[_leadIdx + 1] : null}
        normalizeHref={normalizePublicHref}
      />
      <BlogPdfLibrarySection
        filteredCount={filteredPdfs.length} pdfTypeFilters={PDF_TYPE_FILTERS}
        pdfFilter={pdfFilter} setPdfFilter={setPdfFilter} difficultyOptions={DIFFICULTY_OPTIONS}
        difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter}
        categoryOptions={CATEGORY_OPTIONS} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        sortBy={sortBy} setSortBy={setSortBy} hasActiveFilters={Boolean(rawQuery || difficultyFilter || categoryFilter || selectedTools.size > 0 || pdfFilter !== "All")}
        clearAllFilters={clearAllFilters} leadCase={LEAD_CASE}
        leadCaseSpotlightImage={LEAD_CASE && caseScreenshotsByEvidenceId[LEAD_CASE.id]?.[0] ? normalizePublicHref(caseScreenshotsByEvidenceId[LEAD_CASE.id][0]) : null}
        relatedCases={[]} visiblePdfCards={visiblePdfCards} screenshotsById={caseScreenshotsByEvidenceId}
        rawQuery={rawQuery} setRawQuery={setRawQuery} toggleToolFilter={toggleToolFilter}
        openGallery={openGallery} normalizeHref={normalizePublicHref}
      />
      <BlogMediaSections
        totalCasesCount={caseEvidenceLibrary.length} casesWithScreenshotsCount={caseEvidenceLibrary.filter(i => (caseScreenshotsByEvidenceId[i.id] ?? []).length > 0).length}
        totalScreenshotAssets={Object.values(caseScreenshotsByEvidenceId).reduce((sum, shots) => sum + shots.length, 0)}
        filteredChannelVideos={filteredChannelVideos} filteredPlaylists={filteredPlaylists}
        featuredVideo={blogFeaturedYoutubeVideo} activeEmbeds={activeEmbeds}
        onActivateEmbed={(k: string) => setActiveEmbeds(c => ({...c, [k]: true}))}
        formatDate={formatDate} youtubeChannelUrl={YOUTUBE_CHANNEL_URL}
      />
      {gallery && <BlogGalleryModal gallery={gallery} currentShot={gallery.screenshots[gallery.index] ? normalizePublicHref(gallery.screenshots[gallery.index]) : null} setGallery={setGallery} goGallery={goGallery} />}
    </main>
  );
}