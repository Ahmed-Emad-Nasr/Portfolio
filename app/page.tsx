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
import RolesFit from "@/app/components/services/RolesFit";
import HomeLab from "@/app/components/services/HomeLab";
import TestimonialsSection from "@/app/components/experience/TestimonialsSection";
import { getGitHubRepos } from "@/app/core/api/github";
import StartHere from "@/app/components/cases/StartHere";
import AttackCoverage from "@/app/components/cases/AttackCoverage";
import TeachingSection from "@/app/components/experience/TeachingSection";
import PlatformsSection from "@/app/components/experience/PlatformsSection";
import { getTryHackMeStats } from "@/app/core/api/tryhackme";
import { STATIC_PLATFORMS, tryHackMePlatform } from "@/app/core/config/platforms";
import { LIVE_COPY } from "@/app/core/config/live-copy";
import { blogYoutubePlaylists, blogYoutubeVideos } from "@/app/core/config/youtube";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { OG_IMAGE } from "@/app/core/config/site";
import {
  CHANNEL_ID, KEYWORDS, PERSON_IMAGE, PERSON_REF, SITE_URL, WEBSITE_ID,
  jsonLd, youtubeEmbed, youtubeThumb, youtubeWatch,
} from "@/app/core/config/seo";
import {
  attackCoverage,
  categoryFacets,
  kindFacets,
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
const MobileActionBar = dynamic(() => import("@/app/components/home/MobileActionBar"));
const PaletteHint = dynamic(() => import("@/app/components/home/PaletteHint"));
const DetectionLibrary = dynamic(() => import("@/app/components/cases/DetectionLibrary"));
const TriageChallenge = dynamic(() => import("@/app/components/cases/TriageChallenge"));
const ContactFooter = dynamic(
  () => import("@/app/components/header/ContactFooter")
);

export const metadata: Metadata = {
  title: "Ahmed Emad Nasr | Information Security Officer | GRC, SOC, DFIR & IAM",
  /* ≤160 characters: search results cut anything longer mid-sentence */
  description:
    "Information security officer: GRC & compliance, SOC, incident response & DFIR, malware analysis, IAM and data security — with real reports behind each.",
  keywords: [
    ...KEYWORDS.identity,
    "information security officer portfolio",
    "cybersecurity portfolio",
    "GRC analyst portfolio",
    "ISO 27001 PCI DSS gap assessment",
    "IAM and data security",
    "SOC analyst portfolio",
    "incident response reports",
    "DFIR case studies",
    "threat hunting projects",
    "malware analysis reports",
    "MITRE ATT&CK coverage",
    "Wazuh SIEM tutorials",
    "cybersecurity videos in Arabic",
    "شرح أمن المعلومات بالعربي",
    "eJPT certified",
    ...KEYWORDS.place,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ahmed Emad Nasr | Information Security Officer",
    description:
      "GRC, SOC, incident response & DFIR, IAM and data security: case reports, projects and training by Ahmed Emad Nasr.",
    url: SITE_URL,
    type: "website",
    /* A page-level openGraph replaces the layout's whole object, so the two
       fields below would otherwise be lost on the home page. */
    siteName: "Ahmed Emad Nasr Portfolio",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: "@0x3omda",
    creator: "@0x3omda",
    title: "Ahmed Emad Nasr | Information Security Officer",
    description:
      "GRC assessments, SOC investigations, DFIR and malware analysis, IAM and data security — the work and the reports.",
    images: [OG_IMAGE.url],
  },
};

// Serialise the data once, in memory, to save the work on every render
const STRUCTURED_DATA_JSON = jsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      /* The one ProfilePage — Person.mainEntityOfPage in layout.tsx points here */
      "@type": "ProfilePage",
      "@id": `${SITE_URL}#profilepage`,
      url: SITE_URL,
      name: "Ahmed Emad Nasr | Information Security Officer",
      description: "The portfolio of Ahmed Emad Nasr, information security officer: GRC, security operations, incident response, forensics, malware analysis, IAM and data security, with case reports, projects, videos and certifications.",
      inLanguage: "en",
      mainEntity: PERSON_REF,
      about: PERSON_REF,
      author: PERSON_REF,
      isPartOf: { "@id": WEBSITE_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: PERSON_IMAGE },
      image: [PERSON_IMAGE, OG_IMAGE.url],
      hasPart: [
        { "@id": `${SITE_URL}#faq` },
        { "@id": `${SITE_URL}#videos` },
        { "@id": `${SITE_URL}#cases` },
        { "@id": `${SITE_URL}#experience-list` },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}#experience-list`,
      name: "Experience, education and training",
      itemListElement: knowledgeEducationItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        /* Jobs as roles at an organisation, education as credentials */
        item:
          item.kind === "education"
            ? {
                "@type": "EducationalOccupationalCredential",
                name: item.tag,
                description: item.desc,
                credentialCategory: /bachelor|degree/i.test(item.tag) ? "degree" : "certificate",
                recognizedBy: { "@type": "EducationalOrganization", name: item.subTag, url: item.subTagHyperlink },
                validFrom: item.startDate,
                ...("endDate" in item && item.endDate ? { validUntil: item.endDate } : {}),
              }
            : {
                "@type": "OrganizationRole",
                roleName: item.tag,
                description: item.desc,
                startDate: item.startDate,
                ...("endDate" in item && item.endDate ? { endDate: item.endDate } : {}),
                memberOf: { "@type": "Organization", name: item.subTag, url: item.subTagHyperlink },
              },
      })),
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}#service-infosec`,
      name: "Information Security: GRC, Security Operations and Incident Response",
      description: "Governance, risk and compliance assessments, SOC monitoring and triage, incident response and digital forensics, malware analysis, identity and access management, data security, and security training.",
      provider: PERSON_REF,
      areaServed: [{ "@type": "Country", name: "Egypt" }, "Worldwide"],
      availableLanguage: ["en", "ar"],
      serviceType: ["Governance, Risk & Compliance", "SOC Monitoring", "Incident Response", "Digital Forensics", "Malware Analysis", "Identity & Access Management", "Data Security", "Security Training"],
      /* This was #Contact — the section was removed, and the anchor became dead. */
      url: SITE_URL,
    },
    {
      /* The FAQ section, as the FAQPage it already is on screen. The text is
         the same text the reader sees — structured data that differs from
         the page is a manual-action risk. */
      "@type": "FAQPage",
      "@id": `${SITE_URL}#faq`,
      url: `${SITE_URL}#faq`,
      inLanguage: "en",
      author: PERSON_REF,
      mainEntity: LIVE_COPY.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      /* Every video on the page with the fields Google needs for a video
         result (name, description, thumbnail, upload date, embed URL). */
      "@type": "ItemList",
      "@id": `${SITE_URL}#videos`,
      name: "Cybersecurity video tutorials by Ahmed Emad Nasr (Arabic)",
      numberOfItems: blogYoutubeVideos.length,
      itemListElement: blogYoutubeVideos.map((video, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "VideoObject",
          "@id": `${youtubeWatch(video.videoId)}#video`,
          name: video.title,
          description: video.description ?? video.title,
          thumbnailUrl: [youtubeThumb(video.videoId)],
          uploadDate: video.publishedAt,
          embedUrl: youtubeEmbed(video.videoId),
          url: youtubeWatch(video.videoId),
          inLanguage: "ar",
          keywords: (video.tags ?? []).join(", "),
          creator: PERSON_REF,
          author: PERSON_REF,
          publisher: { "@id": CHANNEL_ID },
          isFamilyFriendly: true,
        },
      })),
    },
    ...blogYoutubePlaylists.map((playlist) => ({
      "@type": "CreativeWorkSeries",
      "@id": `${playlist.sourceUrl.split("&")[0]}#series`,
      name: playlist.title,
      description: playlist.description,
      url: playlist.sourceUrl.split("&")[0],
      ...(playlist.thumbnailVideoId ? { image: youtubeThumb(playlist.thumbnailVideoId) } : {}),
      keywords: (playlist.tags ?? []).join(", "),
      inLanguage: "ar",
      author: PERSON_REF,
      publisher: { "@id": CHANNEL_ID },
    })),
  ],
});

