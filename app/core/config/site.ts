/*
 * core/config/site.ts
 * Author: Ahmed Emad Nasr
 *
 * مصدر واحد للعناوين المطلقة (absolute URLs) اللي بتتكتب في الـ sitemap
 * والـ RSS والـ canonical و OG tags.
 *
 * ⚠️ الـ TRAILING_SLASH لازم يطابق `trailingSlash` في next.config.mjs.
 * لو الاتنين مش متطابقين، هيحصل التالي: الـ sitemap بيقول لجوجل
 * /blog/case-x والموقع بيوديه على /blog/case-x/ — فجوجل بيشوف عنوانين
 * مختلفين لنفس الصفحة ويقسّم ترتيبها بينهم.
 *
 * إزاي تعرف؟ افتح next.config.mjs:
 *   trailingSlash: true   → سيبها true (الـ build بيطلع blog/case-x/index.html)
 *   مش موجودة أو false    → غيّرها لـ false (الـ build بيطلع blog/case-x.html)
 */

export const SITE_BASE_URL = "https://ahmed-emad-nasr.github.io/Portfolio";

export const TRAILING_SLASH = true;

/** بيحوّل مسار داخلي لعنوان مطلق بالشكل الصح للـ crawlers */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_BASE_URL}${normalized}`;

  // الملفات (فيها امتداد) مبتاخدش سلاش في آخرها أبداً
  const isFile = /\.[a-z0-9]+$/i.test(normalized);
  if (isFile || normalized === "/") return url;

  if (TRAILING_SLASH) return url.endsWith("/") ? url : `${url}/`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

/** عنوان صفحة الـ case — المكان الوحيد اللي الشكل ده متعرّف فيه */
export const caseUrl = (id: string): string => absoluteUrl(`/blog/${id}`);
