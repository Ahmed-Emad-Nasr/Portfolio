/*
 * core/config/site.ts
 * Author: Ahmed Emad Nasr
 *
 * One source for the absolute URLs written into the sitemap, the RSS feed,
 * the canonical tags and the OG tags.
 *
 * ⚠️ TRAILING_SLASH must match `trailingSlash` in next.config.mjs.
 * If they disagree, this happens: the sitemap tells Google /blog/case-x and
 * the site redirects to /blog/case-x/ — so Google sees two different URLs
 * for one page and splits its ranking between them.
 *
 * How to tell? Open next.config.mjs:
 *   trailingSlash: true   → leave this true (the build emits blog/case-x/index.html)
 *   absent or false       → set this false (the build emits blog/case-x.html)
 */

export const SITE_BASE_URL = "https://ahmed-emad-nasr.github.io/Portfolio";

/*
 * This was true, and the deployed site answers /Portfolio/blog **without**
 * a slash — and next.config.mjs has no trailingSlash. The result was that
 * the sitemap, og:url, the JSON-LD @id and the RSS links all stated URLs
 * with a trailing slash, while the canonical tag and the real in-page links
 * had none.
 *
 * So you were presenting Google with two different URLs for the same page,
 * and the one in the sitemap was not the one that opens.
 *
 * This is not a path detail — it is SEO. If you change your mind and set
 * trailingSlash: true in next.config.mjs, set this back to true so the two
 * stay in agreement.
 */
export const TRAILING_SLASH = false;

/** Turns an internal path into an absolute URL in the form crawlers expect */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_BASE_URL}${normalized}`;

  // Files (anything with an extension) never take a trailing slash
  const isFile = /\.[a-z0-9]+$/i.test(normalized);
  if (isFile || normalized === "/") return url;

  if (TRAILING_SLASH) return url.endsWith("/") ? url : `${url}/`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

/** A case page's URL — the only place this shape is defined */
export const caseUrl = (id: string): string => absoluteUrl(`/blog/${id}`);

/** The share card (public/og-image.png, made from scripts/og/og-image.html) */
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
