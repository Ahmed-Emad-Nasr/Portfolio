/*
 * AreaIntro — the opening of a group of sections ("About" on the home
 * page, the blog page's own header): a section header and a row of jump
 * links to the sections in the group. Server-rendered; the links are plain #anchors
 * (lib/perf/PageEffects.tsx mounts lazy targets before jumping).
 */

import type { ReactNode } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import FadeIn from "@/components/ui/FadeIn";

type AreaLink = { href: string; label: string; n?: number };

export default function AreaIntro({
  id,
  eyebrow,
  japanese,
  titleA,
  titleB,
  description,
  links,
  extra,
  as = "h2",
}: {
  id: string;
  eyebrow: string;
  japanese: string;
  titleA: string;
  titleB: string;
  description: string;
  links: AreaLink[];
  /** Anything after the jump links (the RSS link on the blog) */
  extra?: ReactNode;
  /** h1 when this is the page's own title (the blog page) */
  as?: "h1" | "h2";
}) {
  /* A page title sits under the fixed nav, so it needs more room on top */
  const top = as === "h1" ? "pt-36 md:pt-44" : "pt-24 md:pt-32";
  return (
    <header id={id} className={`relative ${top} pb-4 px-6 md:px-20 bg-background scroll-mt-24`}>
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader as={as} eyebrow={eyebrow} japanese={japanese} titleA={titleA} titleB={titleB} description={description} />
        <FadeIn as="nav" y={16} duration={0.6} delay={0.1} aria-label={`${titleA} ${titleB}`.replace(/\.$/, "") + " — sections"} className="-mt-8 md:-mt-10 flex flex-wrap items-center gap-2">
          {links.map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="group inline-flex items-center gap-2 border border-foreground/10 bg-foreground/[0.03] px-3.5 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/70 transition-colors duration-300 hover:border-primary hover:text-foreground"
            >
              {j.label}
              {j.n !== undefined && <span className="text-accent tabular-nums">{j.n}</span>}
            </a>
          ))}
          {extra}
        </FadeIn>
      </div>
    </header>
  );
}
