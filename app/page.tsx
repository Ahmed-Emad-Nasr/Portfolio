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
import WorkShowcase from "@/app/components/services/WorkShowcase";
import FaqSection from "@/app/components/services/FaqSection";
import RolesFit from "@/app/components/services/RolesFit";
import TestimonialsSection from "@/app/components/experience/TestimonialsSection";
import { getGitHubRepos } from "@/app/core/api/github";
import BlogTeaser from "@/app/components/cases/BlogTeaser";
import TeachingSection from "@/app/components/experience/TeachingSection";
import PlatformsSection from "@/app/components/experience/PlatformsSection";
import { getTryHackMeStats } from "@/app/core/api/tryhackme";
import { STATIC_PLATFORMS, tryHackMePlatform } from "@/app/core/config/platforms";
import { LIVE_COPY } from "@/app/core/config/live-copy";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { OG_IMAGE } from "@/app/core/config/site";
import { KEYWORDS, PERSON_IMAGE, PERSON_REF, SITE_URL, WEBSITE_ID, jsonLd } from "@/app/core/config/seo";
import { normalizePublicHref } from "@/app/core/config/shared";
import { homeForwardScript } from "@/app/core/config/routes";

const ExperienceTimeline = dynamic(
  () => import("@/app/components/experience/ExperienceTimeline")
);
const ProjectsGrid = dynamic(
  () => import("@/app/components/services/ProjectsGrid")
);
const CredentialsGallery = dynamic(
  () => import("@/app/components/experience/CredentialsGallery")
);
const MobileActionBar = dynamic(() => import("@/app/components/home/MobileActionBar"));
const PaletteHint = dynamic(() => import("@/app/components/home/PaletteHint"));
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
  ],
});

/* Links made before the blog and about pages split off (/#cases,
   /?q=wazuh#cases, /#case-…) open the page the section moved to. */
const FORWARD_SCRIPT = homeForwardScript(normalizePublicHref("/").replace(/\/$/, ""));

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default async function Home() {
  const [repos, thm] = await Promise.all([getGitHubRepos(), getTryHackMeStats()]);
  const projectCount = repos.length;
  const starCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-hidden">
      <script dangerouslySetInnerHTML={{ __html: FORWARD_SCRIPT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }} />
      {/* The two full-screen fixed overlays of the original theme (scanlines
          at 1.5% opacity, a dot grid at 2% of a 7% tint — together under
          0.2% visible) were removed: invisible on screen, but every element
          scrolling under a fixed layer has to be overlap-tested each frame,
          and dropping them halved the main-thread time of a throttled
          desktop scroll trace. */}
      <SiteNav />
      <MobileActionBar />
      <PaletteHint />

      {/*
       * The home page is the pitch, in the order a hiring manager reads:
       * who → what → proof → where → credentials → writing → contact.
       * The depth lives on two more pages (core/config/routes.ts):
       *   /blog   posts, the case library, ATT&CK, detection rules, triage, videos
       *   /about  toolbox, daily drivers, home lab, path, process, contributions, gallery
       */}

      {/* 01  Who: face, name, stack in 5 seconds */}
      <HeroSection projectCount={projectCount} starCount={starCount} description={LIVE_COPY.heroDescription} evidenceLabel={LIVE_COPY.heroEvidence} />

      {/* 02  Trust: numbers before claims */}
      <StatsBar stats={LIVE_COPY.stats} />

      {/* 03  Offer: what you can hire me for */}
      <ServicesSection />

      {/* 03b  Fit: the role you are hiring for, with its proof */}
      <RolesFit />

      <SectionDivider text="統治 • 防御 • 検知 • 対応 • 報告" reverse={true} angle={-1.5} />

      {/* 04  Proof A: labs, research and tools */}
      <WorkShowcase />

      {/* 05  Proof B: open-source depth */}
      <ProjectsGrid repos={repos} />

      {/* 06  Authority: where this happened */}
      <div id="experience">
        <ExperienceTimeline />
      </div>

      {/* Everything below the experience timeline uses no scroll-measured
          animation, so the browser may skip its style, layout and paint
          until it nears the viewport (content-visibility: auto). */}

      {/* 07  Teaching: the curriculum and where it was taught */}
      <div className={DEFER}>
        <TeachingSection />
      </div>

      {/* 07b  In other people's words (hidden until there is a quote) */}
      <div className={DEFER}>
        <TestimonialsSection />
      </div>

      <SectionDivider text="認定 • 実績 • 知識 • 技能" angle={-1.5} />

      {/* 08  Credentials */}
      <div className={DEFER}>
        <CredentialsGallery />
      </div>

      {/* 08b  Public training profiles: proof anyone can check */}
      <div className={DEFER}>
        <PlatformsSection featured={tryHackMePlatform(thm)} thm={thm} others={STATIC_PLATFORMS} />
      </div>

      <SectionDivider text="事件 • 調査 • 報告 • 証拠" reverse={true} angle={-1.5} />

      {/* 09  Writing: the latest posts and three reports to start with */}
      <div className={DEFER}>
        <BlogTeaser />
      </div>

      {/* 10  Pre-call answers */}
      <div className={DEFER}>
        <FaqSection items={LIVE_COPY.faq} />
      </div>

      {/* 11  Action: single CTA */}
      <div id="contact" className={`mt-20 ${DEFER}`}>
        <ContactFooter />
      </div>
    </main>
  );
}
