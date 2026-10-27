/* Absolute URLs for the sitemap, feed, canonical and OG tags. No trailing
   slash: next.config.mjs has no trailingSlash, so /blog is the real URL. */

export const SITE_BASE_URL = "https://ahmed-emad-nasr.github.io/Portfolio";

/** Turns an internal path into an absolute URL in the form crawlers expect */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_BASE_URL}${normalized}`;

  if (normalized === "/") return url;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

/** A case page's URL — the only place this shape is defined */
export const caseUrl = (id: string): string => absoluteUrl(`/blog/${id}`);

/** The site-wide share card (public/og-image.png) */
export const OG_IMAGE = {
  url: `${SITE_BASE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "Ahmed Emad Nasr — Information Security Officer: GRC, SOC, DFIR, IAM",
};

/**
 * A description cut to `max` characters at a word boundary, for the
 * <meta name="description"> and og:description tags. Search engines show
 * ~155 characters and social cards ~200; some case summaries are 700+.
 */
export const summarize = (text: string, max = 155): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.\-–—(]+$/, "");
  return `${atWord}…`;
};
