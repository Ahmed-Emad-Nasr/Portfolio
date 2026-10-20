/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 * PERF IMPROVEMENTS:
 * 1. Removed fonts.gstatic.com preconnect (next/font is self-hosted).
 * 2. Moved theme-color to Viewport export for Next.js static optimization.
 * 3. Kept Structured Data stringified at module scope (Zero CPU overhead).
 */

import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Overlock, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { certifications, certificationsJsonLd } from "@/app/core/config/certifications";
import { achievements } from "@/app/core/config/achievements";
import { skillGroups } from "@/app/core/config/skills";
import { SmoothScroll } from "./components/smooth-scroll";
// FIXED: `dynamic(..., { ssr: false })` cannot live in a Server Component, and
// this file is one (it exports `metadata`). The call moved into CursorMount,
// which is a Client Component. Same deferred-chunk benefit, legal placement.
import CursorMount from "./components/cursor-mount";
import CyberBackground from "./core/components/CyberBackground";
import SiteFooter from "./core/components/SiteFooter";
// Reading-progress bar — mounted here once so it works on the portfolio
// and the blog alike, without repeating it in every page-client.
import ScrollProgress from "./core/components/ScrollProgress";
import BackToTop from "./core/components/BackToTop";
// The palette itself is lazy-loaded inside this component — none of its code is in the
// main bundle until the first Ctrl+K.
import CommandPaletteMount from "./core/components/CommandPaletteMount";
// Registers public/sw.js after load, production only. The site already declares
// itself installable in manifest.ts — without this, installing would be cosmetic with no real caching.
import ServiceWorkerRegister from "./core/components/ServiceWorkerRegister";
// Disabled until NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set — see the comment inside
// Analytics.tsx. Without that variable the component returns null.
import Analytics from "./core/components/Analytics";
// A tiny script that runs in <head> before first paint and writes data-tier on <html>.
// Without it the CSS gating (html[data-tier="low"]) only kicked in after
// hydration — so all the heavy animation paid its full cost exactly in
// the window where LCP and TBT are measured.
import { DEVICE_TIER_SCRIPT } from "./core/hooks/useDeviceTier";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
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
  metadataBase: new URL("https://ae-nasr.github.io/Portfolio/"),
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
    startupImage: ["https://ae-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/3omda.webp"],
  },
  /*
   * The metadata had appleWebApp.capable = true without any icon —
   * so the site told iOS "I'm installable" and then provided no icon,
   * and the OS took a screenshot of the page and used it as the icon.
   *
   * favicon.ico in app/ is picked up automatically. The rest has to be declared.
   */
icons: {
  icon: "favicon.ico",
  shortcut: "favicon.ico",
  apple: "Assets/art-gallery/Images/logo/3omda.webp",
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
    url: "https://ae-nasr.github.io/Portfolio/",
    locale: "en_US",
    siteName: "Ahmed Emad Nasr Portfolio",
    images: [{
      url: "/Assets/art-gallery/Images/logo/3omda.webp",
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
    images: ["/Assets/art-gallery/Images/logo/3omda.webp"],
  },
  verification: {
    google: "VCIeVhcDb-vQGmE68weZARtruR_F2bUwv6hcjKYdwqo",
  },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

const overlock = Overlock({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-overlock",
  display: "swap",
});

/*
 * JetBrains Mono — it was missing entirely.
 *
 * globals.css has `--font-mono: "JetBrains Mono", monospace` and nothing
 * loaded that font. Going through the CSS: **70 declarations** request it — the hero
 * HUD, the tactic headings, the project badges, the terminal, the command
 * palette, and every date and number.
 *
 * Every one of them fell back to the system monospace: Courier New on
 * Windows, Menlo on macOS, Roboto Mono on Android. So the part the whole visual
 * identity rests on was rendered in three different fonts depending on the visitor's device —
 * and on Windows, which is most visitors, in Courier New.
 *
 * Only two weights (400 for text, 700 for labels) to avoid adding load.
 */
const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  /*
   * next/font adds a <link rel="preload"> for every font file by default. With
   * Overlock at three weights + JetBrains at two, that's five high-priority requests
   * competing with the LCP image for the same limited connection window.
   *
   * JetBrains Mono isn't used in any above-the-fold text that matters for the metric — it's for the HUD,
   * the labels and the terminal. display: swap lets it swap in when it arrives.
   */
  preload: false,
});

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// ─── Structured Data ──────────────────────────────────────────────────────────

