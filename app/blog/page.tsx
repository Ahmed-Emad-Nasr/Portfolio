import type { Metadata } from "next";
import BlogPageClient from "./page-client";
// Server Component: reads the case library at build time. It's passed as a prop
// so that page-client (a client component) doesn't import it and drag the data into the browser.
import StartHere from "./components/StartHere";
import { caseEvidenceLibrary, caseScreenshotsByEvidenceId } from "@/app/core/config/cases";
import type { PdfResource } from "./blog-types";
import type { Facet } from "./components/BlogFilterBar";

const SITE_BASE_URL = "https://ae-nasr.github.io/Portfolio";

const toAbsoluteAssetUrl = (href: string): string => {
  if (/^https?:\/\//i.test(href)) return href;
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return `${SITE_BASE_URL}${normalized}`;
};

const pdfResources = [
  {
    id: "soc-analyst-cv",
    title: "Ahmed Emad SOC Analyst CV",
    type: "PDF CV",
    href: "Assets/cv/AhmedEmadNasr_CV.pdf",
  },
  ...caseEvidenceLibrary,
];

/*
 * ─── Blog filters, computed here once at build time ──────────────────────
 *
 * These computations (blogPdfResources, SEARCH_INDEX, the filters, the ordering,
 * and the CASE_IDS guard) used to run inside page-client.tsx — i.e. in every visitor's browser on
 * every page load. The library is only 38 items so the cost was already small, but moving
 * them here means:
 *   1. The CASE_IDS guard (if someone adds a case without a detail page) stops the build
 *      when the data is wrong, instead of throwing an error in the visitor's browser after publishing.
 *   2. The code that computes these (helper functions like countValues) is never sent
 *      to the browser at all.
 *
 * The actual size that reaches the browser doesn't change: BlogCard renders every field of the
 * case (title, description, tags, tools...) for all 38 cards, so the text itself
 * has to arrive either way. What changed is only where the computation happens, not the data size.
 */
const wannacryId = "malware-analysis-wannacry";
const wannacryCase = caseEvidenceLibrary.find((item) => item.id === wannacryId);

const cvResource: PdfResource = {
  id: "soc-analyst-cv",
  title: "Ahmed Emad Nasr SOC & Cybersecurity Analyst CV",
  platform: "Professional Profile",
  type: "PDF CV",
  href: "Assets/cv/AhmedEmadNasr_CV.pdf",
  detailHref: "/cv",
};

const blogPdfResources: PdfResource[] = wannacryCase
  ? [cvResource, wannacryCase, ...caseEvidenceLibrary.filter((item) => item.id !== wannacryId)]
  : [cvResource, ...caseEvidenceLibrary];

/*
 * Guard: every item in the library must have a detail page that actually exists — either
 * because it's a case (and its id is in caseEvidenceLibrary) or because it specifies
 * detailHref itself. It now runs at build time, so if someone adds an incomplete case
 * the build itself fails instead of shipping a silent 404 link to the published site.
 */
const CASE_IDS = new Set(caseEvidenceLibrary.map((item) => item.id));
for (const item of blogPdfResources) {
  if (!item.detailHref && !CASE_IDS.has(item.id)) {
    throw new Error(
      `[blog] "${item.id}" is in the library but has no generated case page. ` +
      `Either add it to caseEvidenceLibrary, or give it an explicit detailHref.`,
    );
  }
}

const PDF_DATE_MS: Record<string, number> = Object.fromEntries(
  blogPdfResources.map((item) => [item.id, item.date ? new Date(item.date).getTime() : 0]),
);

// Everything someone might search for a single case by, gathered into one
// lowercase string once at build time. Searching in the browser afterwards is just
// includes() on that prepared string.
const SEARCH_INDEX: Record<string, string> = Object.fromEntries(
  blogPdfResources.map((item) => [
    item.id,
    [
      item.title,
      item.description,
      item.platform,
      item.type,
      item.category,
      item.difficulty,
      ...(item.tags ?? []),
      ...(item.tools ?? []),
      ...(item.skillsGained ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  ]),
);

/** A simple counter that returns values sorted by frequency */
const countValues = (values: (string | undefined)[]): Facet[] => {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const CATEGORY_FACETS = countValues(caseEvidenceLibrary.map((item) => item.category));

// There are many tools, so we take only the most common — a very long chip list is noise, not filtering
const TOOL_FACETS = countValues(
  caseEvidenceLibrary.flatMap((item) => [...(item.tools ?? [])]),
).slice(0, 12);

// The default order (CV, the featured case, then newest and those with images
// first) is fixed and doesn't change with visitor interaction, so it's computed here once.
const sortedPdfs: PdfResource[] = [...blogPdfResources].sort((a, b) => {
  if (a.id === cvResource.id) return -1;
  if (b.id === cvResource.id) return 1;
  if (a.id === wannacryId) return -1;
  if (b.id === wannacryId) return 1;

  const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
  const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
  if (aShots !== bShots) return aShots ? -1 : 1;

  return (PDF_DATE_MS[b.id] ?? 0) - (PDF_DATE_MS[a.id] ?? 0);
});

const totalCasesCount = caseEvidenceLibrary.length;
const casesWithScreenshotsCount = caseEvidenceLibrary.filter(
  (i) => (caseScreenshotsByEvidenceId[i.id] ?? []).length > 0,
).length;
const totalScreenshotAssets = Object.values(caseScreenshotsByEvidenceId).reduce(
  (sum, shots) => sum + shots.length,
  0,
);

// ─── Structured Data ──────────────────────────────────────────────────────────

const casesStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | Cybersecurity Blog - SOC Incident Reports, DFIR Writeups & Malware Analysis",
  description:
    "Comprehensive collection of SOC incident response reports, DFIR writeups, malware analysis, and threat hunting cases with detailed documentation.",
  url: `${SITE_BASE_URL}/blog`,
  publisher: {
    "@type": "Person",
    name: "Ahmed Emad Nasr",
    jobTitle: ["SOC Analyst", "Incident Response Analyst", "Cybersecurity Analyst"], // unified job title
    sameAs: [
      "https://linkedin.com/in/ahmed-emad-nasr/", // LinkedIn URL updated to match the CV
      "https://x.com/0x3omda",
      "https://github.com/AE-Nasr"
    ],
  },
  /* Cases without a PDF are excluded here: a DigitalDocument without a contentUrl
     claims a file exists that doesn't. */
  hasPart: pdfResources
    .filter((item): item is typeof item & { href: string } => Boolean(item.href))
    .map((item, index) => ({
    "@type": "DigitalDocument",
    "@id": `${SITE_BASE_URL}/blog#pdf-${index + 1}`,
    name: item.title,
    description: (item as any)?.description || item.title,
    genre: item.type,
    contentUrl: toAbsoluteAssetUrl(item.href),
    encodingFormat: "application/pdf",
    author: { "@type": "Person", name: "Ahmed Emad Nasr" },
    datePublished: (item as any)?.date || "2025-01-01",
    keywords:
      (item as any)?.tags?.join(", ") || "cybersecurity, incident response, SOC, DFIR",
  })),
  keywords:
    "SOC analyst, incident response, cybersecurity, DFIR, threat analysis, writeups, security reports, malware analysis",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Portfolio",
      item: `${SITE_BASE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_BASE_URL}/blog`,
    },
  ],
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Ahmed Emad Nasr | Blog - SOC Incident Reports & Cybersecurity Writeups",
  description:
    "Explore SOC incident response reports, DFIR investigations, malware analysis, and cybersecurity threat analysis cases with detailed documentation.",
  keywords: [
    "SOC analyst reports",
    "incident response writeups",
    "cybersecurity cases",
    "DFIR investigations",
    "threat analysis",
    "malware analysis",
    "security documentation",
    "LetsDefend simulations",
    "Wazuh",
    "SIEM"
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_BASE_URL}/blog`,
    title: "Ahmed Emad Nasr | Blog - SOC Incident Reports & Cybersecurity Writeups",
    description:
      "Comprehensive SOC incident response reports, DFIR writeups, malware analysis, and threat hunting cases.",
    siteName: "Ahmed Emad Nasr - SOC & Cybersecurity Analyst", // updated siteName
    images: [
      {
        /*
         * This was "/Assets/art-gallery/logo/logo.png" — and the comment that used to be here
         * doubted the path, rightly: `Images/` was missing and the extension was wrong. The
         * real file is Images/logo/My_Logo.webp, which is what's used everywhere
         * else in the project.
         *
         * The result was that any share of the blog page on LinkedIn, Twitter or
         * WhatsApp showed up without an image.
         */
        url: toAbsoluteAssetUrl("/Assets/art-gallery/Images/logo/3omda.webp"),
        width: 1200,
        height: 630,
        alt: "Security Analysis Blog by Ahmed Emad Nasr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@0x3omda", // handle unified to match the portfolio
    site: "@0x3omda",
    title: "Ahmed Emad Nasr | Blog - SOC & DFIR Reports",
    description:
      "Explore incident response cases, threat analysis, malware reverse engineering, and security investigations.",
    /* The same wrong og:image path was repeated here too — the first one was fixed
       and this one was missed. The asset-check script caught it. */
    images: [toAbsoluteAssetUrl("/Assets/art-gallery/Images/logo/3omda.webp")],
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(casesStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <BlogPageClient
        startHere={<StartHere />}
        sortedPdfs={sortedPdfs}
        searchIndex={SEARCH_INDEX}
        categoryFacets={CATEGORY_FACETS}
        toolFacets={TOOL_FACETS}
        totalCasesCount={totalCasesCount}
        casesWithScreenshotsCount={casesWithScreenshotsCount}
        totalScreenshotAssets={totalScreenshotAssets}
        cvResourceId={cvResource.id}
      />
    </>
  );
}