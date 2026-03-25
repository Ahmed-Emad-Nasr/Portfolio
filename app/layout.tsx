/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Define root app shell, metadata, and global font/base document setup
 */

import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Overlock } from "next/font/google";
import Script from "next/script";
import FloatingCTA from "@/app/components/floating_cta/floating-cta";
import AnalyticsTracker from "@/app/core/components/AnalyticsTracker";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmed-emad-nasr.github.io/Portfolio/"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ahmed Portfolio",
    startupImage: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
  title: "Ahmed Emad Nasr - Portfolio",
  description:
    "Hello! I'm Ahmed Emad, Soc Analyst and Cybersecurity Engineer. I specialize in protecting digital assets and ensuring online safety. With a passion for cybersecurity, I analyze threats, implement security measures, and stay ahead of cybercriminals to safeguard data and systems.",
  keywords:
    "Ahmed Emad Nasr, Soc Analyst, Cybersecurity Engineer, Incident Response Analyst, Blue Team, Cybersecurity Instructor, Software Engineer, Portfolio",
  authors: [{ name: "Ahmed Emad Nasr" }],
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
    title: "Ahmed Emad Nasr - Portfolio",
    description:
      "SOC Analyst and Cybersecurity Engineer portfolio focused on Incident Response, Threat Hunting, DFIR, and security operations.",
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
    title: "Ahmed Emad Nasr - Portfolio",
    description:
      "SOC Analyst and Cybersecurity Engineer portfolio focused on Incident Response, Threat Hunting, DFIR, and security operations.",
    creator: "@0x3omda",
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
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to FontAwesome CDN for early network connection */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </head>
      <body className={BODY_CLASS}>
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
            <AnalyticsTracker />
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <FloatingCTA />
      </body>
    </html>
  );
}