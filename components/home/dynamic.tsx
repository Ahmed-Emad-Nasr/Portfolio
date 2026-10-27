"use client";

/*
 * The home page's dynamic imports (next/dynamic only code-splits when called
 * from a Client Component, not from app/page.tsx).
 *
 *   Server-rendered, own chunk — in the HTML, JavaScript split per section.
 *   Lazy — not in the HTML; code loads in idle time and the section mounts
 *   near the viewport (lib/perf/lazy.tsx), sized by .lazy-h-* in globals.css.
 */

import dynamic from "next/dynamic";
import LazySection, { preloadable } from "@/lib/perf/lazy";

/* ── Server-rendered, split per section ── */
export const WorkShowcase = dynamic(() => import("@/components/home/WorkShowcase"));
export const ProjectsGrid = dynamic(() => import("@/components/home/ProjectsGrid"));
export const ServicesSection = dynamic(() => import("@/components/home/ServicesSection"));
export const RolesFit = dynamic(() => import("@/components/home/RolesFit"));
export const ExperienceTimeline = dynamic(() => import("@/components/home/ExperienceTimeline"));
export const TeachingSection = dynamic(() => import("@/components/home/TeachingSection"));
export const PlatformsSection = dynamic(() => import("@/components/home/PlatformsSection"));
export const MilestonesSection = dynamic(() => import("@/components/home/MilestonesSection"));
export const NowSection = dynamic(() => import("@/components/home/NowSection"));
export const TechStackGrid = dynamic(() => import("@/components/home/TechStackGrid"));
export const UsesSection = dynamic(() => import("@/components/home/UsesSection"));
export const HomeLab = dynamic(() => import("@/components/home/HomeLab"));
export const ProcessSection = dynamic(() => import("@/components/home/ProcessSection"));
export const FaqSection = dynamic(() => import("@/components/home/FaqSection"));
export const ContactFooter = dynamic(() => import("@/components/layout/ContactFooter"));
export const MobileActionBar = dynamic(() => import("@/components/home/MobileActionBar"));
export const PaletteHint = dynamic(() => import("@/components/home/PaletteHint"));

/* ── Lazy, preloaded in idle time — in page order ── */
const ContributionsGrid = preloadable(() => import("@/components/home/ContributionsGrid"));

export function LazyContributions() {
  return (
    <LazySection size="lazy-h-contributions">
      <ContributionsGrid />
    </LazySection>
  );
}
