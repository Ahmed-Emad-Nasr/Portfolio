/*
 * sitemap.ts
 * Author: Ahmed Emad Nasr
 *
 * Emits /sitemap.xml at build time (compatible with output: "export").
 *
 * The URLs are absolute and written out in full on purpose: the site is
 * hosted under /Portfolio, and a sitemap has to contain complete URLs, not
 * relative ones.
 *
 * There are two kinds of entry: each case's page, and its PDF. Google
 * indexes the PDF as a separate document, so the two produce different
 * search results.
 */

import type { MetadataRoute } from "next";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import { absoluteUrl, caseUrl, OG_IMAGE } from "@/app/core/config/site";
import { GALLERY_IMAGE_COUNT, galleryImagePath } from "@/app/core/config/certifications";
import { blogYoutubeVideos } from "@/app/core/config/youtube";
import { PERSON_IMAGE, SITE_URL, youtubeEmbed, youtubeThumb } from "@/app/core/config/seo";
import { getAllPosts, getTags } from "@/app/core/content/posts";

/*
 * Image and video extensions (Google's image/video sitemap formats): they
 * tell Google which pictures and videos belong to which page, so they can
 * show up in Image and Video search with a link back here. Every image listed
 * is one the page actually shows.
 */
const homeImages = [PERSON_IMAGE, OG_IMAGE.url];
/* The proof gallery is on the about page */
const aboutImages = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, i) => absoluteUrl(galleryImagePath(i + 1)));

/* Google allows 2,048 characters of description; keep well under */
const clip = (text: string, max = 1000) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/* Next writes the video fields into the XML as-is (it escapes nothing), so
   one "&" in a title — "CA Certificate & Proxy" — made the whole sitemap
   invalid XML, and Search Console rejects an invalid sitemap entirely. */
const xml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/* The videos are on the blog page */
const blogVideos = blogYoutubeVideos.map((video) => ({
  title: xml(video.title),
  thumbnail_loc: youtubeThumb(video.videoId),
  description: xml(clip(video.description ?? video.title)),
  player_loc: youtubeEmbed(video.videoId),
  publication_date: video.publishedAt,
  family_friendly: "yes" as const,
  requires_subscription: "no" as const,
  uploader: { info: SITE_URL, content: "Ahmed Emad Nasr" },
  ...(video.tags?.[0] ? { tag: xml(video.tags[0]) } : {}),
}));

// Required with output: "export" — exactly like robots.ts.
export const dynamic = "force-static";

const parseDate = (value?: string): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function sitemap(): MetadataRoute.Sitemap {
  // The most recent date in the library = the blog's real last update
  const latestCaseDate = caseEvidenceLibrary.reduce<Date>((latest, item) => {
    const date = parseDate(item.date);
    return date > latest ? date : latest;
  }, new Date(0));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latestCaseDate,
      changeFrequency: "weekly",
      priority: 1,
      images: homeImages,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: [latestCaseDate, ...getAllPosts().map((p) => parseDate(p.updated ?? p.date))].reduce((a, b) => (b > a ? b : a)),
      changeFrequency: "weekly",
      priority: 0.95,
      videos: blogVideos,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.7,
      images: aboutImages,
    },
    // Written posts, and the tag pages that list them
    ...getAllPosts().map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: parseDate(p.updated ?? p.date),
      changeFrequency: "monthly" as const,
      priority: 0.85,
      ...(p.cover ? { images: [absoluteUrl(p.cover)] } : {}),
    })),
    ...getTags().map((t) => ({
      url: absoluteUrl(`/blog/tag/${t.slug}`),
      lastModified: latestCaseDate,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    {
      // The HTML CV page. Higher priority than the PDF: Google indexes the page
      // better, ATS systems read it better, and it is built from the same site
      // config so it cannot go stale.
      url: absoluteUrl("/cv"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [PERSON_IMAGE],
    },
    {
      /* The legal pages — low priority: they're meant to be indexed so they can be
         found, not to compete with the content in search results. */
      url: absoluteUrl("/privacy"),
      lastModified: latestCaseDate,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: latestCaseDate,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/Assets/cv/AhmedEmadNasr_CV.pdf"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/collections/web-security-academy"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // One entry per case page
    ...caseEvidenceLibrary.map((item) => ({
      url: caseUrl(item.id),
      lastModified: parseDate(item.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
      images: [...new Set([...(item.image ? [item.image] : []), ...(caseScreenshotsByEvidenceId[item.id] ?? [])])]
        .slice(0, 50)
        .map((src) => absoluteUrl(src)),
    })),
    /*
     * And the PDF itself — only for the cases that have one.
     *
     * `.filter(Boolean)` is not a detail: the sitemap was previously
     * offering Google six PDF files that do not exist. A sitemap containing
     * URLs that return 404 reduces the search engine's confidence in the
     * rest of the URLs in it.
     */
    ...caseEvidenceLibrary
      .filter((item): item is typeof item & { href: string } => Boolean(item.href))
      .map((item) => ({
        url: absoluteUrl(item.href),
        lastModified: parseDate(item.date),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
  ];
}
