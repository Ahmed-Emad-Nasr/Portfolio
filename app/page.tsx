/*
 * app/page.tsx — the home page
 *
 * Section order and components follow the Sensei-Dev portfolio
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0); the content comes from
 * core/config/portfolio-data.ts.
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/app/components/home/HeroSection";
import StatsBar from "@/app/components/home/StatsBar";
import SiteNav from "@/app/components/header/SiteNav";
import SectionDivider from "@/app/core/components/SectionDivider";
import ServicesSection from "@/app/components/services/ServicesSection";
import TechStackGrid from "@/app/components/services/TechStackGrid";
import UsesSection from "@/app/components/services/UsesSection";
import WorkShowcase from "@/app/components/services/WorkShowcase";
import ProcessSection from "@/app/components/services/ProcessSection";
import FaqSection from "@/app/components/services/FaqSection";
import ContributionsGrid from "@/app/components/services/ContributionsGrid";
import { getGitHubRepos } from "@/app/core/api/github";
import StartHere from "@/app/components/cases/StartHere";
import AttackCoverage from "@/app/components/cases/AttackCoverage";
import {
  attackCoverage,
  categoryFacets,
  libraryCounts,
  libraryStructuredData,
  mediaById,
  sortedCases,
  toolFacets,
} from "@/app/core/config/library-data";

const ExperienceTimeline = dynamic(
  () => import("@/app/components/experience/ExperienceTimeline")
);
const MilestonesSection = dynamic(
  () => import("@/app/components/experience/MilestonesSection")
);
const NowSection = dynamic(
  () => import("@/app/components/experience/NowSection")
);
const ProjectsGrid = dynamic(
  () => import("@/app/components/services/ProjectsGrid")
);
const CredentialsGallery = dynamic(
  () => import("@/app/components/experience/CredentialsGallery")
);
const ArtGallery = dynamic(
  () => import("@/app/components/art-gallery/ArtGallery")
);
const CaseLibrarySection = dynamic(
  () => import("@/app/components/cases/CaseLibrarySection")
);
const ContactFooter = dynamic(
  () => import("@/app/components/header/ContactFooter")
);

export const metadata: Metadata = {
  title: "Ahmed Emad Nasr | SOC & Cybersecurity Analyst | DFIR & Malware Analysis",
  description:
    "Ahmed Emad Nasr's portfolio showcasing SOC operations, incident response, malware analysis, threat hunting, and real security case reports using Wazuh, Suricata, and ELK.",
  keywords: [
    "SOC portfolio",
    "incident response portfolio",
    "threat hunting projects",
    "malware analysis reports",
    "DFIR analyst",
    "Wazuh detection rules",
    "eJPT certified"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ahmed Emad Nasr | SOC & Cybersecurity Analyst",
    description:
      "Real SOC/IR case reports, security projects, malware analysis, and cybersecurity training impact by Ahmed Emad Nasr.",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/",
    type: "website",
    /* A page-level openGraph replaces the layout's whole object, so the two
       fields below would otherwise be lost on the home page. */
    siteName: "Ahmed Emad Nasr Portfolio",
    locale: "en_US",
    images: [
      {
        url: "https://ahmed-emad-nasr.github.io/Portfolio/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ahmed Emad Nasr SOC portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@0x3omda",
    creator: "@0x3omda",
    title: "Ahmed Emad Nasr | SOC & Incident Response Analyst",
    description:
      "Explore SOC investigations, DFIR workflows, malware analysis cases, and detection engineering.",
    images: ["https://ahmed-emad-nasr.github.io/Portfolio/og-image.png"],
  },
};

