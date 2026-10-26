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
  /** investigation / project / lab / note — see caseKindOf below */
  kind?: CaseKind;
  /** From case-details.ts, for the card's verdict line and severity badge */
  verdict?: string;
  severity?: string;
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
  caseId?: string;
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
  /** The case page this video walks through, when there is one */
  caseId?: string;
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
// Utils (blog-utils.ts used to re-export these; import them from here)
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

/* ── Case kinds ──────────────────────────────────────────────────────────
   The library mixes four different things, and a reviewer reads them very
   differently: an incident report is evidence of the job, a capstone or rule
   pack is something built, a lab write-up is practice, and a learning-room
   note is study. The kind is derived from the case type (plus a short list of
   learning rooms), so a new case is classified without extra data. */

export type CaseKind = "investigation" | "project" | "lab" | "note";

export const CASE_KINDS: readonly { id: CaseKind; label: string; short: string }[] = [
  { id: "investigation", label: "Investigations & reports", short: "Investigation" },
  { id: "project", label: "Projects & rule packs", short: "Project" },
  { id: "lab", label: "Labs & write-ups", short: "Lab" },
  { id: "note", label: "Learning notes", short: "Note" },
];

const REPORT_TYPES = new Set(["PDF Report", "DOCX & PDF Report", "PDF & DOCX Report", "Report"]);
const PROJECT_TYPES = new Set(["Project Report", "Team Playbook", "Detection Rules", "Intel Brief"]);

/* TryHackMe learning rooms: concept walkthroughs rather than hands-on investigations */
const NOTE_IDS = new Set([
  "iam-access-control-room",
  "offensive-security-intro",
  "soc-l2-alert-triage",
  "report-writing-soc-l2",
  "defensive-security-trends",
  "monitoring-active-directory",
  "intro-to-antivirus",
  "intro-to-digital-forensics",
  "legal-considerations-dfir",
]);

export const caseKindOf = (c: { id: string; type: string }): CaseKind =>
  REPORT_TYPES.has(c.type) ? "investigation" : PROJECT_TYPES.has(c.type) ? "project" : NOTE_IDS.has(c.id) ? "note" : "lab";

export const isReportType = (type: string) => REPORT_TYPES.has(type);

/* The PortSwigger Web Security Academy labs form one collection with its own
   page, so 29 short labs read as one track instead of 29 separate cases. */
export const WSA_COLLECTION = {
  id: "web-security-academy",
  title: "Web Security Academy Track",
  platform: "PortSwigger",
} as const;

/* Show a network indicator without making it clickable or resolvable:
   84.38.130.118 → 84.38.130[.]118, http://a.b/c.sct → hxxp://a[.]b/c.sct,
   x@pm.me → x[@]pm[.]me. Hashes and file paths pass through unchanged. */
export const defang = (value: string): string => {
  const m = value.match(/^([a-z]+:\/\/)?([^/\s]+)(.*)$/i);
  if (!m) return value;
  const scheme = (m[1] ?? "").replace(/^http/i, "hxxp");
  const host = m[2].replace("@", "[@]").replace(/\.(?=[^.]*$)/, "[.]");
  return `${scheme}${host}${m[3]}`;
};
