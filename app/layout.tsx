/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 *
 * Root layout. The visual system — theme provider with the water-drop
 * light/dark transition, Lenis smooth scroll, the katana cursor, the boot
 * screen and the command palette — is the Sensei-Dev design
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0). The metadata and
 * structured data are this site's own.
 */

import React from "react";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/* The Sensei-Dev font set, exactly as that site loads it: self-hosted
   @font-face rules split by unicode-range (app/fonts/<family>/*.woff2). */
import "./fonts.css";
import "./fonts-arabic.css";
/* Yuji Syuku cut to the characters in use — after fonts.css on purpose:
   the last-declared face wins, so the 23 kanji slices are never fetched */
import "./fonts-yuji-site.css";
import "./globals.css";

import { knowledgeEducationItems } from "@/app/core/config/experience";
import { certificationsJsonLd } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups } from "@/app/core/config/skills";
import { ThemeProvider } from "@/app/core/components/ThemeProvider";
import { ThemeFxProvider } from "@/app/core/theme/ThemeFxProvider";
import { SpotlightHost } from "@/app/core/components/Motion";
import PaletteMount from "@/app/core/components/PaletteMount";
import { SmoothScroll } from "@/app/core/components/SmoothScroll";
import CursorMount from "@/app/core/components/CursorMount";
import AppLoader from "@/app/core/components/AppLoader";
import MotionProvider from "@/app/core/components/MotionProvider";
import { CONTENT_SECURITY_POLICY } from "@/app/core/config/security";
import KeyboardShortcuts from "@/app/core/components/KeyboardShortcuts";
import ServiceWorkerRegister from "@/app/core/components/ServiceWorkerRegister";
import Analytics from "@/app/core/components/Analytics";
import { HAS_SERVICE_WORKER } from "@/app/core/config/build-facts";
import { normalizePublicHref, YOUTUBE_CHANNEL_URL } from "@/app/core/config/shared";
import { OG_IMAGE } from "@/app/core/config/site";
import {
  CHANNEL_ID, jsonLd, KEYWORDS, OCCUPATION, PERSON_ID, PERSON_IMAGE, PERSON_NAME, PERSON_REF,
  SAME_AS, SITE_KEYWORDS, SITE_URL, WEBSITE_ID,
} from "@/app/core/config/seo";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
  /*
   * viewportFit: "cover" was tried and reverted.
   *
   * The idea was for it to work with appleWebApp.statusBarStyle =
   * "black-translucent" so the page extends under the notch. But that changes the dimensions of
   * the viewport on mobile, which is the part carrying real risk in exchange for
   * a gain that only shows in the installed PWA.
   *
   * If you want to bring it back later, bring it back on its own and test touch on a real phone before
   * adding anything else with it.
   */
  /* Deliberately NOT set: maximumScale / userScalable. Locking zoom breaks
     WCAG 1.4.4 and is the single most common accessibility failure on
     portfolio sites. Pinch-zoom stays available. */
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  /* Full URL to same-origin pages, only the origin to other sites (the
     default, stated explicitly so no browser falls back to leaking paths) */
  referrer: "strict-origin-when-cross-origin",
  metadataBase: new URL(SITE_URL),
  applicationName: "Ahmed Emad Nasr Portfolio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ahmed Portfolio",
    /*
     * This was "/Assets/…" — a root-relative path.
     *
     * Next adds the basePath automatically for openGraph and twitter images (it
     * resolves them against metadataBase), but **not** for startupImage. So the link
     * check found this to be the last URL on the whole site missing /Portfolio
     * in front of it — meaning the iOS splash-screen icon was a 404.
     *
     * A full absolute URL, exactly like the OG images in page.tsx.
     */
    startupImage: [`${SITE_URL}icons/icon-512.png`],
  },
  /*
   * The metadata had appleWebApp.capable = true without any icon —
   * so the site told iOS "I'm installable" and then provided no icon,
   * and the OS took a screenshot of the page and used it as the icon.
   *
   * All icons are declared explicitly. Once `icons` is set here, Next stops emitting the
   * <link rel="icon"> for app/favicon.ico by itself — which is how the site
   * ended up with no favicon at all: browsers fell back to the domain root
   * (ahmed-emad-nasr.github.io/favicon.ico), which is a 404.
   * normalizePublicHref adds /Portfolio in production, like every asset.
   * iOS ignores WebP for the home-screen icon, so apple-touch-icon is a PNG.
   */
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
    /* One definition (config/site.ts) instead of the same URL typed four times */
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
    /* Bing Webmaster Tools (also feeds DuckDuckGo, Yahoo and ChatGPT search):
       paste the code from bing.com/webmasters → "HTML Meta Tag" here.
       other: { "msvalidate.01": "YOUR-BING-CODE" }, */
  },
  /* Location and audience hints read by Bing, Yandex and local search. */
  other: {
    "geo.region": "EG-C",
    "geo.placename": "Cairo, Egypt",
    "geo.position": "30.0444;31.2357",
    ICBM: "30.0444, 31.2357",
  },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

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

