/*
 * app/blog/page.tsx — the blog: written posts, the case library, the ATT&CK
 * coverage, the detection rules, the triage challenge and the videos.
 *
 * These used to be the last ten sections of the one-page portfolio, starting
 * ~36,000px down the home page. Here they are one click from every page.
 * Old links (/#cases, /?q=wazuh#cases …) are forwarded here by the home page
 * (core/config/routes.ts). Every post and every case keeps its own page at
 * /blog/<slug>.
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Rss } from "lucide-react";
import { PageShell, chipNeutral } from "@/app/components/shared/kit";
import SectionHeader from "@/app/core/components/SectionHeader";
import SectionDivider from "@/app/core/components/SectionDivider";
import StartHere from "@/app/components/cases/StartHere";
import AttackCoverage from "@/app/components/cases/AttackCoverage";
import PostCard from "@/app/components/blog/PostCard";
import { getAllPosts, getTags } from "@/app/core/content/posts";
import {
  attackCoverage,
  categoryFacets,
  kindFacets,
  libraryCounts,
  libraryStructuredData,
  mediaById,
  sortedCases,
  toolFacets,
} from "@/app/core/config/library-data";
import { blogYoutubePlaylists, blogYoutubeVideos } from "@/app/core/config/youtube";
import { CHANNEL_ID, PERSON_REF, SITE_URL, jsonLd, youtubeEmbed, youtubeThumb, youtubeWatch } from "@/app/core/config/seo";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";
import { normalizePublicHref } from "@/app/core/config/shared";
import FadeIn from "@/app/core/components/FadeIn";

const CaseLibrarySection = dynamic(() => import("@/app/components/cases/CaseLibrarySection"));
const DetectionLibrary = dynamic(() => import("@/app/components/cases/DetectionLibrary"));
const TriageChallenge = dynamic(() => import("@/app/components/cases/TriageChallenge"));

const DESCRIPTION =
  "Write-ups, incident reports, DFIR investigations, malware analysis, detection rules mapped to MITRE ATT&CK, and Arabic cybersecurity videos by Ahmed Emad Nasr.";

export const metadata: Metadata = {
  title: "Blog — Write-ups, Case Library & Videos",
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

/* Off-screen sections skip rendering until they near the viewport */
const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getTags();
  const blogUrl = absoluteUrl("/blog");

  const structuredData = jsonLd({
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
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(`/blog/${p.slug}`)}#article`,
          headline: p.title,
          description: p.description,
          url: absoluteUrl(`/blog/${p.slug}`),
          datePublished: p.date,
          ...(p.updated ? { dateModified: p.updated } : {}),
          inLanguage: p.lang,
          keywords: p.tags.join(", "),
          author: PERSON_REF,
        })),
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

  /* The page's own table of contents — the sections below, in order */
  const jump = [
    ...(posts.length ? [{ href: "#posts", label: "Posts", n: posts.length }] : []),
    { href: "#start-here", label: "Start here" },
    { href: "#cases", label: "Case library", n: libraryCounts.total },
    { href: "#youtube", label: "Videos", n: blogYoutubeVideos.length },
    { href: "#attack", label: "ATT&CK coverage", n: attackCoverage.techniqueCount },
    { href: "#detections", label: "Detection rules" },
    { href: "#triage", label: "Triage challenge" },
  ];

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      {/* ─── Page header ─── */}
      <header className="relative pt-36 md:pt-44 pb-8 px-6 md:px-20">
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader
            as="h1"
            eyebrow="Blog // Writing & evidence"
            japanese="記録"
            titleA="The"
            titleB="Blog."
            description={DESCRIPTION}
          />
          <FadeIn as="nav" y={16} duration={0.6} delay={0.1} aria-label="On this page" className="-mt-8 md:-mt-10 flex flex-wrap items-center gap-2">
            {jump.map((j) => (
              <a
                key={j.href}
                href={j.href}
                className="group inline-flex items-center gap-2 border border-foreground/10 bg-foreground/[0.03] px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors duration-300 hover:border-primary hover:text-foreground"
              >
                {j.label}
                {j.n !== undefined && <span className="text-accent tabular-nums">{j.n}</span>}
              </a>
            ))}
            <a
              href={normalizePublicHref("/feed.xml")}
              className="inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary-ink"
            >
              <Rss size={12} aria-hidden="true" /> RSS
            </a>
          </FadeIn>
        </div>
      </header>

      {/* ─── Written posts (content/posts/*.mdx) ─── */}
      {posts.length > 0 && (
        <section id="posts" aria-labelledby="posts-title" className="relative py-16 md:py-24 px-6 md:px-20">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
                  <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">Posts</span>
                </div>
                <h2 id="posts-title" className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                  Latest <span className="text-primary italic">write-ups.</span>
                </h2>
              </div>
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Browse by tag">
                  {tags.slice(0, 10).map((t) => (
                    <li key={t.slug}>
                      <Link href={`/blog/tag/${t.slug}`} className={`${chipNeutral} inline-flex gap-1.5 hover:border-primary hover:text-foreground transition-colors`}>
                        {t.tag} <span className="text-accent tabular-nums">{t.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <PostCard post={post} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SectionDivider text="事件 • 調査 • 報告 • 証拠" reverse={true} angle={-1.5} />

      {/* ─── The case library (Start here, filters, cards) and the videos ─── */}
      <div className={DEFER}>
        <CaseLibrarySection
          startHere={<StartHere />}
          sortedPdfs={sortedCases}
          mediaById={mediaById}
          categoryFacets={categoryFacets}
          toolFacets={toolFacets}
          kindFacets={kindFacets}
          totalCasesCount={libraryCounts.total}
          investigationReportCount={libraryCounts.reports}
          casesWithScreenshotsCount={libraryCounts.withScreenshots}
          totalScreenshotAssets={libraryCounts.screenshots}
        />
      </div>

      <SectionDivider text="戦術 • 技術 • 網羅 • 証拠" angle={-1.5} />

      {/* ─── The library on MITRE ATT&CK, the rule pack, one real alert ─── */}
      <div className={DEFER}>
        <AttackCoverage {...attackCoverage} />
      </div>
      <div className={DEFER}>
        <DetectionLibrary />
      </div>
      <div className={DEFER}>
        <TriageChallenge />
      </div>
    </PageShell>
  );
}