const STRUCTURED_DATA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://ae-nasr.github.io/Portfolio/#person",
      name: "Ahmed Emad Nasr",
      url: "https://ae-nasr.github.io/Portfolio/",
      image: "https://ae-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/3omda.webp",
      jobTitle: ["SOC Analyst", "Incident Response Analyst", "Cybersecurity Analyst"],
      /* knowsAbout is the field Google uses to understand a person's domain. The skills
         were scattered as tags in the JSX and nobody exported them as data — now
         a single source in config/skills.ts feeds both the display and the JSON-LD. */
      knowsAbout: skillGroups.flatMap((group) => group.items),
      /* The certifications used to be 74 images, none of them understandable to any crawler. */
      hasCredential: certificationsJsonLd("https://ae-nasr.github.io/Portfolio/#person"),
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
        "https://github.com/AE-Nasr",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://ae-nasr.github.io/Portfolio/#website",
      name: "Ahmed Emad Nasr Portfolio",
      url: "https://ae-nasr.github.io/Portfolio/",
      inLanguage: "en",
    },
    {
      "@type": "ProfilePage",
      "@id": "https://ae-nasr.github.io/Portfolio/#profilepage",
      url: "https://ae-nasr.github.io/Portfolio/",
      mainEntity: { "@id": "https://ae-nasr.github.io/Portfolio/#person" },
      isPartOf: { "@id": "https://ae-nasr.github.io/Portfolio/#website" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ae-nasr.github.io/Portfolio/#breadcrumbs",
      itemListElement: [
        /* Removed the Contact item — the section no longer exists, and a breadcrumb pointing at
           a dead anchor breaks the rich result in search results. */
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ae-nasr.github.io/Portfolio/" },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://ae-nasr.github.io/Portfolio/#homepage",
      url: "https://ae-nasr.github.io/Portfolio/",
      name: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Professional",
      description: "A portfolio homepage highlighting cybersecurity work, SIEM/EDR projects, malware analysis, and professional experience.",
      isPartOf: { "@id": "https://ae-nasr.github.io/Portfolio/#website" },
      primaryImageOfPage: { "@type": "ImageObject", url: "https://ae-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/3omda.webp" },
      about: { "@id": "https://ae-nasr.github.io/Portfolio/#person" },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": "https://ae-nasr.github.io/Portfolio/#experience-list",
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
    /* suppressHydrationWarning: the script below adds data-tier on <html> before
       React hydrates. Without this React complains about an attribute that isn't
       in the markup that came from the server. Same pattern as next-themes. */
    <html
      lang="en"
      dir="ltr"
      className={`${overlock.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs immediately — before the CSS is painted and before any bundle. It classifies
          the device and writes data-tier="low|mid|high" on <html>.

          globals.css already has a full motion budget hanging off
          html[data-tier="low"]. The problem was that the thing writing that attribute
          was a useEffect — so it only ran after the bundle loaded
          and hydrated. Result: the phone paid the cost of full motion in
          exactly the first 2–3 seconds, and then turned it off.
        */}
        <script dangerouslySetInnerHTML={{ __html: DEVICE_TIER_SCRIPT }} />
      </head>
      {/*
        The manual <head> was removed entirely. It had two lines:

        1. <link rel="preload" as="image" href=".../My_Logo.webp">
           preloaded the wrong file — the LCP image is 3omda.webp in
           sensei-home.tsx, not the logo. So it reserved a connection for an image not on
           the critical path and delayed the one that was. The right image is now `priority`,
           and Next generates the correct preload with the correct path.

        2. <link rel="icon" href="/Assets/art-gallery/Images/logo/3omda.webp">
           a hand-written path **without basePath**. The link check confirmed
           it: this URL was the only one on the whole site missing
           /Portfolio in front of it — so a 404 on every page load, on every page.
           And `app/favicon.ico` exists and Next injects it automatically with the correct path,
           so this line was a second, conflicting and broken definition at the same time.
      */}
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>

        {/* The animated background. Server Component — zero JavaScript for the browser,
            and all motion is transform/opacity on the GPU. First element in the
            body so it stays behind everything. */}
        <CyberBackground />

        <ScrollProgress />
        
        {TURNSTILE_SITE_KEY && (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
          />
        )}

        <Analytics />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }}
        />
        
        {/*
          <MotionProvider> used to wrap this entire tree.
          It is gone from here on purpose.

          MotionProvider is <LazyMotion> — framer-motion's feature loader.
          It has to sit above any `m.*` element. When it wrapped everything,
          the motion engine was pulled onto the critical path of every page
          load, on every device.

          Its consumers were only ever two:

            · custom-cursor.tsx — desktop only, already behind a dynamic
              import and a pointer:fine check
            · sensei_loader.tsx — one fade-and-slide exit

          The loader now does that exit with a CSS transition (see
          .loader[data-state="out"]), which leaves the cursor as the single
          consumer. So the provider moved INSIDE CursorMount, on the far
          side of both the touch check and the dynamic import.

          Net effect: phones never download framer-motion at all.
        */}
        <SmoothScroll>
          {children}
          {/* Footer for every page — without it the privacy and terms pages wouldn't
              have any link on the site and nobody would reach them by browsing. */}
          <SiteFooter />
        </SmoothScroll>
        <CursorMount />
        <BackToTop />
        <CommandPaletteMount />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}