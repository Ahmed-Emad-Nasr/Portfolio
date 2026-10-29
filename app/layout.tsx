/*
 * Root layout: providers, site-wide metadata and the Person / WebSite JSON-LD.
 * The visual system (theme transition, Lenis, katana cursor, boot screen,
 * command palette) is the Sensei-Dev design
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0).
 */

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/* Google fonts via next/font; the site's own Yuji Syuku cut is a local @font-face */
import { fontVariables } from "./fonts";
import "./fonts-yuji-site.css";
import "./globals.css";

import { knowledgeEducationItems } from "@/data/experience";
import { certificationsJsonLd } from "@/data/certifications";
import { skillGroups } from "@/data/skills";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeFxProvider } from "@/components/layout/ThemeFxProvider";
import PaletteMount from "@/components/layout/PaletteMount";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import CursorMount from "@/components/layout/CursorMount";
import MotionProvider from "@/components/layout/MotionProvider";
import { CONTENT_SECURITY_POLICY } from "@/lib/security";
import KeyboardShortcuts from "@/components/layout/KeyboardShortcuts";
import DeferredGlobalEffects from "@/components/layout/DeferredGlobalEffects";
import ServiceWorkerRegister from "@/components/layout/ServiceWorkerRegister";
import { normalizePublicHref, YOUTUBE_CHANNEL_URL } from "@/lib/shared";
import { OG_IMAGE } from "@/lib/site";
import {
  CHANNEL_ID, jsonLd, KEYWORDS, OCCUPATION, PERSON_ID, PERSON_IMAGE, PERSON_NAME, PERSON_REF,
  SAME_AS, SITE_KEYWORDS, SITE_URL, WEBSITE_ID,
} from "@/lib/seo";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
  /* No maximumScale / userScalable: pinch-zoom stays available (WCAG 1.4.4) */
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  referrer: "strict-origin-when-cross-origin",
  metadataBase: new URL(SITE_URL),
  applicationName: "Ahmed Emad Nasr Portfolio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ahmed Portfolio",
    /* Absolute: Next does not add the basePath to startupImage */
    startupImage: [`${SITE_URL}icons/icon-512.png`],
  },
  /* Declared explicitly (with the basePath): setting `icons` stops Next from
     emitting app/favicon.ico by itself. iOS needs a PNG touch icon. */
  icons: {
    icon: [
      { url: normalizePublicHref("favicon.ico"), sizes: "48x48" },
      { url: normalizePublicHref("icons/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: normalizePublicHref("icons/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }],
  },
  manifest: "manifest.webmanifest",
  title: {
    default: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | Information Security Officer",
    template: "%s | Ahmed Emad Nasr",
  },
  description:
    "Ahmed Emad Nasr, information security officer: GRC and compliance, SOC operations, incident response and DFIR, malware analysis, IAM and data security.",
  keywords: SITE_KEYWORDS,
  authors: [{ name: "Ahmed Emad Nasr" }],
  creator: "Ahmed Emad Nasr",
  publisher: "Ahmed Emad Nasr",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | Information Security Officer",
    description: "GRC, SOC, incident response & DFIR, malware analysis, IAM and data security — with the reports to show for it.",
    type: "website",
    url: SITE_URL,
    locale: "en_US",
    siteName: "Ahmed Emad Nasr Portfolio",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | Information Security Officer",
    description: "GRC & compliance, SOC, incident response & DFIR, IAM and data security — and the security training behind them.",
    creator: "@0x3omda",
    site: "@0x3omda",
    images: [OG_IMAGE.url],
  },
  verification: {
    google: "VCIeVhcDb-vQGmE68weZARtruR_F2bUwv6hcjKYdwqo",
  },
  /* Location and audience hints read by Bing, Yandex and local search. */
  other: {
    "geo.region": "EG-C",
    "geo.placename": "Cairo, Egypt",
    "geo.position": "30.0444;31.2357",
    ICBM: "30.0444, 31.2357",
  },
};

// ─── Structured data ──────────────────────────────────────────────────────────

/* Organisations from the timeline, as schema.org nodes. Current = no endDate. */
type Org = { name: string; url?: string; education: boolean };
const orgNode = (org: Org) => ({
  "@type": org.education ? "EducationalOrganization" : "Organization",
  name: org.name,
  ...(org.url ? { url: org.url } : {}),
});
const uniqueOrgs = (orgs: Org[]) => [...new Map(orgs.map((org) => [org.name, org])).values()];
const timelineOrgs = knowledgeEducationItems
  .filter((item) => item.subTag)
  .map((item) => ({
    name: item.subTag as string,
    url: item.subTagHyperlink as string | undefined,
    current: !("endDate" in item && item.endDate),
    education: item.kind === "education",
    work: item.kind === "work",
  }));
const currentOrgs = uniqueOrgs(timelineOrgs.filter((org) => org.current && org.work));
const alumniOrgs = uniqueOrgs(timelineOrgs.filter((org) => org.education));

