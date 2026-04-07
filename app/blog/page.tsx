import type { Metadata } from "next";
import BlogPageClient from "./page-client";
import { caseEvidenceLibrary } from "@/app/core/data";

const SITE_BASE_URL = "https://ahmed-emad-nasr.github.io/Portfolio";

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

const casesStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cybersecurity PDF Cases and Reports",
  url: `${SITE_BASE_URL}/blog`,
  hasPart: pdfResources.map((item, index) => ({
    "@type": "DigitalDocument",
    "@id": `${SITE_BASE_URL}/blog#pdf-${index + 1}`,
    name: item.title,
    genre: item.type,
    contentUrl: toAbsoluteAssetUrl(item.href),
    encodingFormat: "application/pdf",
  })),
};

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Cybersecurity blog resources from Ahmed Emad Nasr, including PDF case studies and YouTube technical videos.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(casesStructuredData) }}
      />
      <BlogPageClient />
    </>
  );
}