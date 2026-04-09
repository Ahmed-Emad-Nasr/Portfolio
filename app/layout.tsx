/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Define root app shell, metadata, and global font/base document setup
 */

import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Overlock, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import ToastHost from "@/app/core/components/ToastHost";
import { faqItems, knowledgeEducationItems } from "@/app/core/data";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://ahmed-emad-nasr.github.io/Portfolio/"),
  applicationName: "Ahmed Emad Nasr Portfolio",
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
    "Ahmed Emad Nasr's cybersecurity portfolio for incident response, threat hunting, digital forensics, security training, projects, and contact.",
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
      "Incident response, threat hunting, digital forensics, and cybersecurity training from Ahmed Emad Nasr.",
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
      "SOC analysis, incident response, threat hunting, SIEM/EDR implementation, and cybersecurity training.",
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

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Derived once — the class string never changes between renders.
const BODY_CLASS = `bg-black text-white ${overlock.variable} ${spaceGrotesk.variable}`;
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
        "A portfolio homepage highlighting cybersecurity work, professional experience, projects, and contact options.",
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
      "@type": "FAQPage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#faq",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
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
          validUntil: item.endDate,
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
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {TURNSTILE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
          />
        ) : null}
        <Script id="visual-mode-init" strategy="beforeInteractive">
          {`(function(){
  try {
    var mode = localStorage.getItem("portfolio_blog_visual_mode_v1");
    if (mode === "dashboard" || mode === "magazine") {
      document.documentElement.setAttribute("data-portfolio-mode", mode);
    } else {
      document.documentElement.setAttribute("data-portfolio-mode", "dashboard");
    }
  } catch (error) {
    document.documentElement.setAttribute("data-portfolio-mode", "dashboard");
  }
})();`}
        </Script>
        <Script id="chunk-error-handler" strategy="beforeInteractive">
          {`(function(){
  if (typeof window === "undefined") return;
  
  window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
  
  // Prevent appendChild errors from malformed chunks
  var originalAppend = Element.prototype.appendChild;
  Element.prototype.appendChild = function(node) {
    try {
      if (node && typeof node === "object" && node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent || "";
        if (text.trim().startsWith("<")) {
          console.warn("Blocked invalid chunk content from being appended");
          return node;
        }
      }
      return originalAppend.call(this, node);
    } catch (error) {
      console.error("appendChild error:", error);
      return node;
    }
  };
})();`}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`(function(){
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  var path = window.location.pathname;
  var scopePrefix = path === "/Portfolio" || path.startsWith("/Portfolio/") ? "/Portfolio" : "";
  var swUrl = scopePrefix + "/sw.js";

  navigator.serviceWorker.register(swUrl).catch(function(error){
    console.warn("Service worker registration failed:", error);
  });
})();`}
        </Script>
        <ToastHost />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <footer className="site-footer" aria-label="Site footer">
          <div className="site-footer__inner">
            <span>Ahmed Emad Nasr Portfolio</span>
            <span>SOC • IR • DFIR</span>
            <a href="#main-content">Back to top</a>
          </div>
        </footer>
      </body>
    </html>
  );
}