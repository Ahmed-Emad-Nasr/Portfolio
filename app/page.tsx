/*
 * app/page.tsx — the portfolio, on one page: the pitch (who, what, proof,
 * experience, credentials), about (toolbox, lab, path, process), the
 * gallery, FAQ and contact. The blog — posts, the case library, ATT&CK,
 * detection rules, triage, videos — is its own page (app/blog/page.tsx),
 * with a door to it here (BlogTeaser). Old links to the blog's sections on
 * this page (/#cases, /?q=wazuh#cases …) are forwarded there before paint
 * (core/config/routes.ts); the old /about and /gallery addresses hop to
 * their section here (components/shared/MovedToSection.tsx).
 *
 * Loading, top to bottom:
 *   • the hero and the text sections are server-rendered (in the HTML);
 *   • interactive sections are split into their own chunks with dynamic
 *     import() (components/home/LazySections.tsx);
 *   • the gallery and the contributions graph are not in the HTML: their
 *     code downloads in idle time and they mount before the reader reaches
 *     them (core/perf/lazy.tsx);
 *   • off-screen sections skip style/layout/paint until they near the
 *     viewport (content-visibility: auto); each one is rendered once in idle
 *     time so its real height is known (core/perf/Prerender.tsx);
 *   • looping animations pause while off screen
 *     (core/perf/OffscreenAnimations.tsx), and images load lazily.
 *
 * Everything that schedules background work goes through one queue that
 * waits for idle time and for the reader to stop scrolling
 * (core/perf/idle.ts).
 *
 * Section order and components follow the Sensei-Dev portfolio
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0); the content comes from
 * core/config/portfolio-data.ts.
 */

import type { Metadata } from "next";
import HeroSection from "@/app/components/home/HeroSection";
import StatsBar from "@/app/components/home/StatsBar";
import SiteNav from "@/app/components/header/SiteNav";
import SectionDivider from "@/app/core/components/SectionDivider";
import ServicesSection from "@/app/components/services/ServicesSection";
import RolesFit from "@/app/components/services/RolesFit";
import ExperienceTimeline from "@/app/components/experience/ExperienceTimeline";
import TeachingSection from "@/app/components/experience/TeachingSection";
import TestimonialsSection from "@/app/components/experience/TestimonialsSection";
import PlatformsSection from "@/app/components/experience/PlatformsSection";
import MilestonesSection from "@/app/components/experience/MilestonesSection";
import NowSection from "@/app/components/experience/NowSection";
import TechStackGrid from "@/app/components/services/TechStackGrid";
import UsesSection from "@/app/components/services/UsesSection";
import HomeLab from "@/app/components/services/HomeLab";
import ProcessSection from "@/app/components/services/ProcessSection";
import AreaIntro from "@/app/components/shared/AreaIntro";
import BlogTeaser from "@/app/components/cases/BlogTeaser";
import HashNav from "@/app/core/perf/HashNav";
import Prerender from "@/app/core/perf/Prerender";
import {
  WorkShowcase,
  ProjectsGrid,
  CredentialsGallery,
  FaqSection,
  ContactFooter,
  MobileActionBar,
  PaletteHint,
  LazyContributions,
  LazyGallery,
} from "@/app/components/home/LazySections";
import { getGitHubRepos } from "@/app/core/api/github";
import { getTryHackMeStats } from "@/app/core/api/tryhackme";
import { STATIC_PLATFORMS, tryHackMePlatform } from "@/app/core/config/platforms";
import { LIVE_COPY } from "@/app/core/config/live-copy";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { GALLERY_IMAGE_COUNT, galleryImagePath } from "@/app/core/config/certifications";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";
import { KEYWORDS, PERSON_IMAGE, PERSON_REF, SITE_URL, WEBSITE_ID, jsonLd } from "@/app/core/config/seo";
import { normalizePublicHref } from "@/app/core/config/shared";
import { homeForwardScript } from "@/app/core/config/routes";

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

