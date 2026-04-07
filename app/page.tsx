/*
 * File: page.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Server entry page that renders the client page wrapper
 */

import type { Metadata } from "next";
import MainClient from "./page-client";

export const metadata: Metadata = {
  title: "SOC Analyst Portfolio | Incident Response, Threat Hunting, DFIR",
  description:
    "Ahmed Emad Nasr portfolio showcasing SOC operations, incident response, malware analysis, threat hunting, certifications, and real security case reports.",
  keywords: [
    "SOC portfolio",
    "incident response portfolio",
    "threat hunting projects",
    "malware analysis reports",
    "DFIR analyst",
    "cybersecurity certifications",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ahmed Emad Nasr | SOC & Incident Response Portfolio",
    description:
      "Real SOC/IR case reports, security projects, and cybersecurity training impact by Ahmed Emad Nasr.",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/",
    type: "website",
    images: [
      {
        url: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        width: 1200,
        height: 630,
        alt: "Ahmed Emad Nasr SOC portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Emad Nasr | SOC & IR Portfolio",
    description:
      "Explore SOC investigations, DFIR workflows, malware analysis cases, and cybersecurity certifications.",
    images: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
};

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#main-profile-page",
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
      name: "Ahmed Emad Nasr SOC Analyst Portfolio",
      inLanguage: "en",
    },
    {
      "@type": "Service",
      "@id": "https://ahmed-emad-nasr.github.io/Portfolio/#service-soc-ir",
      name: "SOC Monitoring and Incident Response Support",
      provider: {
        "@type": "Person",
        name: "Ahmed Emad Nasr",
      },
      areaServed: "Worldwide",
      serviceType: ["SOC Monitoring", "Incident Response", "Threat Hunting", "Security Training"],
      url: "https://ahmed-emad-nasr.github.io/Portfolio/#Contact",
    },
  ],
};

export default function Main() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <MainClient />
    </>
  );
}