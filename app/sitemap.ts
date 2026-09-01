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
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { absoluteUrl, caseUrl } from "@/app/core/config/site";

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
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: latestCaseDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      // The HTML CV page. Higher priority than the PDF: Google indexes the page
      // better, ATS systems read it better, and it is built from the same site
      // config so it cannot go stale.
      url: absoluteUrl("/cv"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/Assets/cv/AhmedEmadNasr_CV.pdf"),
      lastModified: latestCaseDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // One entry per case page
    ...caseEvidenceLibrary.map((item) => ({
      url: caseUrl(item.id),
      lastModified: parseDate(item.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
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
