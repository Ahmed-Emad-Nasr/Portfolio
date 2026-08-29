/*
 * blog/[slug]/page.tsx
 * Author: Ahmed Emad Nasr
 *
 * صفحة مستقلة لكل case. الفايدة الحقيقية مش الشكل — الفايدة إن كل تقرير بقى
 * ليه URL حقيقي وعنوان و OG image خاصين بيه، فلما تبعت لينك case في لينكدإن
 * أو لحد في إنترفيو بيبان بالصورة والعنوان بتوعه هو، مش عنوان البلوج كله.
 * وكمان جوجل بيفهرسه كصفحة لوحده بدل ما يكون جزء من صفحة واحدة كبيرة.
 *
 * كله static: generateStaticParams بتطلع الـ 38 صفحة وقت الـ build، متوافق
 * مع output: "export".
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import CaseArticle from "./CaseArticle";
import { absoluteUrl, caseUrl } from "@/app/core/config/site";
import { caseAttackMapping, TECHNIQUES } from "@/app/core/config/attack";

const findCase = (slug: string) => caseEvidenceLibrary.find((item) => item.id === slug);

// dynamicParams = false: أي slug مش في القايمة بيبقى 404 وقت الـ build بدل ما
// يحاول يعمل render وقت التشغيل (اللي مش موجود أصلاً في static export).
export const dynamicParams = false;


/*
 * تفاصيل إضافية بتتحسب هنا (Server Component) وبتتبعت جاهزة للكومبوننت —
 * فمفيش منها ولا بايت في bundle المتصفح.
 */

const TECHNIQUE_BY_ID = new Map(TECHNIQUES.map((t) => [t.id, t]));

/** تكنيكات ATT&CK بتاعة الـ case ده، بالاسم الكامل */
const techniquesFor = (caseId: string) =>
  (caseAttackMapping[caseId] ?? [])
    .map((id) => TECHNIQUE_BY_ID.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

/*
 * تقارير قريبة من التقرير ده.
 *
 * الترتيب: تكنيكات ATT&CK مشتركة أولاً (ده أقوى إشارة على التشابه
 * الحقيقي)، وبعدها الأدوات المشتركة، وبعدها نفس التصنيف. أي case معندوش
 * أي تقاطع مبيظهرش خالص — "مقترحات" عشوائية أسوأ من مفيش مقترحات.
 */
const relatedTo = (item: (typeof caseEvidenceLibrary)[number], limit = 3) => {
  const myTechniques = new Set(caseAttackMapping[item.id] ?? []);
  const myTools = new Set(item.tools ?? []);

  return caseEvidenceLibrary
    .filter((other) => other.id !== item.id)
    .map((other) => {
      const sharedTechniques = (caseAttackMapping[other.id] ?? [])
        .filter((t) => myTechniques.has(t)).length;
      const sharedTools = (other.tools ?? []).filter((t) => myTools.has(t)).length;
      const sameCategory = other.category === item.category ? 1 : 0;
      return {
        id: other.id,
        title: other.title,
        category: other.category,
        readTime: other.readTime,
        // الأوزان: تكنيك مشترك أثقل من أداة مشتركة بكتير
        score: sharedTechniques * 5 + sharedTools * 2 + sameCategory,
        sharedTechniques,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
};

export function generateStaticParams() {
  return caseEvidenceLibrary.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findCase(slug);

  if (!item) return { title: "Case not found" };

  // أول سكرين شوت هو صورة المشاركة — أنسب بكتير من اللوجو العام
  const shots = caseScreenshotsByEvidenceId[item.id] ?? [];
  const ogImage = absoluteUrl(item.image ?? shots[0] ?? "Assets/art-gallery/Images/logo/3omda.webp");
  const title = `${item.title} | Ahmed Emad Nasr`;

  return {
    title,
    description: item.description,
    keywords: [...item.tags, ...item.tools, item.category, item.platform],
    alternates: { canonical: `/blog/${item.id}` },
    openGraph: {
      title,
      description: item.description,
      url: caseUrl(item.id),
      type: "article",
      publishedTime: item.date,
      images: [{ url: ogImage, alt: `${item.title} — screenshot` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: item.description,
      images: [ogImage],
    },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findCase(slug);

  if (!item) notFound();

  const screenshots = [...(caseScreenshotsByEvidenceId[item.id] ?? [])];

  // ترتيب المكتبة هو نفسه ترتيب السابق/التالي — عشان التنقل يبقى متوقع
  const index = caseEvidenceLibrary.findIndex((c) => c.id === item.id);
  const previous = index > 0 ? caseEvidenceLibrary[index - 1] : null;
  const next = index < caseEvidenceLibrary.length - 1 ? caseEvidenceLibrary[index + 1] : null;

  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${caseUrl(item.id)}#article`,
        headline: item.title,
        description: item.description,
        datePublished: item.date,
        dateModified: item.date,
        inLanguage: "en",
        articleSection: item.category,
        keywords: [...item.tags, ...item.tools].join(", "),
        timeRequired: `PT${item.readTime}M`,
        author: { "@type": "Person", name: "Ahmed Emad Nasr" },
        publisher: { "@type": "Person", name: "Ahmed Emad Nasr" },
        mainEntityOfPage: caseUrl(item.id),
        image: screenshots.slice(0, 3).map((shot) => absoluteUrl(shot)),
        /* associatedMedia بيتحط بس لو فيه PDF فعلاً — الحالات اللي أدلتها
           صور بس مبتدّعيش وجود مستند. */
        ...(item.href
          ? {
              associatedMedia: {
                "@type": "DigitalDocument",
                name: item.title,
                encodingFormat: "application/pdf",
                contentUrl: absoluteUrl(item.href),
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: item.title, item: caseUrl(item.id) },
        ],
      },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <CaseArticle
        item={item}
        screenshots={screenshots}
        previous={previous ? { id: previous.id, title: previous.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        techniques={techniquesFor(item.id)}
        related={relatedTo(item)}
      />
    </>
  );
}
