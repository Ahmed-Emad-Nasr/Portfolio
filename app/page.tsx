/*
 * app/page.tsx — the whole site, on one page.
 *
 * Everything is a section here: the pitch, the depth (toolbox, lab, path),
 * the blog (posts, case library, ATT&CK, detections, triage, videos) and the
 * gallery. Only documents that are pages by nature keep their own address:
 * each post and case (/blog/<slug>), the CV, privacy and terms. The old
 * /blog, /about and /gallery addresses hop to their section here
 * (components/shared/MovedToSection.tsx).
 *
 * Loading, top to bottom:
 *   • the hero and the text sections are server-rendered (in the HTML);
 *   • interactive sections are split into their own chunks with dynamic
 *     import() (components/home/LazySections.tsx);
 *   • the heavy ones (case library, ATT&CK, detections, triage, gallery,
 *     contributions) are not in the HTML at all: their code and data load
 *     when the reader nears them (core/components/LazySection.tsx);
 *   • off-screen server sections skip style/layout/paint until they near
 *     the viewport (content-visibility: auto), and images load lazily.
 *
 * Section order and components follow the Sensei-Dev portfolio
 * (github.com/MostafaSensei106/Sensei-Dev, GPL-3.0); the content comes from
 * core/config/portfolio-data.ts.
 */

import type { Metadata } from "next";
import { Rss } from "lucide-react";
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
import PostsSection from "@/app/components/blog/PostsSection";
import AreaIntro from "@/app/components/home/AreaIntro";
import { LazyHashNav } from "@/app/core/components/LazySection";
import {
  WorkShowcase,
  ProjectsGrid,
  CredentialsGallery,
  FaqSection,
  ContactFooter,
  MobileActionBar,
  PaletteHint,
  LazyContributions,
  LazyCaseLibrary,
  LazyAttack,
  LazyDetections,
  LazyTriage,
  LazyGallery,
} from "@/app/components/home/LazySections";
import { getGitHubRepos } from "@/app/core/api/github";
import { getTryHackMeStats } from "@/app/core/api/tryhackme";
import { getAllPosts } from "@/app/core/content/posts";
import { STATIC_PLATFORMS, tryHackMePlatform } from "@/app/core/config/platforms";
import { LIVE_COPY } from "@/app/core/config/live-copy";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { attackCoverage, libraryCounts, libraryStructuredData } from "@/app/core/config/library-data";
import { blogYoutubePlaylists, blogYoutubeVideos } from "@/app/core/config/youtube";
import { GALLERY_IMAGE_COUNT, galleryImagePath } from "@/app/core/config/certifications";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";
import {
  CHANNEL_ID,
  KEYWORDS,
  PERSON_IMAGE,
  PERSON_REF,
  SITE_URL,
  WEBSITE_ID,
  jsonLd,
  youtubeEmbed,
  youtubeThumb,
  youtubeWatch,
} from "@/app/core/config/seo";
import { normalizePublicHref } from "@/app/core/config/shared";

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
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "Ahmed Emad Nasr — Blog" }] },
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

const BLOG_DESCRIPTION =
  "Write-ups, incident reports, DFIR investigations, malware analysis, detection rules mapped to MITRE ATT&CK, and Arabic cybersecurity videos.";
const ABOUT_DESCRIPTION =
  "The security toolbox, the home lab, the path from student to instructor, what I am doing now, and how an engagement runs.";

function structuredData() {
  const posts = getAllPosts();
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
          { "@id": `${SITE_URL}#blog` },
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
        "@type": "Blog",
        "@id": `${SITE_URL}#blog`,
        url: `${SITE_URL}#blog`,
        name: "Ahmed Emad Nasr — Blog",
        description: BLOG_DESCRIPTION,
        author: PERSON_REF,
        publisher: PERSON_REF,
        isPartOf: { "@id": WEBSITE_ID },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(`/blog/${p.slug}`)}#article`,
          headline: p.title,
          description: p.description,
          url: absoluteUrl(`/blog/${p.slug}`),
          datePublished: p.date,
          ...(p.updated ? { dateModified: p.updated } : {}),
          inLanguage: p.lang,
          keywords: p.tags.join(", "),
          author: PERSON_REF,
        })),
      },
      libraryStructuredData,
      {
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

/* Off-screen sections skip rendering until they near the viewport;
   `auto` in contain-intrinsic-size remembers each one's real height. */
const DEFER = "cv-defer [content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

export default async function Home() {
  const [repos, thm] = await Promise.all([getGitHubRepos(), getTryHackMeStats()]);
  const projectCount = repos.length;
  const starCount = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const postCount = getAllPosts().length;

  return (
    <main id="main-content" className="relative w-full bg-background text-foreground overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <LazyHashNav />
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

      {/* ═══ 03 · Blog: posts, case library, videos, ATT&CK, rules, triage ═══ */}
      <SectionDivider text="事件 • 調査 • 報告 • 証拠" angle={-1.5} />

      <AreaIntro
        id="blog"
        eyebrow="Blog // Writing & evidence"
        japanese="記録"
        titleA="The"
        titleB="Blog."
        description={BLOG_DESCRIPTION}
        links={[
          ...(postCount ? [{ href: "#posts", label: "Posts", n: postCount }] : []),
          { href: "#cases", label: "Case library", n: libraryCounts.total },
          { href: "#videos", label: "Videos", n: blogYoutubeVideos.length },
          { href: "#attack", label: "ATT&CK coverage", n: attackCoverage.techniqueCount },
          { href: "#detections", label: "Detection rules" },
          { href: "#triage", label: "Triage challenge" },
        ]}
        extra={
          <a
            href={normalizePublicHref("/feed.xml")}
            className="inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary-ink"
          >
            <Rss size={12} aria-hidden="true" /> RSS
          </a>
        }
      />
      <div className={DEFER}>
        <PostsSection />
      </div>
      <LazyCaseLibrary />

      <SectionDivider text="戦術 • 技術 • 網羅 • 証拠" reverse={true} angle={-1.5} />

      <LazyAttack />
      <LazyDetections />
      <LazyTriage />

      {/* ═══ 04 · Gallery, questions, contact ═══ */}
      <SectionDivider text="記録 • 証明 • 瞬間" angle={-1.5} />

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
