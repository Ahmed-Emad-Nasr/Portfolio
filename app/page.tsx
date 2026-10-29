/*
 * The home page: the pitch (who, roles, proof, experience),
 * about (toolbox, lab, process, contributions), FAQ and contact, with a
 * door to /blog. Section order follows the Sensei-Dev portfolio
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0).
 *
 * Loading: text sections are in the HTML; interactive ones are split
 * per section; off-screen sections use
 * content-visibility (DEFER) and off-screen loops pause (lib/perf/).
 */

import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import SiteNav from "@/components/layout/SiteNav";
import AreaIntro from "@/components/ui/AreaIntro";
import BlogTeaser from "@/components/home/BlogTeaser";
import PageEffects from "@/lib/perf/PageEffects";
import AppLoader from "@/components/layout/AppLoader";
import {
  WorkShowcase,
  RolesFit,
  ExperienceTimeline,
  TeachingSection,
  PlatformsSection,
  TechStackGrid,
  HomeLab,
  ProcessSection,
  FaqSection,
  ContactFooter,
  MobileActionBar,
  PaletteHint,
  LazyContributions,
} from "@/components/home/dynamic";
import { getTryHackMeStats } from "@/lib/api/tryhackme";
import { STATIC_PLATFORMS, tryHackMePlatform } from "@/data/platforms";
import { LIVE_COPY } from "@/data/live-copy";
import { knowledgeEducationItems } from "@/data/experience";
import { OG_IMAGE } from "@/lib/site";
import { KEYWORDS, PERSON_IMAGE, PERSON_REF, SITE_URL, WEBSITE_ID, jsonLd } from "@/lib/seo";
import { normalizePublicHref } from "@/lib/shared";
import { DEFER } from "@/components/ui/kit";
import { homeForwardScript } from "@/lib/routes";
import SlashDivider from "@/components/ui/SlashDivider";
import TickerStrip from "@/components/ui/TickerStrip";

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
    /* A page-level openGraph replaces the layout's whole object */
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

const ABOUT_DESCRIPTION =
  "The security toolbox, the home lab architecture, how an engagement runs, and open-source contributions.";

function structuredData() {
  return jsonLd({
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
        availableLanguage: ["en"],
        serviceType: ["Governance, Risk & Compliance", "SOC Monitoring", "Incident Response", "Digital Forensics", "Malware Analysis", "Identity & Access Management", "Data Security", "Security Training"],
        url: `${SITE_URL}#roles`,
      },
      {
        /* The FAQ exactly as shown on the page */
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
}

/* Old links to the blog's sections on this page (/#cases …) open /blog */
const FORWARD_SCRIPT = homeForwardScript(normalizePublicHref("/").replace(/\/$/, ""));

export default async function Home() {
  const thm = await getTryHackMeStats();

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-clip">
      <div className="site-texture fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
      <script dangerouslySetInnerHTML={{ __html: FORWARD_SCRIPT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <AppLoader />
      <PageEffects />
      <SiteNav />
      <MobileActionBar />
      <PaletteHint />

      {/* ═══ 01 · The pitch: who → roles → proof → experience ═══ */}
      <HeroSection description={LIVE_COPY.heroDescription} evidenceLabel={LIVE_COPY.heroEvidence} />
      <StatsBar stats={LIVE_COPY.stats} />
      <RolesFit />

      <SlashDivider label="01 // Evidence" japanese="証拠" origin="left" />
      <TickerStrip />

      <WorkShowcase />
      <div id="experience">
        <ExperienceTimeline />
      </div>

      {/* Everything below the experience timeline uses no scroll-measured
          animation, so the browser may skip it until it nears the viewport. */}
      <div className={DEFER}>
        <TeachingSection />
      </div>

      <div className={DEFER}>
        <PlatformsSection featured={tryHackMePlatform(thm)} thm={thm} others={STATIC_PLATFORMS} />
      </div>

      {/* ═══ 02 · About: toolbox, lab, process, contributions ═══ */}
      <SlashDivider label="02 // Operating model" japanese="実務" origin="right" />
      <TickerStrip reverse items={["継続", "改善", "実務", "計測", "BUILD THE RECORD"]} />

      <AreaIntro
        id="about"
        eyebrow="About // How I work"
        japanese="人物"
        titleA="Behind the"
        titleB="Work."
        description={ABOUT_DESCRIPTION}
        links={[
          { href: "#stack", label: "Toolbox" },
          { href: "#lab", label: "Home lab" },
          { href: "#process", label: "Process" },
          { href: "#contributions", label: "Contributions" },
        ]}
      />
      <div id="stack" className={DEFER}>
        <TechStackGrid />
      </div>
      <div className={DEFER}>
        <HomeLab />
      </div>
      <div className={DEFER}>
        <ProcessSection />
      </div>
      <div id="contributions">
        <LazyContributions />
      </div>

      {/* ═══ 03 · The door to the blog ═══ */}
      <SlashDivider label="03 // Field notes" japanese="記録" origin="left" />
      <TickerStrip items={["事件", "調査", "報告", "証拠", "FIELD NOTES"]} />
      <div className={DEFER}>
        <BlogTeaser />
      </div>

      {/* ═══ 04 · Questions and contact ═══ */}
      <div className={DEFER}>
        <FaqSection items={LIVE_COPY.faq} />
      </div>
      <div id="contact" className={`mt-20 ${DEFER}`}>
        <ContactFooter />
      </div>
    </main>
  );
}
