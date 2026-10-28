/*
 * /blog — the case library (with "start here" and the videos), ATT&CK
 * coverage, detection rules and the triage challenge. Server-rendered for
 * search; each section is its own chunk (components/blog/dynamic.tsx).
 * Old home-page links (/#cases …) are forwarded here (lib/routes.ts).
 */

import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { DEFER, PageShell } from "@/components/ui/kit";
import AreaIntro from "@/components/ui/AreaIntro";
import SectionDivider from "@/components/ui/SectionDivider";
import { CaseLibrarySection, LazyAttackCoverage, LazyDetectionLibrary, LazyTriage } from "@/components/blog/dynamic";
import PageEffects from "@/lib/perf/PageEffects";
import { attackCoverage, libraryCounts, libraryStructuredData } from "@/lib/library-data";
import { blogYoutubePlaylists, blogYoutubeVideos } from "@/data/youtube";
import { CHANNEL_ID, PERSON_REF, SITE_URL, jsonLd, youtubeEmbed, youtubeThumb, youtubeWatch } from "@/lib/seo";
import { absoluteUrl, OG_IMAGE } from "@/lib/site";
import { normalizePublicHref } from "@/lib/shared";

const DESCRIPTION =
  "Incident reports, DFIR investigations, malware analysis, detection rules mapped to MITRE ATT&CK, and Arabic cybersecurity videos by Ahmed Emad Nasr.";

export const metadata: Metadata = {
  title: "Blog — Case Library, ATT&CK & Videos",
  description: DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "Ahmed Emad Nasr — Blog" }] },
  },
  openGraph: {
    title: "Blog — Ahmed Emad Nasr",
    description: DESCRIPTION,
    url: absoluteUrl("/blog"),
    type: "website",
    siteName: "Ahmed Emad Nasr Portfolio",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: "Blog — Ahmed Emad Nasr", description: DESCRIPTION, images: [OG_IMAGE.url] },
};

function structuredData() {
  const blogUrl = absoluteUrl("/blog");
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${blogUrl}#blog`,
        url: blogUrl,
        name: "Ahmed Emad Nasr — Blog",
        description: DESCRIPTION,
        author: PERSON_REF,
        publisher: PERSON_REF,
        isPartOf: { "@id": `${SITE_URL}#website` },
      },
      libraryStructuredData,
      {
        "@type": "ItemList",
        "@id": `${blogUrl}#videos`,
        name: "Cybersecurity video tutorials by Ahmed Emad Nasr (Arabic)",
        numberOfItems: blogYoutubeVideos.length,
        itemListElement: blogYoutubeVideos.map((video, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "VideoObject",
            "@id": `${youtubeWatch(video.videoId)}#video`,
            name: video.title,
            description: video.description ?? video.title,
            thumbnailUrl: [youtubeThumb(video.videoId)],
            uploadDate: video.publishedAt,
            embedUrl: youtubeEmbed(video.videoId),
            url: youtubeWatch(video.videoId),
            inLanguage: "ar",
            keywords: (video.tags ?? []).join(", "),
            creator: PERSON_REF,
            author: PERSON_REF,
            publisher: { "@id": CHANNEL_ID },
            isFamilyFriendly: true,
          },
        })),
      },
      ...blogYoutubePlaylists.map((playlist) => ({
        "@type": "CreativeWorkSeries",
        "@id": `${playlist.sourceUrl.split("&")[0]}#series`,
        name: playlist.title,
        description: playlist.description,
        url: playlist.sourceUrl.split("&")[0],
        ...(playlist.thumbnailVideoId ? { image: youtubeThumb(playlist.thumbnailVideoId) } : {}),
        keywords: (playlist.tags ?? []).join(", "),
        inLanguage: "ar",
        author: PERSON_REF,
        publisher: { "@id": CHANNEL_ID },
      })),
    ],
  });
}

export default function BlogPage() {
  return (
    <PageShell showLoader>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <PageEffects />

      <AreaIntro
        as="h1"
        id="blog-top"
        eyebrow="Blog // The evidence"
        japanese="記録"
        titleA="The"
        titleB="Blog."
        description={DESCRIPTION}
        links={[
          { href: "#start-here", label: "Start here" },
          { href: "#cases", label: "Case library", n: libraryCounts.total },
          { href: "#videos", label: "Videos", n: blogYoutubeVideos.length },
          { href: "#attack", label: "ATT&CK coverage", n: attackCoverage.techniqueCount },
          { href: "#detections", label: "Detection rules" },
          { href: "#triage", label: "Triage challenge" },
        ]}
        extra={
          <a
            href={normalizePublicHref("/feed.xml")}
            className="inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary-ink"
          >
            <Rss size={12} aria-hidden="true" /> RSS
          </a>
        }
      />

      {/* ─── Start here, the case library (filters, cards) and the videos ─── */}
      <div className={DEFER}>
        <CaseLibrarySection />
      </div>

      <SectionDivider text="戦術 • 技術 • 網羅 • 証拠" angle={-1.5} />

      {/* ─── The library on MITRE ATT&CK, the rule pack, one real alert ─── */}
      <LazyAttackCoverage />
      <LazyDetectionLibrary />
      <LazyTriage />
    </PageShell>
  );
}
