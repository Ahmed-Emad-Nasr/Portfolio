"use client";

/*
 * components/cases/CaseLibrarySection.tsx — the case library, as the last
 * sections of the one-page portfolio (#cases, then #videos).
 *
 * State lives here (filters synced to the URL, the screenshot lightbox,
 * which video embeds were activated); the pieces only render. The cards
 * are paged — six at a time — so the home page does not mount 75 tilt
 * cards at once; filtering always searches the whole library.
 */

import dynamic from "next/dynamic";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { blogYoutubeVideos, blogYoutubePlaylists, blogFeaturedYoutubeVideo, YOUTUBE_CHANNEL_URL } from "@/app/core/config/youtube";
import SectionHeader from "@/app/core/components/SectionHeader";
import SectionDivider from "@/app/core/components/SectionDivider";
import { ChevronDown } from "lucide-react";
import { formatDate, normalizePublicHref } from "@/app/blog/blog-utils";
import type { PdfResource, GalleryState } from "@/app/blog/blog-types";
import CaseFilters, { type Facet } from "./CaseFilters";
import CaseCard from "./CaseCard";
import { CounterBadge, KanjiWatermark } from "@/app/components/shared/kit";

const MediaSections = dynamic(() => import("./MediaSections"));
const PAGE = 6;
const NO_SHOTS: string[] = [];
const GalleryLightbox = dynamic(() => import("@/app/components/art-gallery/GalleryLightbox"), { ssr: false });

type CaseLibrarySectionProps = {
  startHere?: React.ReactNode;
  sortedPdfs: PdfResource[];
  screenshotsById: Record<string, string[]>;
  categoryFacets: Facet[];
  toolFacets: Facet[];
  totalCasesCount: number;
  investigationReportCount: number;
  casesWithScreenshotsCount: number;
  totalScreenshotAssets: number;
};