// Serialise the data once, in memory, to save the work on every render
const STRUCTURED_DATA_JSON = JSON.stringify({
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
      serviceType: ["SOC Monitoring", "Incident Response", "Threat Hunting", "Security Training", "Digital Forensics"],
      /* This was #Contact — the section was removed, and the anchor became dead. */
      url: "https://ahmed-emad-nasr.github.io/Portfolio/",
    },
  ],
});

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default async function Home() {
  const repos = await getGitHubRepos();
  const projectCount = repos.length;
  const starCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(libraryStructuredData) }} />
      {/* ─── Full-page scanlines overlay ─── */}
      <div
        className="fixed inset-0 pointer-events-none z-[50] opacity-[0.015] scanlines"
        aria-hidden="true"
      />

      {/* ─── Subtle grid background ─── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02] neural-grid"
        aria-hidden="true"
      />

      <SiteNav />

      {/* 01  Who: face, name, stack in 5 seconds */}
      <div>
        <HeroSection projectCount={projectCount} starCount={starCount} />
      </div>

      {/* 02  Trust: numbers before claims */}
      <StatsBar />

      {/* 03  Offer: what you can hire me for */}
      <div>
        <ServicesSection />
      </div>

      <SectionDivider text="検知 • 分析 • 対応 • 復旧 • 報告" reverse={true} angle={-1.5} />

      {/* 04  Proof A: labs, research and tools */}
      <div>
        <WorkShowcase />
      </div>

      {/* 05  Proof B: open-source depth */}
      <div>
        <ProjectsGrid repos={repos} />
      </div>

      {/* 05b  Proof C: community contributions */}
      <ContributionsGrid />

      <SectionDivider text="継続は力なり • 改善 • 実務 • 計測" angle={-1.5} />

      {/* 06  Toolbox: the tools behind the proof above */}
      <TechStackGrid />

      {/* 06b  Daily drivers */}
      <UsesSection />

      {/* 07  Authority: where this happened */}
      <div id="experience">
        <ExperienceTimeline />
      </div>

      {/* Everything below the experience timeline uses no scroll-measured
          (GSAP) animation, so the browser may skip its style, layout and
          paint until it nears the viewport (content-visibility: auto) —
          most of the page's first-load rendering work on phones. */}

      {/* 07b  Path recap + present snapshot */}
      <div className={DEFER}>
        <MilestonesSection />
      </div>
      <div className={DEFER}>
        <NowSection />
      </div>

      {/* 08  Risk removal: how we will work together */}
      <div className={DEFER}>
        <ProcessSection />
      </div>

      {/* 08b  Pre-call answers */}
      <div className={DEFER}>
        <FaqSection />
      </div>

      <SectionDivider text="認定 • 実績 • 知識 • 技能" angle={-1.5} />

      {/* 09  Credentials */}
      <div className={DEFER}>
        <CredentialsGallery />
      </div>

      <SectionDivider text="記録 • 証明 • 実績" reverse={true} angle={-1.5} />

      {/* 10  The proof gallery: certificates and moments */}
      <div className={DEFER}>
        <ArtGallery />
      </div>

      <SectionDivider text="戦術 • 技術 • 網羅 • 証拠" angle={-1.5} />

      {/* 10a  The library on MITRE ATT&CK: which tactics the reports cover */}
      <div className={DEFER}>
        <AttackCoverage {...attackCoverage} />
      </div>

      <SectionDivider text="事件 • 調査 • 報告 • 証拠" reverse={true} angle={-1.5} />

      {/* 10b  The case library and the videos — what used to be the blog */}
      <div className={DEFER}>
      <CaseLibrarySection
        startHere={<StartHere />}
        sortedPdfs={sortedCases}
        mediaById={mediaById}
        categoryFacets={categoryFacets}
        toolFacets={toolFacets}
        totalCasesCount={libraryCounts.total}
        investigationReportCount={libraryCounts.reports}
        casesWithScreenshotsCount={libraryCounts.withScreenshots}
        totalScreenshotAssets={libraryCounts.screenshots}
      />
      </div>

      {/* 11  Action: single CTA */}
      <div id="contact" className={`mt-20 ${DEFER}`}>
        <ContactFooter />
      </div>
    </main>
  );
}
