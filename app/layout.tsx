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

import { delaGothic, jetbrainsMono, outfit, yujiSyuku } from "./fonts";
import "./globals.css";

import { knowledgeEducationItems } from "@/app/core/config/experience";
import { certificationsJsonLd } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups } from "@/app/core/config/skills";
import { ThemeProvider } from "@/app/core/components/ThemeProvider";
import { ThemeFxProvider } from "@/app/core/theme/ThemeFxProvider";
import { SpotlightHost } from "@/app/core/components/Motion";
import { CommandPalette } from "@/app/core/components/CommandPalette";
import { caseIndex } from "@/app/core/config/library-data";
import { SmoothScroll } from "@/app/core/components/SmoothScroll";
import CursorOverlay from "@/app/core/components/CursorOverlay";
import AppLoader from "@/app/core/components/AppLoader";
import MotionProvider from "@/app/core/components/MotionProvider";
import { REVEAL_SCRIPT } from "@/app/core/reveal";
import { CONTENT_SECURITY_POLICY } from "@/app/core/config/security";
import KeyboardShortcuts from "@/app/core/components/KeyboardShortcuts";
import ServiceWorkerRegister from "@/app/core/components/ServiceWorkerRegister";
import Analytics from "@/app/core/components/Analytics";
import { HAS_SERVICE_WORKER } from "@/app/core/config/build-facts";
import { normalizePublicHref } from "@/app/core/config/shared";

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
  metadataBase: new URL("https://ahmed-emad-nasr.github.io/Portfolio/"),
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
    startupImage: ["https://ahmed-emad-nasr.github.io/Portfolio/icons/icon-512.png"],
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
    default: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | SOC & Cybersecurity Analyst",
    template: "%s | Ahmed Emad Nasr",
  },
  description:
    "Ahmed Emad Nasr's cybersecurity portfolio specializing in SOC operations, incident response, digital forensics (DFIR), threat hunting, and malware analysis.",
  keywords: [
    "Ahmed Emad Nasr", "SOC Analyst", "Cybersecurity Analyst", "Information Security Analyst",
    "Incident Response", "Threat Hunting", "SIEM", "EDR", "DFIR",
    "Wazuh", "Suricata", "Malware Analysis", "eJPT v2", 
    "Cairo", "Benha", "Portfolio",
  ],
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
    title: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | SOC & Cybersecurity Analyst",
    description: "Incident response, threat hunting, DFIR, and cybersecurity training from Ahmed Emad Nasr.",
    type: "website",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/",
    locale: "en_US",
    siteName: "Ahmed Emad Nasr Portfolio",
    images: [{
      url: "https://ahmed-emad-nasr.github.io/Portfolio/og-image.png",
      width: 1200,
      height: 630,
      alt: "Ahmed Emad Nasr cybersecurity portfolio",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Emad Nasr 🇪🇬 🇵🇸 | SOC Analyst",
    description: "SOC analysis, incident response, threat hunting, SIEM/EDR implementation, and cybersecurity training.",
    creator: "@0x3omda",
    site: "@0x3omda",
    images: ["https://ahmed-emad-nasr.github.io/Portfolio/og-image.png"],
  },
  verification: {
    google: "VCIeVhcDb-vQGmE68weZARtruR_F2bUwv6hcjKYdwqo",
  },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

const STRUCTURED_DATA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person",
      name: "Ahmed Emad Nasr",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      image: "https://ahmed-emad-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/3omda.webp",
      jobTitle: ["SOC Analyst", "Incident Response Analyst", "Cybersecurity Analyst"],
      /* knowsAbout is the field Google uses to understand a person's domain. The skills
         were scattered as tags in the JSX and nobody exported them as data — now
         a single source in config/skills.ts feeds both the display and the JSON-LD. */
      knowsAbout: skillGroups.flatMap((group) => group.items),
      /* The certifications used to be 74 images, none of them understandable to any crawler. */
      hasCredential: certificationsJsonLd("https://ahmed-emad-nasr.github.io/Portfolio/#person"),
      /* The awards section was in the CV and not on the site in any form. */
      award: achievements.map((item) => `${item.title} — ${item.context}`),
      description: "SOC Analyst and Incident Response Analyst focused on DFIR, Threat Hunting, and Security Operations.",
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
      sameAs: [
        "https://www.linkedin.com/in/ahmed-emad-nasr/",
        "https://x.com/0x3omda",
        "https://github.com/Ahmed-Emad-Nasr",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#website",
      name: "Ahmed Emad Nasr Portfolio",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      inLanguage: "en",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#profilepage",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      mainEntity: { "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person" },
      isPartOf: { "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#website" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#breadcrumbs",
      itemListElement: [
        /* Removed the Contact item — the section no longer exists, and a breadcrumb pointing at
           a dead anchor breaks the rich result in search results. */
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ahmed-emad-nasr.github.io/Portfolio/" },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#homepage",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      name: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Professional",
      description: "A portfolio homepage highlighting cybersecurity work, SIEM/EDR projects, malware analysis, and professional experience.",
      isPartOf: { "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#website" },
      primaryImageOfPage: { "@type": "ImageObject", url: "https://ahmed-emad-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/3omda.webp" },
      about: { "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person" },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#experience-list",
      name: "Education and Experience Timeline",
      itemListElement: knowledgeEducationItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "EducationalOccupationalCredential",
          name: item.tag,
          description: item.desc,
          credentialCategory: item.subTag,
          validFrom: item.startDate,
          validUntil: "endDate" in item ? item.endDate : undefined,
        },
      })),
    },
  ],
});

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${outfit.variable} ${jetbrainsMono.variable} ${delaGothic.variable} ${yujiSyuku.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Production only: the dev server needs eval and a websocket for HMR */}
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        )}
        {/* Before first paint: skip the intro screen if it already played in this tab */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("sensei-booted"))document.documentElement.classList.add("booted")}catch(e){}',
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        {/* Scroll entrances (core/reveal.ts) — first in <body> so it sees every
            element as the parser inserts it, before any of them is painted */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
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
            <CommandPalette cases={caseIndex} />
            <KeyboardShortcuts />
            <SmoothScroll>
              <CursorOverlay />
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
