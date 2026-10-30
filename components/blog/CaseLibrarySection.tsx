"use client";

/*
 * The case library on the blog page (#start-here, #cases, then #videos).
 * Filters are synced to the URL; cards are paged a few at a time, while
 * filtering always searches the whole library. The data is computed at
 * build time (lib/library-data.ts) and ships with this chunk.
 */

import dynamic from "next/dynamic";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import SlashDivider from "@/components/ui/SlashDivider";
import TickerStrip from "@/components/ui/TickerStrip";
import FadeIn from "@/components/ui/FadeIn";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { normalizePublicHref, type CaseKind } from "@/lib/shared";
import type { GalleryState } from "@/lib/shared";
import CaseFilters from "@/components/blog/CaseFilters";
import StartHere from "@/components/blog/StartHere";
import { categoryFacets, kindFacets, libraryCounts, mediaById, sortedCases, toolFacets } from "@/lib/library-data";
import { scrollToHash } from "@/lib/perf/jump";
import CaseCard from "@/components/blog/CaseCard";
import CaseList from "@/components/blog/CaseList";
import { CounterBadge, KanjiWatermark } from "@/components/ui/kit";

const MediaSections = dynamic(() => import("@/components/blog/MediaSections"));
const Lightbox = dynamic(() => import("@/components/ui/Lightbox"), { ssr: false });

const PAGE = 6;
/* The full screenshot lists, fetched once on the first gallery open */
let screenshotsRequest: Promise<Record<string, string[]>> | null = null;
const loadScreenshots = () => {
  screenshotsRequest ??= fetch(normalizePublicHref("case-screenshots.json"))
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => {
      screenshotsRequest = null; // let the next click try again
      return {};
    });
  return screenshotsRequest;
};

