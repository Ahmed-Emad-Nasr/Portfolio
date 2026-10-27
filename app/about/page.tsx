/*
 * app/about/page.tsx — the depth behind the home page's pitch: the toolbox,
 * daily drivers, the home lab, the path so far, what I am doing now, how an
 * engagement runs and open-source contributions. The proof gallery has its
 * own page (/gallery).
 *
 * These were sections 06–10 of the one-page portfolio. A recruiter skimming
 * the home page does not need them; someone who wants to know how I work
 * does, and finds them here (nav "About", command palette, g-shortcuts all
 * resolve through core/config/routes.ts).
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageShell } from "@/app/components/shared/kit";
import SectionHeader from "@/app/core/components/SectionHeader";
import SectionDivider from "@/app/core/components/SectionDivider";
import TechStackGrid from "@/app/components/services/TechStackGrid";
import UsesSection from "@/app/components/services/UsesSection";
import HomeLab from "@/app/components/services/HomeLab";
import ProcessSection from "@/app/components/services/ProcessSection";
import ContributionsGrid from "@/app/components/services/ContributionsGrid";
import { LIVE_COPY } from "@/app/core/config/live-copy";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";
import { PERSON_REF, SITE_URL, jsonLd } from "@/app/core/config/seo";
import { normalizePublicHref } from "@/app/core/config/shared";
import { hashForwardScript } from "@/app/core/config/routes";
import FadeIn from "@/app/core/components/FadeIn";

const MilestonesSection = dynamic(() => import("@/app/components/experience/MilestonesSection"));
const NowSection = dynamic(() => import("@/app/components/experience/NowSection"));

const DESCRIPTION =
  "How Ahmed Emad Nasr works: the security toolbox, the home lab, the path from student to instructor, what he is doing now, and how an engagement runs.";

export const metadata: Metadata = {
  title: "About — Toolbox, Home Lab & Path",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Ahmed Emad Nasr",
    description: DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "profile",
    siteName: "Ahmed Emad Nasr Portfolio",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: "About — Ahmed Emad Nasr", description: DESCRIPTION, images: [OG_IMAGE.url] },
};

const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_1200px]";

const JUMP = [
  { href: "#stack", label: "Toolbox" },
  { href: "#lab", label: "Home lab" },
  { href: "#path", label: "The path" },
  { href: "#now", label: "Now" },
  { href: "#process", label: "Process" },
  { href: "#contributions", label: "Contributions" },
];

/* /about#art (the gallery's old address) opens /gallery#art */
const FORWARD_SCRIPT = hashForwardScript(normalizePublicHref("/").replace(/\/$/, ""), "/about");

const STRUCTURED_DATA = jsonLd({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${absoluteUrl("/about")}#page`,
  url: absoluteUrl("/about"),
  name: "About — Ahmed Emad Nasr",
  description: DESCRIPTION,
  mainEntity: PERSON_REF,
  about: PERSON_REF,
  isPartOf: { "@id": `${SITE_URL}#website` },
  inLanguage: "en",
});

export default function AboutPage() {
  return (
    <PageShell>
      <script dangerouslySetInnerHTML={{ __html: FORWARD_SCRIPT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />

      <header className="relative pt-36 md:pt-44 pb-4 px-6 md:px-20">
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader
            as="h1"
            eyebrow="About // How I work"
            japanese="人物"
            titleA="Behind the"
            titleB="Work."
            description={DESCRIPTION}
          />
          <FadeIn as="nav" y={16} duration={0.6} delay={0.1} aria-label="On this page" className="-mt-8 md:-mt-10 flex flex-wrap gap-2">
            {JUMP.map((j) => (
              <a
                key={j.href}
                href={j.href}
                className="border border-foreground/10 bg-foreground/[0.03] px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors duration-300 hover:border-primary hover:text-foreground"
              >
                {j.label}
              </a>
            ))}
          </FadeIn>
        </div>
      </header>

      {/* The toolbox, then the daily drivers and the lab it all runs on */}
      <div id="stack">
        <TechStackGrid />
      </div>
      <div id="uses">
        <UsesSection />
      </div>
      <HomeLab />

      <SectionDivider text="継続は力なり • 改善 • 実務 • 計測" angle={-1.5} />

      {/* Path recap + present snapshot */}
      <div id="path" className={DEFER}>
        <MilestonesSection />
      </div>
      <div id="now" className={DEFER}>
        <NowSection items={LIVE_COPY.now} />
      </div>

      {/* How an engagement runs */}
      <div className={DEFER}>
        <ProcessSection />
      </div>

      {/* Community contributions */}
      <div id="contributions" className={DEFER}>
        <ContributionsGrid />
      </div>
    </PageShell>
  );
}