const LIBRARY_JSON = jsonLd(libraryStructuredData);

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default async function Home() {
  const [repos, thm] = await Promise.all([getGitHubRepos(), getTryHackMeStats()]);
  const projectCount = repos.length;
  const starCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LIBRARY_JSON }} />
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
      <MobileActionBar />
      <PaletteHint />

      {/* 01  Who: face, name, stack in 5 seconds */}
      <div>
        <HeroSection projectCount={projectCount} starCount={starCount} description={LIVE_COPY.heroDescription} evidenceLabel={LIVE_COPY.heroEvidence} />
      </div>

      {/* 02  Trust: numbers before claims */}
      <StatsBar stats={LIVE_COPY.stats} />

      {/* 03  Offer: what you can hire me for */}
      <div>
        <ServicesSection />
      </div>

      {/* 03b  Fit: the role you are hiring for, with its proof */}
      <RolesFit />

      <SectionDivider text="統治 • 防御 • 検知 • 対応 • 報告" reverse={true} angle={-1.5} />

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

      {/* 06c  The lab the projects run on */}
      <HomeLab />

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
      {/* 07c  Teaching: the curriculum and where it was taught */}
      <div className={DEFER}>
        <TeachingSection />
      </div>

      {/* 07d  In other people's words (hidden until there is a quote) */}
      <div className={DEFER}>
        <TestimonialsSection />
      </div>

      <div className={DEFER}>
        <NowSection items={LIVE_COPY.now} />
      </div>

      {/* 08  Risk removal: how we will work together */}
      <div className={DEFER}>
        <ProcessSection />
      </div>

      {/* 08b  Pre-call answers */}
      <div className={DEFER}>
        <FaqSection items={LIVE_COPY.faq} />
      </div>

      <SectionDivider text="認定 • 実績 • 知識 • 技能" angle={-1.5} />

      {/* 09  Credentials */}
      <div className={DEFER}>
        <CredentialsGallery />
      </div>

      {/* 09b  Public training profiles: proof anyone can check */}
      <div className={DEFER}>
        <PlatformsSection featured={tryHackMePlatform(thm)} thm={thm} others={STATIC_PLATFORMS} />
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

      {/* 10a2  The rule pack behind the coverage */}
      <div className={DEFER}>
        <DetectionLibrary />
      </div>

      {/* 10a3  Try the job: one real alert, three decisions */}
      <div className={DEFER}>
        <TriageChallenge />
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
        kindFacets={kindFacets}
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