/*
 * Site-wide graph: only the nodes that are true on every page — the person,
 * the channel and the website. The home page's ProfilePage, FAQ, videos and
 * timeline live in app/page.tsx; each case page adds its own TechArticle.
 * (These used to be here, so every case page also claimed to be the home
 * ProfilePage, and the CV page ended up with two ProfilePages.)
 */
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
      /* knowsAbout is the field Google uses to understand a person's domain. The skills
         were scattered as tags in the JSX and nobody exported them as data — now
         a single source in config/skills.ts feeds both the display and the JSON-LD. */
      knowsAbout: [...new Set([...KEYWORDS.grc, ...KEYWORDS.operations, ...KEYWORDS.response, ...KEYWORDS.identityData, ...skillGroups.flatMap((group) => group.items)])],
      knowsLanguage: [
        { "@type": "Language", name: "Arabic", alternateName: "ar" },
        { "@type": "Language", name: "English", alternateName: "en" },
      ],
      /* The certifications used to be 74 images, none of them understandable to any crawler. */
      hasCredential: certificationsJsonLd(PERSON_ID),
      /* The awards section was in the CV and not on the site in any form. */
      award: achievements.map((item) => `${item.title} — ${item.context}`),
      description: "Information security officer working across governance, risk and compliance, security operations, incident response and DFIR, malware analysis, identity and access management, and data security.",
      /* Where he works and studied, as organisations rather than strings — the
         current roles are the ones without an endDate. */
      worksFor: currentOrgs.map(orgNode),
      alumniOf: alumniOrgs.map(orgNode),
      nationality: { "@type": "Country", name: "Egypt" },
      homeLocation: { "@type": "Place", name: "Cairo, Egypt", address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" } },
      email: "mailto:ahmed.em.nasr@gmail.com",
      telephone: "+20 101 397 2690",
      address: { 
        "@type": "PostalAddress", 
        addressLocality: "Cairo/Benha", 
        addressCountry: "EG" 
      },
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
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <head>
        {/* Production only: the dev server needs eval and a websocket for HMR */}
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        )}
        {/* Before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              /* Large text: the reader has raised the browser's / phone's
                 default font size (16px unless they did). "medium" is that
                 default — unlike the root size, which globals.css itself
                 raises on 1800px+ screens. globals.css lets layouts wrap
                 instead of overflow in that mode only. */
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
            <AppLoader />
            <SpotlightHost />
            <PaletteMount />
            <KeyboardShortcuts />
            <SmoothScroll>
              <CursorMount />
              {children}
            </SmoothScroll>
            <Analytics />
            <ServiceWorkerRegister enabled={HAS_SERVICE_WORKER} />
          </ThemeFxProvider>
        </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
