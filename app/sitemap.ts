/*
 * sitemap.ts
 * Author: Ahmed Emad Nasr
 *
 * بيطلع /sitemap.xml وقت الـ build (متوافق مع output: "export").
 *
 * الروابط absolute ومكتوبة بالكامل عن قصد: الموقع متسضاف تحت /Portfolio،
 * والـ sitemap لازم يبقى فيه URLs كاملة مش نسبية.
 *
 * فيه نوعين من الروابط: صفحة كل case، والـ PDF بتاعها. جوجل بيفهرس الـ PDF
 * كمستند مستقل، فالاتنين بيدّوا نتايج بحث مختلفة.
 */

import type { MetadataRoute } from "next";
import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { absoluteUrl, caseUrl } from "@/app/core/config/site";

// مطلوبة مع output: "export" — زي robots.ts بالظبط.
export const dynamic = "force-static";

const parseDate = (value?: string): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function sitemap(): MetadataRoute.Sitemap {
  // آخر تاريخ في المكتبة = آخر تحديث حقيقي للبلوج
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
      // صفحة الـ CV بـ HTML. أولوية أعلى من الـ PDF: جوجل بيفهرس الصفحة
      // أحسن، وأنظمة الـ ATS بتقراها أحسن، وهي بتتبني من نفس الـ config
      // بتاع الموقع فمستحيل تبقى قديمة.
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
    // صفحة كل case
    ...caseEvidenceLibrary.map((item) => ({
      url: caseUrl(item.id),
      lastModified: parseDate(item.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    /*
     * والـ PDF نفسه — للحالات اللي ليها PDF بس.
     *
     * `.filter(Boolean)` مش تفصيلة: قبل كده الـ sitemap كان بيقدّم لجوجل
     * ست ملفات PDF مش موجودة. وsitemap فيه عناوين بترجّع 404 بيقلّل ثقة
     * محرك البحث في باقي العناوين اللي فيه.
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
