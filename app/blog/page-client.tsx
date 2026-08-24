"use client";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { blogYoutubeVideos, blogYoutubePlaylists, blogFeaturedYoutubeVideo, YOUTUBE_CHANNEL_URL } from "@/app/core/config/portfolio";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/portfolio";
import styles from "./page.module.css";
import { formatDate, normalizePublicHref } from "./blog-utils";
import type { PdfResource, GalleryState } from "./blog-types";
import LoadingScreen from "@/app/components/loader/sensei_loader";

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

export default function BlogPageClient() {
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [activeEmbeds, setActiveEmbeds] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.scrollBlurOverlay} data-active={scrolled}></div>
      <LoadingScreen />
      <AppBar />
      
      <BlogPdfLibrarySection
        visiblePdfCards={sortedPdfs}
        screenshotsById={caseScreenshotsByEvidenceId}
        openGallery={openGallery} 
        normalizeHref={normalizePublicHref}
        leadCase={null}
        leadCaseSpotlightImage={null}
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