export default function CaseLibrarySection({
  startHere,
  sortedPdfs,
  screenshotsById,
  categoryFacets,
  toolFacets,
  totalCasesCount,
  investigationReportCount,
  casesWithScreenshotsCount,
  totalScreenshotAssets,
}: CaseLibrarySectionProps) {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [visible, setVisible] = useState(PAGE);

  const deferredQuery = useDeferredValue(query);

  /* Everything a case can be searched by, as one lowercase string — built
     here from the cards' own data rather than shipped a second time */
  const searchIndex = useMemo(
    () =>
      Object.fromEntries(
        sortedPdfs.map((item) => [
          item.id,
          [item.title, item.description, item.platform, item.type, item.category, item.difficulty, ...(item.tags ?? []), ...(item.tools ?? []), ...(item.skillsGained ?? [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        ]),
      ) as Record<string, string>,
    [sortedPdfs],
  );

  const isFiltering =
    deferredQuery.trim() !== "" || activeCategory !== null || activeTools.length > 0;

  const visiblePdfs = useMemo(() => {
    if (!isFiltering) return sortedPdfs;

    const needle = deferredQuery.trim().toLowerCase();

    return sortedPdfs.filter((item) => {
      if (needle && !(searchIndex[item.id] ?? "").includes(needle)) return false;
      if (activeCategory && item.category !== activeCategory) return false;
      if (activeTools.length > 0) {
        const tools = item.tools ?? [];
        if (!activeTools.some((tool) => tools.includes(tool))) return false;
      }
      return true;
    });
  }, [sortedPdfs, isFiltering, deferredQuery, activeCategory, activeTools, searchIndex]);

  /* A new filter starts from the first page again */
  const toolsKey = activeTools.join(",");
  const firstFilterRun = useRef(true);
  useEffect(() => {
    /* not on mount — a #case-… deep link may already have opened more pages */
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return;
    }
    setVisible(PAGE);
  }, [deferredQuery, activeCategory, toolsKey]);

  /* Filters live in the URL (?q=…&cat=…&tools=…) so a filtered view can be
     shared and survives the back button. */
  const filtersHydrated = useRef(false);

  useEffect(() => {
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setActiveCategory(params.get("cat"));
      const tools = params.get("tools");
      setActiveTools(tools ? tools.split(",").filter(Boolean) : []);
    };

    readFromUrl();
    filtersHydrated.current = true;
    /* Arriving with a filter in the URL (a tag link on a case page): bring the library into view */
    if (window.location.search && !window.location.hash.startsWith("#case-")) {
      window.setTimeout(() => document.getElementById("cases")?.scrollIntoView({ block: "start" }), 400);
    }

    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  useEffect(() => {
    if (!filtersHydrated.current) return;

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

  const openGallery = useCallback((title: string, screenshots: string[], index = 0) => {
    if (screenshots.length) {
      setGallery({ title, screenshots, index: Math.min(Math.max(index, 0), screenshots.length - 1) });
    }
  }, []);

  /* Deep links (#case-…): the cards render after hydration, so wait for the
     target instead of letting the browser give up on the first try. */
  const hashTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#case-")) return;

    let cancelled = false;
    let attempts = 0;

    /* The target may be past the first page — open the pages up to it */
    const at = sortedPdfs.findIndex((item) => `#case-${item.id}` === hash);
    if (at >= PAGE) setVisible(Math.ceil((at + 1) / PAGE) * PAGE);

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(hash.slice(1));
      if (el) {
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
  }, [sortedPdfs]);

  const slides = useMemo(
    () =>
      (gallery?.screenshots ?? []).map((shot, i) => ({
        src: normalizePublicHref(shot),
        title: gallery?.title ?? "",
        description: `Screenshot ${i + 1} of ${gallery?.screenshots.length ?? 0}`,
      })),
    [gallery],
  );

  return (
    <>
      <section id="cases" className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden" aria-label="Case library">
        <KanjiWatermark chars="事件簿" side="right" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
            <SectionHeader
              eyebrow="Case Library // Investigations"
              japanese="事件簿"
              titleA="Case"
              titleB="Library."
              description={`${totalCasesCount} published cases — ${investigationReportCount} full investigation reports, plus write-ups and walkthroughs across SOC incidents, DFIR, malware analysis and detection engineering.`}
            />
            <div className="mb-16 md:mb-20">
              <CounterBadge value={totalCasesCount} top="Cases" bottom="Indexed" tone="accent" />
            </div>
          </div>

          {startHere}

          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
            <h2 className="text-primary text-[11px] font-mono font-bold tracking-[0.35em] uppercase">
              All cases
            </h2>
            <span className="jp-eyebrow text-[11px] text-foreground/30" lang="ja">全件</span>
          </div>

          <CaseFilters
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visiblePdfs.slice(0, visible).map((item, idx) => (
              <CaseCard
                key={item.id}
                index={idx}
                {...item}
                screenshots={screenshotsById[item.id] ?? NO_SHOTS}
                onOpenGallery={openGallery}
              />
            ))}
          </div>

          {visible < visiblePdfs.length && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((n) => Math.min(visiblePdfs.length, n + PAGE))}
                className="group flex items-center gap-3 px-8 py-4 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ChevronDown size={14} className="text-primary transition-transform duration-300 group-hover:translate-y-0.5" />
                Show more cases
                <span className="font-mono text-[10px] text-foreground/40 tabular-nums">
                  {Math.min(visible, visiblePdfs.length)}/{visiblePdfs.length}
                </span>
              </button>
            </div>
          )}

          {visiblePdfs.length === 0 && (
            <div className="relative bg-surface/60 border border-foreground/10 p-10 md:p-14 text-center">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" aria-hidden="true" />
              <p className="brush-jp text-4xl text-accent/80 mb-4" lang="ja">該当なし</p>
              <p className="font-mono text-sm text-foreground/60 tracking-wider mb-4">No case matches these filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <SectionDivider text="報告 • 証拠 • 調査 • 記録" reverse angle={-1.5} />

      <div id="videos" className="px-6 md:px-20 pt-16 bg-background">
        <div className="max-w-7xl mx-auto">
          <MediaSections
            totalCasesCount={totalCasesCount}
            casesWithScreenshotsCount={casesWithScreenshotsCount}
            totalScreenshotAssets={totalScreenshotAssets}
            videos={channelVideos}
            playlists={blogYoutubePlaylists}
            fallbackThumbId={blogFeaturedYoutubeVideo.videoId}
            activeEmbeds={activeEmbeds}
            onActivateEmbed={(k: string) => setActiveEmbeds((c) => ({ ...c, [k]: true }))}
            formatDate={formatDate}
            youtubeChannelUrl={YOUTUBE_CHANNEL_URL}
          />
        </div>
      </div>

      {gallery && (
        <GalleryLightbox
          open
          close={() => setGallery(null)}
          index={gallery.index}
          slides={slides}
        />
      )}
    </>
  );
}