/* Site-wide graph: only what is true on every page (person, channel,
   website). Pages add their own nodes. */
const STRUCTURED_DATA_JSON = jsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: PERSON_NAME,
      givenName: "Ahmed",
      additionalName: "Emad",
      familyName: "Nasr",
      alternateName: ["Ahmed Emad", "3omda", "0x3omda", "أحمد عماد نصر"],
      url: SITE_URL,
      mainEntityOfPage: { "@id": `${SITE_URL}#profilepage` },
      image: { "@type": "ImageObject", "@id": `${SITE_URL}#person-image`, url: PERSON_IMAGE, caption: PERSON_NAME },
      jobTitle: ["Information Security Officer", "GRC Analyst", "SOC Analyst", "DFIR Analyst", "Cybersecurity Instructor"],
      /* The standard occupation (O*NET 15-1212.00) plus the skills behind it —
         how Google matches a person to job-related searches. */
      hasOccupation: { ...OCCUPATION, skills: skillGroups.flatMap((group) => group.items).join(", ") },
      knowsAbout: [...new Set([...KEYWORDS.grc, ...KEYWORDS.operations, ...KEYWORDS.response, ...KEYWORDS.identityData, ...skillGroups.flatMap((group) => group.items)])],
      knowsLanguage: [
        { "@type": "Language", name: "Arabic", alternateName: "ar" },
        { "@type": "Language", name: "English", alternateName: "en" },
      ],
      hasCredential: certificationsJsonLd(PERSON_ID),
      description: "Information security officer working across governance, risk and compliance, security operations, incident response and DFIR, malware analysis, identity and access management, and data security.",
      /* Where he works and studied, as organisations rather than strings — the
         current roles are the ones without an endDate. */
      worksFor: currentOrgs.map(orgNode),
      alumniOf: alumniOrgs.map(orgNode),
      nationality: { "@type": "Country", name: "Egypt" },
      homeLocation: { "@type": "Place", name: "Cairo, Egypt", address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" } },
      email: "mailto:ahmed.em.nasr@gmail.com",
      telephone: "+20 101 397 2690",
      address: { "@type": "PostalAddress", addressLocality: "Cairo/Benha", addressCountry: "EG" },
      contactPoint: {
        "@type": "ContactPoint", contactType: "professional inquiry",
        email: "ahmed.em.nasr@gmail.com", availableLanguage: ["en", "ar"],
      },
      /* Every public profile that is the same person — the identity graph
         a knowledge panel is built from. */
      sameAs: [...SAME_AS],
      owns: { "@id": CHANNEL_ID },
    },
    {
      /* The channel as its own node, so every VideoObject on the home page can
         point at it and at the person who runs it. */
      "@type": "Organization",
      "@id": CHANNEL_ID,
      name: "Ahmed Emad — Cybersecurity (YouTube)",
      url: YOUTUBE_CHANNEL_URL,
      sameAs: [YOUTUBE_CHANNEL_URL],
      founder: PERSON_REF,
      description: "Arabic-language cybersecurity tutorials: SOC labs, Wazuh SIEM, malware analysis, attack simulation, GRC and security fundamentals.",
      knowsLanguage: ["ar", "en"],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Ahmed Emad Nasr Portfolio",
      alternateName: ["Ahmed Emad Nasr", "3omda Portfolio", "Ahmed Emad Nasr — Information Security"],
      url: SITE_URL,
      description: "The information security portfolio of Ahmed Emad Nasr: GRC, SOC, incident response, DFIR, malware analysis, IAM and data security — with case reports, projects, videos and certifications.",
      inLanguage: "en",
      author: PERSON_REF,
      publisher: PERSON_REF,
      copyrightHolder: PERSON_REF,
      keywords: SITE_KEYWORDS.join(", "),
    },
  ],
});

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Production only: the dev server needs eval and a websocket for HMR */}
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        )}
        {/* Before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              /* .large-text when the reader raised the default font size
                 (globals.css lets layouts wrap in that mode) */
              'try{var d=document.documentElement,e=document.createElement("i");e.style.cssText="position:absolute;font-size:medium";d.appendChild(e);if(parseFloat(getComputedStyle(e).fontSize)>=20)d.classList.add("large-text");d.removeChild(e)}catch(e){}',
          }}
        />
        {/* framer-motion entrances start at opacity 0 in the HTML; without
            JavaScript they would never play, so show them as they are */}
        <noscript>
          <style>{'[style*="opacity:0"],[style*="translateY(110%)"]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-clip">
        <MotionProvider>
        <ThemeProvider>
          <ThemeFxProvider>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }}
            />
            <PaletteMount />
            <KeyboardShortcuts />
            <DeferredGlobalEffects />
            <SmoothScroll>
              <CursorMount />
              {children}
            </SmoothScroll>
            <ServiceWorkerRegister />
          </ThemeFxProvider>
        </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
