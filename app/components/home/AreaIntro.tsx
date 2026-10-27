/*
 * AreaIntro — the opening of a group of sections on the one-page site
 * ("About", "Blog"): a section header and a row of jump links to the
 * sections in the group. Server-rendered; the links are plain #anchors
 * (core/components/LazySection.tsx mounts lazy targets before scrolling).
 */

import type { ReactNode } from "react";
import SectionHeader from "@/app/core/components/SectionHeader";
import FadeIn from "@/app/core/components/FadeIn";

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
}) {
  return (
    <header id={id} className="relative pt-24 md:pt-32 pb-4 px-6 md:px-20 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader eyebrow={eyebrow} japanese={japanese} titleA={titleA} titleB={titleB} description={description} />
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