const ABOUT_DESCRIPTION =
  "The security toolbox, the home lab, the path from student to instructor, what I am doing now, and how an engagement runs.";

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
          { "@id": `${SITE_URL}#art` },
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
        url: `${SITE_URL}#services`,
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
        "@type": "ImageGallery",
        "@id": `${SITE_URL}#art`,
        url: `${SITE_URL}#art`,
        name: "Proof gallery — Ahmed Emad Nasr",
        description: "Certificates, events, the classroom and moments from the path in information security.",
        about: PERSON_REF,
        author: PERSON_REF,
        image: Array.from({ length: GALLERY_IMAGE_COUNT }, (_, i) => absoluteUrl(galleryImagePath(i + 1))),
      },
    ],
  });
}

/* Links made when the blog's sections lived on this page (/#cases,
   /?q=wazuh#cases, /#case-…) open the blog page instead */
const FORWARD_SCRIPT = homeForwardScript(normalizePublicHref("/").replace(/\/$/, ""));

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "cv-defer [content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default async function Home() {
  const [repos, thm] = await Promise.all([getGitHubRepos(), getTryHackMeStats()]);
  const projectCount = repos.length;
  const starCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-clip">
      <script dangerouslySetInnerHTML={{ __html: FORWARD_SCRIPT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <HashNav />
      <Prerender />
      <SiteNav />
      <MobileActionBar />
      <PaletteHint />

      {/* ═══ 01 · The pitch: who → what → proof → where → credentials ═══ */}
      <HeroSection projectCount={projectCount} starCount={starCount} description={LIVE_COPY.heroDescription} evidenceLabel={LIVE_COPY.heroEvidence} />
      <StatsBar stats={LIVE_COPY.stats} />
      <ServicesSection />
      <RolesFit />

      <SectionDivider text="統治 • 防御 • 検知 • 対応 • 報告" reverse={true} angle={-1.5} />

      <WorkShowcase />
      <ProjectsGrid repos={repos} />
      <div id="experience">
        <ExperienceTimeline />
      </div>

      {/* Everything below the experience timeline uses no scroll-measured
          animation, so the browser may skip it until it nears the viewport. */}
      <div className={DEFER}>
        <TeachingSection />
      </div>
      <div className={DEFER}>
        <TestimonialsSection />
      </div>

      <SectionDivider text="認定 • 実績 • 知識 • 技能" angle={-1.5} />

      <div className={DEFER}>
        <CredentialsGallery />
      </div>
      <div className={DEFER}>
        <PlatformsSection featured={tryHackMePlatform(thm)} thm={thm} others={STATIC_PLATFORMS} />
      </div>

      {/* ═══ 02 · About: toolbox, lab, path, now, process, contributions ═══ */}
      <SectionDivider text="継続は力なり • 改善 • 実務 • 計測" reverse={true} angle={-1.5} />

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
          { href: "#path", label: "The path" },
          { href: "#now", label: "Now" },
          { href: "#process", label: "Process" },
          { href: "#contributions", label: "Contributions" },
        ]}
      />
      <div id="stack" className={DEFER}>
        <TechStackGrid />
      </div>
      <div id="uses" className={DEFER}>
        <UsesSection />
      </div>
      <div className={DEFER}>
        <HomeLab />
      </div>
      <div id="path" className={DEFER}>
        <MilestonesSection />
      </div>
      <div id="now" className={DEFER}>
        <NowSection items={LIVE_COPY.now} />
      </div>
      <div className={DEFER}>
        <ProcessSection />
      </div>
      <div id="contributions">
        <LazyContributions />
      </div>

      {/* ═══ 03 · The door to the blog: latest posts, three reports to start with ═══ */}
      <SectionDivider text="事件 • 調査 • 報告 • 証拠" angle={-1.5} />
      <div className={DEFER}>
        <BlogTeaser />
      </div>

      {/* ═══ 04 · Gallery, questions, contact ═══ */}
      {/* Kanji already in the site's Yuji Syuku cut (fonts-yuji-site.css) — a new
          character would fetch a whole Google slice for one divider */}
      <SectionDivider text="記録 • 証明 • 実績" reverse={true} angle={-1.5} />

      <LazyGallery />
      <div className={DEFER}>
        <FaqSection items={LIVE_COPY.faq} />
      </div>
      <div id="contact" className={`mt-20 ${DEFER}`}>
        <ContactFooter />
      </div>
    </main>
  );
}