/* Everything a case can be searched by, as one lowercase string */
const searchIndex: Record<string, string> = Object.fromEntries(
  sortedCases.map((item) => [
    item.id,
    [item.title, item.description, item.platform, item.type, item.category, item.difficulty, ...(item.tags ?? []), ...(item.tools ?? []), ...(item.skillsGained ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  ]),
);

const WSA_LAB_COUNT = sortedCases.filter((c) => c.platform === "PortSwigger").length;

export default function CaseLibrarySection() {
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [activeKind, setActiveKind] = useState<CaseKind | null>(null);
  const [sort, setSort] = useState<"recommended" | "newest">("recommended");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [visible, setVisible] = useState(PAGE);

  const deferredQuery = useDeferredValue(query);

  const isFiltering =
    deferredQuery.trim() !== "" || activeCategory !== null || activeTools.length > 0 || activeKind !== null;

  /* "Newest" re-sorts by date; "Recommended" is the build-time order */
  const orderedPdfs = useMemo(
    () => (sort === "newest" ? [...sortedCases].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")) : sortedCases),
    [sort],
  );

  const visiblePdfs = useMemo(() => {
    if (!isFiltering) return orderedPdfs;

    const needle = deferredQuery.trim().toLowerCase();

    return orderedPdfs.filter((item) => {
      if (activeKind && item.kind !== activeKind) return false;
      if (needle && !(searchIndex[item.id] ?? "").includes(needle)) return false;
      if (activeCategory && item.category !== activeCategory) return false;
      if (activeTools.length > 0) {
        const tools = item.tools ?? [];
        if (!activeTools.some((tool) => tools.includes(tool))) return false;
      }
      return true;
    });
  }, [orderedPdfs, isFiltering, deferredQuery, activeCategory, activeTools, activeKind]);

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
  }, [deferredQuery, activeCategory, toolsKey, activeKind, sort]);

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
      const kind = params.get("kind");
      setActiveKind(kind === "investigation" || kind === "project" || kind === "lab" || kind === "note" ? kind : null);
      setSort(params.get("sort") === "newest" ? "newest" : "recommended");
      setView(params.get("view") === "list" ? "list" : "cards");
    };

    readFromUrl();
    filtersHydrated.current = true;
    /* Arriving with a filter in the URL (a tag link on a case page): bring the library into view */
    if (window.location.search && !window.location.hash.startsWith("#case-")) {
      window.setTimeout(() => scrollToHash("#cases"), 400);
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
      if (activeKind) params.set("kind", activeKind);
      if (sort !== "recommended") params.set("sort", sort);
      if (view !== "cards") params.set("view", view);

      const search = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`,
      );
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, activeCategory, activeTools, activeKind, sort, view]);

  const toggleTool = useCallback((tool: string) => {
    setActiveTools((current) =>
      current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setActiveCategory(null);
    setActiveTools([]);
    setActiveKind(null);
  }, []);

  const openGallery = useCallback(async (title: string, id: string, index = 0) => {
    const screenshots = (await loadScreenshots())[id] ?? [];
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
    const at = sortedCases.findIndex((item) => `#case-${item.id}` === hash);
    if (at >= PAGE) setVisible(Math.ceil((at + 1) / PAGE) * PAGE);

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(hash.slice(1));
      if (el) {
        scrollToHash(hash);
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
              description={`${libraryCounts.total} published cases — ${libraryCounts.reports} full investigation reports, plus write-ups and walkthroughs across SOC incidents, DFIR, malware analysis, detection engineering, IAM, data and cloud security.`}
            />
            <div className="mb-16 md:mb-20">
              <CounterBadge value={libraryCounts.total} top="Cases" bottom="Indexed" tone="accent" />
            </div>
          </div>

          <StartHere />

          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
            <h2 className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
              All cases
            </h2>
            <span className="jp-eyebrow text-[0.6875rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp="全件" />
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
            totalCount={libraryCounts.total}
            onReset={resetFilters}
            kinds={kindFacets}
            activeKind={activeKind}
            onKindChange={setActiveKind}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />

          {/* The 29 PortSwigger labs also read as one track */}
          {(activeKind === null || activeKind === "lab") && !deferredQuery && (
            <FadeIn y={16} duration={0.6} className="mb-10">
              <button
                type="button"
                onClick={() => {
                  setQuery("PortSwigger");
                  setActiveKind(null);
                }}
                className="group relative w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-tertiary/25 bg-tertiary/5 px-6 py-5 overflow-hidden hover:border-tertiary/60 transition-colors duration-500 cursor-pointer"
              >
                <span className="absolute inset-y-0 left-0 w-[3px] bg-tertiary" aria-hidden="true" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-tertiary/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" aria-hidden="true" />
                <span>
                  <span className="block font-mono text-[0.5625rem] font-bold uppercase tracking-[0.3em] text-tertiary">Collection · PortSwigger</span>
                  <span className="block mt-1 font-display text-lg md:text-xl font-black uppercase tracking-tight text-foreground">
                    Web Security Academy Track — {WSA_LAB_COUNT} labs by vulnerability class
                  </span>
                </span>
                <span className="flex items-center gap-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-tertiary">
                  Filter {WSA_LAB_COUNT} labs <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </FadeIn>
          )}

          {view === "list" ? (
            <CaseList items={visiblePdfs.slice(0, Math.max(visible, 24))} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visiblePdfs.slice(0, visible).map((item, idx) => (
                <CaseCard
                  key={item.id}
                  index={idx}
                  {...item}
                  cover={mediaById[item.id]?.cover}
                  shotCount={mediaById[item.id]?.count ?? 0}
                  onOpenGallery={openGallery}
                />
              ))}
            </div>
          )}

          {(view === "list" ? Math.max(visible, 24) : visible) < visiblePdfs.length && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((n) => Math.min(visiblePdfs.length, (view === "list" ? Math.max(n, 24) : n) + (view === "list" ? 24 : PAGE)))}
                className="group flex items-center gap-3 px-8 py-4 border border-foreground/15 border-l-2 border-l-primary bg-foreground/[0.02] backdrop-blur-md text-foreground font-mono font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ChevronDown size={14} className="text-primary-ink transition-transform duration-300 group-hover:translate-y-0.5" />
                Show more cases
                <span className="font-mono text-[0.625rem] text-foreground/60 tabular-nums">
                  {Math.min(view === "list" ? Math.max(visible, 24) : visible, visiblePdfs.length)}/{visiblePdfs.length}
                </span>
              </button>
            </div>
          )}

          {visiblePdfs.length === 0 && (
            <div className="relative bg-surface/60 border border-foreground/10 p-10 md:p-14 text-center">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" aria-hidden="true" />
              <p className="brush-jp text-4xl text-accent/80 mb-4" lang="ja" aria-hidden="true" data-jp="該当なし" />
              <p className="font-mono text-sm text-foreground/60 tracking-wider mb-4">No case matches these filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-primary-ink underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <SlashDivider label="02 // Case files" japanese="調査" origin="left" />
      <TickerStrip reverse items={["報告", "証拠", "調査", "記録", "FOLLOW THE EVIDENCE"]} />

      <div id="videos" className="px-6 md:px-20 pt-16 bg-background">
        <div className="max-w-7xl mx-auto">
          <MediaSections />
        </div>
      </div>

      {gallery && (
        <Lightbox
          close={() => setGallery(null)}
          index={gallery.index}
          slides={slides}
        />
      )}
    </>
  );
}
