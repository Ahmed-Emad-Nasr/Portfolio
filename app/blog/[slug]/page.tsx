/*
 * /blog/<case-id> — one static page per case, with its own title, share card
 * and TechArticle JSON-LD.
 */

import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/data/cases";
import CaseArticle from "@/components/blog/CaseArticle";
import { PageShell } from "@/components/ui/kit";
import { absoluteUrl, caseUrl, summarize } from "@/lib/site";
import { caseAttackMapping, parentTechnique, techniquesForCase } from "@/data/attack";
import { caseDetails } from "@/data/case-details";
import { caseKindOf, CASE_KINDS, WSA_COLLECTION } from "@/lib/shared";
import { jsonLd, PERSON_ID, PERSON_NAME, SITE_URL } from "@/lib/seo";
import { blogYoutubeVideos } from "@/data/youtube";

const findCase = (slug: string) => caseEvidenceLibrary.find((item) => item.id === slug);

/* Any other slug is a 404 */
export const dynamicParams = false;

/* Related reports: shared ATT&CK techniques weigh most, then shared tools,
   then the same category; no overlap at all → not suggested */
const relatedTo = (item: (typeof caseEvidenceLibrary)[number], limit = 3) => {
  const myTechniques = new Set((caseAttackMapping[item.id] ?? []).map(parentTechnique));
  const myTools = new Set(item.tools ?? []);

  return caseEvidenceLibrary
    .filter((other) => other.id !== item.id)
    .map((other) => {
      const sharedTechniques = [...new Set((caseAttackMapping[other.id] ?? []).map(parentTechnique))]
        .filter((t) => myTechniques.has(t)).length;
      const sharedTools = (other.tools ?? []).filter((t) => myTools.has(t)).length;
      const sameCategory = other.category === item.category ? 1 : 0;
      return {
        id: other.id,
        title: other.title,
        category: other.category,
        readTime: other.readTime,
        // Weights: a shared technique counts far more than a shared tool
        score: sharedTechniques * 5 + sharedTools * 2 + sameCategory,
        sharedTechniques,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
};

const AUTHOR = { "@type": "Person", "@id": PERSON_ID, name: PERSON_NAME, url: SITE_URL } as const;

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

  /* The generated share card (npm run og:cases), else a screenshot, else the portrait */
  const shots = caseScreenshotsByEvidenceId[item.id] ?? [];
  const card = `og/cases/${item.id}.jpg`;
  const hasCard = existsSync(join(process.cwd(), "public", card));
  const ogImage = absoluteUrl(hasCard ? card : item.image ?? shots[0] ?? "Assets/art-gallery/Images/logo/3omda.webp");
  /* Share titles carry the name themselves (no title template there) */
  const shareTitle = `${item.title} | Ahmed Emad Nasr`;
  const description = summarize(item.description ?? "");
  const shareDescription = summarize(item.description ?? "", 200);

  return {
    title: item.title,
    description,
    keywords: [...new Set([...item.tags, ...item.tools, item.category, item.platform, `${item.platform} write-up`, `${item.category} report`, ...techniquesForCase(item.id).map((t) => `${t.id} ${t.name}`), "Ahmed Emad Nasr"])],
    authors: [{ name: PERSON_NAME, url: SITE_URL }],
    alternates: { canonical: `/blog/${item.id}` },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      siteName: "Ahmed Emad Nasr Portfolio",
      locale: "en_US",
      url: caseUrl(item.id),
      type: "article",
      publishedTime: item.date,
      modifiedTime: item.date,
      authors: [SITE_URL],
      section: item.category,
      tags: [...item.tags, ...item.tools],
      images: [{ url: ogImage, ...(hasCard ? { width: 1200, height: 630 } : {}), alt: `${item.title} — Ahmed Emad Nasr` }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      site: "@0x3omda",
      creator: "@0x3omda",
      images: [ogImage],
    },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findCase(slug);

  if (!item) notFound();

  const screenshots = [...(caseScreenshotsByEvidenceId[item.id] ?? [])];
  const relatedVideos = blogYoutubeVideos
    .filter((video) => video.caseId === item.id)
    .map((video) => ({
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      sourceUrl: `https://youtu.be/${video.videoId}`,
    }));

  /* Previous / next follow the library order */
  const index = caseEvidenceLibrary.findIndex((c) => c.id === item.id);
  const previous = index > 0 ? caseEvidenceLibrary[index - 1] : null;
  const next = index < caseEvidenceLibrary.length - 1 ? caseEvidenceLibrary[index + 1] : null;

  const structuredData = jsonLd({
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
        author: AUTHOR,
        publisher: AUTHOR,
        copyrightHolder: AUTHOR,
        isPartOf: { "@id": `${absoluteUrl("/blog")}#cases` },
        mainEntityOfPage: { "@type": "WebPage", "@id": caseUrl(item.id) },
        about: [
          ...[...new Set([item.category, ...item.tags])].map((name) => ({ "@type": "Thing", name })),
          /* The ATT&CK techniques as defined terms in MITRE's own term set */
          ...techniquesForCase(item.id).map((t) => ({
            "@type": "DefinedTerm",
            termCode: t.id,
            name: t.name,
            url: `https://attack.mitre.org/techniques/${t.id.replace(".", "/")}/`,
            inDefinedTermSet: { "@type": "DefinedTermSet", name: "MITRE ATT&CK", url: "https://attack.mitre.org/" },
          })),
        ],
        mentions: item.tools.map((name) => ({ "@type": "SoftwareApplication", name, applicationCategory: "SecurityApplication" })),
        isAccessibleForFree: true,
        proficiencyLevel: item.difficulty,
        image: screenshots.slice(0, 3).map((shot) => absoluteUrl(shot)),
        /* Only when there is a PDF */
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
          { "@type": "ListItem", position: 2, name: "Case library", item: `${absoluteUrl("/blog")}#cases` },
          { "@type": "ListItem", position: 3, name: item.title, item: caseUrl(item.id) },
        ],
      },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <PageShell>
        <CaseArticle
        item={item}
        screenshots={screenshots}
        previous={previous ? { id: previous.id, title: previous.title } : null}
        next={next ? { id: next.id, title: next.title } : null}
        techniques={techniquesForCase(item.id)}
        related={relatedTo(item)}
        relatedVideos={relatedVideos}
        detail={caseDetails[item.id]}
        kindLabel={CASE_KINDS.find((k) => k.id === caseKindOf(item))?.short ?? "Case"}
        collection={item.platform === WSA_COLLECTION.platform ? { href: `/collections/${WSA_COLLECTION.id}`, title: WSA_COLLECTION.title } : undefined}
        />
      </PageShell>
    </>
  );
}
