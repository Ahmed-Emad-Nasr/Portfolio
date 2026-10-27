/*
 * app/blog/page.tsx — the blog: written posts, "start here", the case
 * library and the videos, the ATT&CK coverage, the detection rules and the
 * triage challenge.
 *
 * Its own page because its reader is not the home page's: the home page is
 * the pitch a recruiter skims in a minute; this is where someone checks the
 * work. It is also what search engines should index for the case library,
 * so the library, the ATT&CK matrix and the rules are server-rendered here
 * (on the one-page site they had to load lazily, outside the HTML).
 *
 * Loading follows the home page: each interactive section is its own chunk
 * (components/blog/BlogSections.tsx), off-screen sections skip rendering
 * (content-visibility) and are pre-rendered in idle time
 * (core/perf/Prerender.tsx), in-page jumps go through core/perf/jump.ts.
 * Every post and case keeps its own page at /blog/<slug>; old links to
 * these sections on the home page (/#cases, /?q=wazuh#cases …) are
 * forwarded here (core/config/routes.ts).
 */

import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { PageShell } from "@/app/components/shared/kit";
import AreaIntro from "@/app/components/shared/AreaIntro";
import SectionDivider from "@/app/core/components/SectionDivider";
import PostsSection from "@/app/components/blog/PostsSection";
import { CaseLibraryBlock, AttackBlock, DetectionLibrary, LazyTriage } from "@/app/components/blog/BlogSections";
import HashNav from "@/app/core/perf/HashNav";
import Prerender from "@/app/core/perf/Prerender";
import { getAllPosts } from "@/app/core/content/posts";
import { attackCoverage, libraryCounts, libraryStructuredData } from "@/app/core/config/library-data";
import { blogYoutubePlaylists, blogYoutubeVideos } from "@/app/core/config/youtube";
import { CHANNEL_ID, PERSON_REF, SITE_URL, jsonLd, youtubeEmbed, youtubeThumb, youtubeWatch } from "@/app/core/config/seo";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";
import { normalizePublicHref } from "@/app/core/config/shared";

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

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "cv-defer [content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

function structuredData() {
  const posts = getAllPosts();
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
}

export default function BlogPage() {
  const postCount = getAllPosts().length;

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <HashNav />
      <Prerender />

      <AreaIntro
        as="h1"
        id="blog-top"
        eyebrow="Blog // Writing & evidence"
        japanese="記録"
        titleA="The"
        titleB="Blog."
        description={DESCRIPTION}
        links={[
          ...(postCount ? [{ href: "#posts", label: "Posts", n: postCount }] : []),
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

      {/* ─── Written posts (content/posts/*.mdx) ─── */}
      <PostsSection />

      <SectionDivider text="事件 • 調査 • 報告 • 証拠" reverse={true} angle={-1.5} />

      {/* ─── Start here, the case library (filters, cards) and the videos ─── */}
      <div className={DEFER}>
        <CaseLibraryBlock />
      </div>

      <SectionDivider text="戦術 • 技術 • 網羅 • 証拠" angle={-1.5} />

      {/* ─── The library on MITRE ATT&CK, the rule pack, one real alert ─── */}
      <div className={DEFER}>
        <AttackBlock />
      </div>
      <div className={DEFER}>
        <DetectionLibrary />
      </div>
      <LazyTriage />
    </PageShell>
  );
}
