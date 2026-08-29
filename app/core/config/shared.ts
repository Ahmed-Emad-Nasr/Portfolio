/*
 * core/config/shared.ts
 *
 * جزء من تقسيم portfolio.ts (كان 70KB في موديول واحد). كل حاجة هنا اتنقلت
 * زي ما هي بالحرف — مفيش أي تعديل في الداتا نفسها، التقسيم بس.
 *
 * ليه؟ layout.tsx كان بيعمل import لـ knowledgeEducationItems من الملف
 * الكبير، فبيجرّ معاه في نفس الـ module graph كل الـ 38 case وكل الـ
 * screenshots وكل فيديوهات اليوتيوب — على كل صفحة، حتى اللي مش محتاجاها.
 * الاعتماد على الـ tree-shaking عشان يفصلهم شغّال نظرياً، بس مع موديول واحد
 * فيه كل حاجة هو رهان مش ضمانة. الملفات المنفصلة بتخلي الفصل حقيقي.
 *
 * portfolio.ts لسه موجود كـ barrel بيعيد التصدير، فأي import قديم شغّال زي
 * ما هو ومفيش حاجة اتكسرت.
 */

export type PdfResource = {
  id: string;
  title: string;
  description?: string;
  platform: string;
  type: string;
  category?: string;
  difficulty?: string;
  href: string;
  tags?: readonly string[];
  tools?: readonly string[];
  skillsGained?: readonly string[];
  readTime?: number;
  date?: string;
  /*
   * صفحة التفاصيل بتاعة العنصر ده.
   *
   * الافتراضي `/blog/{id}` — وده صح لكل الـ cases لأن generateStaticParams
   * بيولّد صفحة لكل id في caseEvidenceLibrary.
   *
   * بس مكتبة البلوج بيتحقن فيها عنصر **مش** case: كارت الـ CV بـ id
   * "soc-analyst-cv". مفيش صفحة بتتولّد ليه، فزرار "Open case" كان بيودّي
   * على /blog/soc-analyst-cv → 404 على الموقع المنشور.
   *
   * الحقل ده بيخلي أي عنصر يقول صفحته فين صراحةً بدل ما نفترض.
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
  href: string;
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
 * ثابت مش داتا — بس مكانه كان جوه config/youtube.ts جنب مصفوفات الفيديوهات
 * والـ playlists. النتيجة إن sensei-home.tsx اللي محتاج السطر ده بس كان
 * بيجرّ موديول اليوتيوب كله معاه للصفحة الرئيسية: 40 كيلوبايت من داتا
 * البلوج على صفحة مش بتعرض ولا فيديو.
 *
 * ده بالظبط السبب اللي خلّى تقسيم portfolio.ts ضروري: الـ tree-shaking
 * مبيشيلش موديول كامل عشان إنت واخد منه ثابت واحد.
 */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AhmedEmad-0x3omda";
