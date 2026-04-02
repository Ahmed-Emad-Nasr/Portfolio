/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Define root app shell, metadata, and global font/base document setup
 */

import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Overlock } from "next/font/google";
import Script from "next/script";
import AnalyticsTracker from "@/app/core/components/AnalyticsTracker";
import WebVitalsTracker from "@/app/core/components/WebVitalsTracker";
import ToastHost from "@/app/core/components/ToastHost";
import { serviceCatalog } from "@/app/core/data";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmed-emad-nasr.github.io/Portfolio/"),
  applicationName: "Ahmed Emad Nasr Portfolio",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ahmed Portfolio",
    startupImage: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
  title: {
    default: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Engineer",
    template: "%s | Ahmed Emad Nasr",
  },
  description:
    "Ahmed Emad Nasr's cybersecurity portfolio for SOC analysis, incident response, threat hunting, SIEM/EDR implementation, digital forensics, and security training.",
  keywords: [
    "Ahmed Emad Nasr",
    "SOC Analyst",
    "Cybersecurity Engineer",
    "Incident Response",
    "Threat Hunting",
    "SIEM",
    "EDR",
    "DFIR",
    "Security Training",
    "Digital Forensics",
    "Cairo",
    "Portfolio",
  ],
  authors: [{ name: "Ahmed Emad Nasr" }],
  creator: "Ahmed Emad Nasr",
  publisher: "Ahmed Emad Nasr",
  alternates: {
    canonical: "/",
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
    title: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Engineer",
    description:
      "SOC analysis, incident response, threat hunting, SIEM/EDR implementation, digital forensics, and cybersecurity training from Ahmed Emad Nasr.",
    type: "website",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/",
    locale: "en_US",
    siteName: "Ahmed Emad Nasr Portfolio",
    images: [
      {
        url: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        width: 1200,
        height: 630,
        alt: "Ahmed Emad Nasr cybersecurity portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Engineer",
    description:
      "SOC analysis, incident response, threat hunting, SIEM/EDR implementation, and cybersecurity training services.",
    creator: "@0x3omda",
    site: "@0x3omda",
    images: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
  verification: {
    google: "VCIeVhcDb-vQGmE68weZARtruR_F2bUwv6hcjKYdwqo",
  },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

// Font objects are created once at module load by next/font/google —
// calling these outside the component is the correct and required pattern.
const overlock = Overlock({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-overlock",
  display: "swap",
});

// Derived once — the class string never changes between renders.
const BODY_CLASS = `bg-black text-white ${overlock.variable}`;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person",
      name: "Ahmed Emad Nasr",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      image: "https://ahmed-emad-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/My_Logo.webp",
      jobTitle: "SOC Analyst",
      description: "SOC Analyst and Incident Response Analyst focused on DFIR, Threat Hunting, and Security Operations.",
      email: "mailto:ahmed.em.nasr@gmail.com",
      telephone: "+20 101 816 6445",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "ahmed.em.nasr@gmail.com",
        availableLanguage: ["en", "ar"],
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
      mainEntity: {
        "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person",
      },
      isPartOf: {
        "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#website",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#breadcrumbs",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://ahmed-emad-nasr.github.io/Portfolio/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: "https://ahmed-emad-nasr.github.io/Portfolio/#Contact",
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#homepage",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      name: "Ahmed Emad Nasr | SOC Analyst & Cybersecurity Engineer",
      description:
        "A portfolio homepage highlighting cybersecurity services, professional experience, certifications, projects, and contact options.",
      isPartOf: {
        "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#website",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://ahmed-emad-nasr.github.io/Portfolio/Assets/art-gallery/Images/logo/My_Logo.webp",
      },
      about: {
        "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person",
      },
      inLanguage: "en",
    },
    {
      "@type": "CollectionPage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#services",
      name: "Services",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/#Services",
      about: {
        "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#person",
      },
      hasPart: serviceCatalog.map((service) => ({
        "@type": "Service",
        name: service.title,
        description: service.description,
        serviceType: service.title,
        offers: {
          "@type": "Offer",
          price: service.from.replace("$", ""),
          priceCurrency: "USD",
        },
      })),
    },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head />
      <body className={BODY_CLASS}>
        <a className="skip-link" href="#Home">
          Skip to main content
        </a>
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        {CLARITY_ID ? (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        ) : null}
        {TURNSTILE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
          />
        ) : null}
        <AnalyticsTracker />
        <WebVitalsTracker />
        <ToastHost />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}