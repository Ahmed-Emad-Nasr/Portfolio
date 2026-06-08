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
  // unboundedly for the lifetime of the module (the user's session).
  if (dateCache.size >= DATE_CACHE_MAX) {
    dateCache.delete(dateCache.keys().next().value!);
  }
  dateCache.set(value, formatted);
  return formatted;
};