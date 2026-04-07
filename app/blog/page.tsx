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
  name: "Cybersecurity Blog - SOC Incident Reports, DFIR Writeups & Threat Analysis",
  description: "Comprehensive collection of SOC incident response reports, cybersecurity writeups, and threat analysis cases with screenshots and documentation",
  url: `${SITE_BASE_URL}/blog`,
  publisher: {
    "@type": "Person",
    name: "Ahmed Emad Nasr",
    sameAs: "https://linkedin.com/in/ahmedoadnasr",
  },
  hasPart: pdfResources.map((item, index) => ({
    "@type": "DigitalDocument",
    "@id": `${SITE_BASE_URL}/blog#pdf-${index + 1}`,
    name: item.title,
    description: (caseEvidenceLibrary[index] as any)?.description || item.title,
    genre: item.type,
    contentUrl: toAbsoluteAssetUrl(item.href),
    encodingFormat: "application/pdf",
    author: {
      "@type": "Person",
      name: "Ahmed Emad Nasr",
    },
    datePublished: (caseEvidenceLibrary[index] as any)?.date || "2025-01-01",
    keywords: (caseEvidenceLibrary[index] as any)?.tags?.join(", ") || "cybersecurity, incident response",
  })),
  keywords: "SOC analyst, incident response, cybersecurity, DFIR, threat analysis, writeups, case studies, security reports",
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

export const metadata: Metadata = {
  title: "Blog - SOC Incident Reports & Cybersecurity Writeups",
  description:
    "Explore SOC incident response reports, DFIR investigations, and cybersecurity threat analysis cases with detailed documentation and screenshots.",
  keywords: [
    "SOC analyst reports",
    "incident response writeups",
    "cybersecurity cases",
    "DFIR investigations",
    "threat analysis",
    "security documentation",
    "LetsDefend simulations",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    title: "Blog - SOC Incident Reports & Cybersecurity Writeups",
    description:
      "Comprehensive SOC incident response reports, DFIR writeups, and threat analysis cases with screenshots.",
    siteName: "Ahmed Emad Nasr - Security Analyst",
    images: [
      {
        url: "/Assets/art-gallery/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Security Analysis Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@AhmedEmad",
    title: "Blog - SOC Incident Reports & Cybersecurity Writeups",
    description:
      "Explore incident response cases, threat analysis, and security investigations.",
    images: ["/Assets/art-gallery/logo/logo.png"],
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(casesStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPageClient />
    </>
  );
}