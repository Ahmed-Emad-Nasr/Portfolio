"use client";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState, useEffect, useRef, useDeferredValue } from "react";
import { blogYoutubeVideos, blogYoutubePlaylists, blogFeaturedYoutubeVideo, YOUTUBE_CHANNEL_URL } from "@/app/core/config/portfolio";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/portfolio";
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

const cvResource: PdfResource = { id: "soc-analyst-cv", title: "Ahmed Emad Nasr SOC & Cybersecurity Analyst CV", platform: "Professional Profile", type: "PDF CV", href: "Assets/cv/AhmedEmadNasr_CV.pdf" };

const wannacryId = "malware-analysis-wannacry";
const wannacryCase = caseEvidenceLibrary.find((item) => item.id === wannacryId);

const blogPdfResources: PdfResource[] = wannacryCase 
  ? [cvResource, wannacryCase, ...caseEvidenceLibrary.filter(item => item.id !== wannacryId)] 
  : [cvResource, ...caseEvidenceLibrary];

const PDF_DATE_MS = new Map(blogPdfResources.map((item) => [item.id, item.date ? new Date(item.date).getTime() : 0]));

// ─── Search index ────────────────────────────────────────────────────────────
// كل الكلام اللي ممكن حد يدوّر بيه على case واحدة، متجمّع في نص واحد lowercase
// مرة واحدة وقت تحميل الموديول. البحث بعد كده مجرد includes() — يعني مفيش
// أي معالجة نصوص متكررة مع كل حرف بيتكتب.
const SEARCH_INDEX = new Map<string, string>(
  blogPdfResources.map((item) => [
    item.id,
    [
      item.title,
      item.description,
      item.platform,
      item.type,
      item.category,
      item.difficulty,
      ...(item.tags ?? []),
      ...(item.tools ?? []),
      ...(item.skillsGained ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  ]),
);

/** عدّاد بسيط بيرجّع القيم مرتبة بالأكتر ظهوراً */
const countValues = (values: (string | undefined)[]): Facet[] => {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const CATEGORY_FACETS = countValues(caseEvidenceLibrary.map((item) => item.category));

// الأدوات كتير، فبناخد الأشهر بس — قايمة chips طويلة أوي بتبقى ضوضا مش فلترة
const TOOL_FACETS = countValues(
  caseEvidenceLibrary.flatMap((item) => [...(item.tools ?? [])]),
).slice(0, 12);

export default function BlogPageClient() {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);

  // ── حالة الفلترة ────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([]);

  // useDeferredValue: الكتابة في الخانة تفضل فورية حتى لو إعادة رسم الكروت
  // اتأخرت فريم أو اتنين. أرخص وأدق من debounce يدوي.
  const deferredQuery = useDeferredValue(query);

  const sortedPdfs = useMemo(() => {
    return [...blogPdfResources].sort((a, b) => {
      if (a.id === cvResource.id) return -1;
      if (b.id === cvResource.id) return 1;
      if (a.id === wannacryId) return -1;
      if (b.id === wannacryId) return 1;

      const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
      const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
      if (aShots !== bShots) return aShots ? -1 : 1;
      
      return (PDF_DATE_MS.get(b.id) ?? 0) - (PDF_DATE_MS.get(a.id) ?? 0);
    });
  }, []);

  const isFiltering =
    deferredQuery.trim() !== "" || activeCategory !== null || activeTools.length > 0;

  const visiblePdfs = useMemo(() => {
    if (!isFiltering) return sortedPdfs;

    const needle = deferredQuery.trim().toLowerCase();

    return sortedPdfs.filter((item) => {
      // الـ CV مش case — بيختفي أول ما تبدأ تفلتر عشان مياخدش مكان نتيجة
      if (item.id === cvResource.id) return false;

      if (needle && !(SEARCH_INDEX.get(item.id) ?? "").includes(needle)) return false;
      if (activeCategory && item.category !== activeCategory) return false;

      // OR جوه نفس الفلتر: "وريني اللي فيه Wazuh أو Volatility"
      if (activeTools.length > 0) {
        const tools = item.tools ?? [];
        if (!activeTools.some((tool) => tools.includes(tool))) return false;
      }

      return true;
    });
  }, [sortedPdfs, isFiltering, deferredQuery, activeCategory, activeTools]);

  // ── مزامنة الفلاتر مع الـ URL ───────────────────────────────────────────
  // مش بنستخدم useSearchParams / router.replace عن قصد: الأولى بتفرض Suspense
  // boundary وبتخرج الصفحة من الـ static export الكامل، والتانية بتعمل
  // re-render للشجرة كلها مع كل حرف. history.replaceState بيعمل نفس الشغل
  // من غير أي واحدة منهم.
  const filtersHydrated = useRef(false);

  useEffect(() => {
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setActiveCategory(params.get("cat"));
      const tools = params.get("tools");
      setActiveTools(tools ? tools.split(",").filter(Boolean) : []);
    };

    // بنقرا بعد الـ mount مش أثناء الـ render: الـ HTML المبني على السيرفر
    // مفيهوش فلاتر، فلو بدأنا بحالة مفلترة كان هيحصل hydration mismatch.
    readFromUrl();
    filtersHydrated.current = true;

    // زرار الرجوع في المتصفح لازم يرجّع الفلاتر اللي كانت
    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  useEffect(() => {
    if (!filtersHydrated.current) return;

    // debounce: Safari بيحدّد عدد نداءات replaceState في الدقيقة، والكتابة مع
    // كل حرف بتوصل للحد ده بسهولة.
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

  // Scroll blur effect: toggles a subtle backdrop blur between background and content for smoothness
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        setScrolled(y > 24);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Deep link (#case-<id>) ──────────────────────────────────────────────
  // المتصفح بيحاول يقفز على الهاش قبل ما الكروت تتركّب، فبيفشل بصمت.
  // بنعيد المحاولة لحد ما العنصر يبان، وبنوقف بعد ٢ ثانية بالظبط بدل ما
  // نفضل ندوّر على لينك بايظ للأبد.
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
        // الـ offset بتاع الهيدر متظبط بـ scroll-margin-top في BlogCard.module.css
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
      <div className={styles.scrollBlurOverlay} data-active={scrolled}></div>
      <LoadingScreen />
      <AppBar />
      
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
            categories={CATEGORY_FACETS}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            tools={TOOL_FACETS}
            activeTools={activeTools}
            onToolToggle={toggleTool}
            resultCount={visiblePdfs.length}
            totalCount={caseEvidenceLibrary.length}
            onReset={resetFilters}
          />
        }
        onResetFilters={resetFilters}
        isFiltering={isFiltering}
      />

      <KanjiDivider text="Reports • Screenshots • Investigation • Evidence" reverse angle={-1.2} />
      
      <BlogMediaSections
        totalCasesCount={caseEvidenceLibrary.length} 
        casesWithScreenshotsCount={caseEvidenceLibrary.filter(i => (caseScreenshotsByEvidenceId[i.id] ?? []).length > 0).length}
        totalScreenshotAssets={Object.values(caseScreenshotsByEvidenceId).reduce((sum, shots) => sum + shots.length, 0)}
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
