/*
 * blog/[slug]/page.tsx
 * Author: Ahmed Emad Nasr
 *
 * A standalone page for every case. The real benefit isn't the look — it's that every report now has
 * its own real URL, title and OG image, so when you send a case link on LinkedIn
 * or to someone in an interview it shows up with its own image and title, not the whole blog's title.
 * Google also indexes it as a page of its own instead of being part of one big page.
 *
 * Everything is static: generateStaticParams produces every page at build time, compatible
 * with output: "export".
 *
 * The same URL space serves the written posts (content/posts/*.mdx): a slug
 * is a post or a case, never both (core/content/posts.ts fails the build on
 * a clash), so links stay short — /blog/<slug> — whichever it is.
 */

import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import CaseArticle from "./CaseArticle";
import { PageShell } from "@/app/components/shared/kit";
import { absoluteUrl, caseUrl, summarize } from "@/app/core/config/site";
import { caseAttackMapping, parentTechnique, techniquesForCase } from "@/app/core/config/attack";
import { caseDetails } from "@/app/core/config/case-details";
import { caseKindOf, CASE_KINDS, WSA_COLLECTION } from "@/app/core/config/shared";
import { jsonLd, PERSON_ID, PERSON_NAME, SITE_URL } from "@/app/core/config/seo";
import { getAllPosts, getPost, getPostNeighbours, type Post } from "@/app/core/content/posts";
import PostArticle from "@/app/components/blog/PostArticle";

const findCase = (slug: string) => caseEvidenceLibrary.find((item) => item.id === slug);

// dynamicParams = false: any slug not in the list becomes a 404 at build time instead of
// trying to render at runtime (which doesn't exist in a static export anyway).
export const dynamicParams = false;


/*
 * Extra details are computed here (Server Component) and passed ready-made to the component —
 * so not a single byte of them ends up in the browser bundle.
 */

/** This case's ATT&CK techniques (sub-techniques included), with full names */
const techniquesFor = techniquesForCase;

/*
 * Reports related to this one.
 *
 * Ordering: shared ATT&CK techniques first (the strongest signal of real
 * similarity), then shared tools, then the same category. Any case with no
 * overlap at all doesn't appear — random "suggestions" are worse than no suggestions.
 */
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
  return [...caseEvidenceLibrary.map((item) => ({ slug: item.id })), ...getAllPosts().map((p) => ({ slug: p.slug }))];
}

/* ─── Written posts ─────────────────────────────────────────────────────── */

function postMetadata(post: Post): Metadata {
  const url = absoluteUrl(`/blog/${post.slug}`);
  /* The post's own cover, else its generated share card
     (scripts/og/generate-post-og.mjs), else the site card */
  const card = `og/posts/${post.slug}.jpg`;
  const hasCard = existsSync(join(process.cwd(), "public", card));
  const image = post.cover ? absoluteUrl(post.cover) : absoluteUrl(hasCard ? card : "og-image.png");
  const shareTitle = `${post.title} | Ahmed Emad Nasr`;
  return {
    title: post.title,
    description: summarize(post.description),
    keywords: [...post.tags, "Ahmed Emad Nasr"],
    authors: [{ name: PERSON_NAME, url: SITE_URL }],
    alternates: { canonical: `/blog/${post.slug}` },
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: shareTitle,
      description: summarize(post.description, 200),
      siteName: "Ahmed Emad Nasr Portfolio",
      locale: post.lang === "ar" ? "ar_EG" : "en_US",
      url,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [SITE_URL],
      tags: post.tags,
      images: [{ url: image, ...(hasCard && !post.cover ? { width: 1200, height: 630 } : {}), alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: summarize(post.description, 200), site: "@0x3omda", creator: "@0x3omda", images: [image] },
  };
}

function PostPage({ post }: { post: Post }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const structuredData = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: post.lang,
        keywords: post.tags.join(", "),
        timeRequired: `PT${post.readTime}M`,
        wordCount: post.source.split(/\s+/).filter(Boolean).length,
        author: AUTHOR,
        publisher: AUTHOR,
        isPartOf: post.series
          ? [{ "@id": `${absoluteUrl("/blog")}#blog` }, { "@type": "CreativeWorkSeries", name: post.series }]
          : { "@id": `${absoluteUrl("/blog")}#blog` },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        ...(post.cover ? { image: absoluteUrl(post.cover) } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <PageShell>
        <PostArticle post={post} neighbours={getPostNeighbours(post.slug)} />
      </PageShell>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (post) return postMetadata(post);
  const item = findCase(slug);

  if (!item) return { title: "Case not found" };

  // The generated share card (scripts/og/generate-case-og.mjs) when it exists,
  // else the first screenshot, else the portrait
  const shots = caseScreenshotsByEvidenceId[item.id] ?? [];
  const card = `og/cases/${item.id}.jpg`;
  const hasCard = existsSync(join(process.cwd(), "public", card));
  const ogImage = absoluteUrl(hasCard ? card : item.image ?? shots[0] ?? "Assets/art-gallery/Images/logo/3omda.webp");
  /* The root layout's title template already appends "| Ahmed Emad Nasr";
     the share cards have no template, so they carry the name themselves. */
  const shareTitle = `${item.title} | Ahmed Emad Nasr`;
  const description = summarize(item.description ?? "");
  const shareDescription = summarize(item.description ?? "", 200);

  return {
    title: item.title,
    description,
    keywords: [...new Set([...item.tags, ...item.tools, item.category, item.platform, `${item.platform} write-up`, `${item.category} report`, ...techniquesFor(item.id).map((t) => `${t.id} ${t.name}`), "Ahmed Emad Nasr"])],
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
  const post = getPost(slug);
  if (post) return <PostPage post={post} />;
  const item = findCase(slug);

  if (!item) notFound();

  const screenshots = [...(caseScreenshotsByEvidenceId[item.id] ?? [])];

  // The library order is the previous/next order too — so navigation is predictable
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
        /* @id ties every report to the one Person node from layout.tsx;
           name and url stay inline for parsers that do not follow @id. */
        author: AUTHOR,
        publisher: AUTHOR,
        copyrightHolder: AUTHOR,
        isPartOf: { "@id": `${absoluteUrl("/blog")}#cases` },
        mainEntityOfPage: { "@type": "WebPage", "@id": caseUrl(item.id) },
        about: [
          ...[...new Set([item.category, ...item.tags])].map((name) => ({ "@type": "Thing", name })),
          /* The ATT&CK techniques as defined terms in MITRE's own term set */
          ...techniquesFor(item.id).map((t) => ({
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
        /* associatedMedia is only set if there is actually a PDF — image-only
           cases don't claim a document exists. */
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
        techniques={techniquesFor(item.id)}
        related={relatedTo(item)}
        detail={caseDetails[item.id]}
        kindLabel={CASE_KINDS.find((k) => k.id === caseKindOf(item))?.short ?? "Case"}
        collection={item.platform === WSA_COLLECTION.platform ? { href: `/collections/${WSA_COLLECTION.id}`, title: WSA_COLLECTION.title } : undefined}
      />
      </PageShell>
    </>
  );
}
