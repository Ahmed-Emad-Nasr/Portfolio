/*
 * core/config/shared.ts
 *
 * Part of the portfolio.ts split (it used to be 70KB in a single module). Everything here was moved
 * verbatim — no change to the data itself, only the split.
 *
 * Why? layout.tsx imported knowledgeEducationItems from the big file,
 * which pulled all 38 cases, all the screenshots and all the YouTube videos
 * into the same module graph — on every page, even the ones that don't need them.
 * Relying on tree-shaking to separate them works in theory, but with a single module
 * containing everything it's a bet, not a guarantee. Separate files make the split real.
 *
 * portfolio.ts still exists as a re-exporting barrel, so any old import works as
 * before and nothing broke.
 */

export type PdfResource = {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  /*
   * Path to the PDF file — **optional**.
   *
   * Not every case has a written report. Six of them have image-only evidence. Previously this field
   * was required, so those six had to have a path — and the path pointed
   * at a file that didn't exist, so the "View PDF" and "Download" buttons led to a 404.
   *
   * When it's absent: the buttons aren't shown, the case isn't added to the sitemap
   * as a file, and the structured data doesn't claim a PDF exists. The normal state is now
   * "no report", not "broken report".
   */
  href?: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
  /*
   * The detail page for this item.
   *
   * Defaults to `/blog/{id}` — which is correct for every case, because generateStaticParams
   * generates a page for every id in caseEvidenceLibrary.
   *
   * But the blog library also gets an item injected that is **not** a case: the CV card with id
   * "soc-analyst-cv". No page is generated for it, so the "Open case" button led
   * to /blog/soc-analyst-cv → 404 on the published site.
   *
   * This field lets any item state its page explicitly instead of us assuming.
   */
  detailHref?: string;
};

export type GalleryState = {
  title: string;
  screenshots: string[];
  index: number;
};

export type ChannelVideo = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt?: string;
  sourceUrl: string;
};

export type CaseStudyHighlight = {
  title: string;
  domain: string;
  problem: string;
  action: string;
  result: string;
};

export type CaseEvidence = {
  id: string;
  title: string;
  description: string;
  platform: string;
  type: string;
  category: string;
  difficulty: string;
  /*
   * PDF path — **optional**, like PdfResource above and for the same reason: six
   * cases have image-only evidence and no written report.
   *
   * The two types must stay in sync on this point, because caseEvidenceLibrary
   * is injected into blogPdfResources and rendered by the same component.
   */
  href?: string;
  tags: readonly string[];
  tools: readonly string[];
  skillsGained: readonly string[];
  readTime: number;
  date: string;
  screenshots?: readonly string[];
  image?: string;
};

export type BlogYoutubeVideo = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt: string;
  tags?: readonly string[];
};

export type FeaturedYoutubeVideo = {
  videoId: string;
  title: string;
  description?: string;
  sourceUrl: string;
};

export type BlogYoutubePlaylist = {
  playlistId: string;
  title: string;
  description?: string;
  sourceUrl: string;
  thumbnailVideoId?: string;
  tags?: readonly string[];
  videoCount?: number;
};

// -----------------------------------------------------------------------------
// Utils (from blog-utils.ts)
// -----------------------------------------------------------------------------

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateCache = new Map<string, string>();
const DATE_CACHE_MAX = 500;

/** The CV PDF, in public/ (re-exported by cv.ts) */
export const CV_PDF_HREF = "Assets/cv/AhmedEmadNasr_CV.pdf";

export const normalizePublicHref = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ??
    (process.env.NODE_ENV === "production" ? "/Portfolio" : "");
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${basePath}${normalized}`.replace(/\/\//g, "/");
};

export const getThumbnail = (imgPath: string): string =>
  imgPath.replace(/(\.webp|\.png|\.jpg|\.jpeg)$/i, "-thumb$1");

export const formatDate = (value: string): string => {
  const cached = dateCache.get(value);
  if (cached !== undefined) return cached;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const formatted = dateFormatter.format(parsed);

  // Evict oldest entry when cache exceeds the size limit so it never grows
  if (dateCache.size >= DATE_CACHE_MAX) {
    dateCache.delete(dateCache.keys().next().value!);
  }
  dateCache.set(value, formatted);
  return formatted;
};

/*
 * A constant, not data — but it used to live in config/youtube.ts next to the video
 * and playlist arrays. As a result sensei-home.tsx, which only needs this one line,
 * pulled the whole YouTube module onto the home page: 40 KB of blog
 * data on a page that doesn't show a single video.
 *
 * That's exactly why the portfolio.ts split was necessary: tree-shaking
 * doesn't drop a whole module just because you only take one constant from it.
 */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";
