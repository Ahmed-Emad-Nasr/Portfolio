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
export const CredentialsGallery = dynamic(() => import("@/components/home/CredentialsGallery"));
export const FaqSection = dynamic(() => import("@/components/home/FaqSection"));
export const ContactFooter = dynamic(() => import("@/components/layout/ContactFooter"));
export const MobileActionBar = dynamic(() => import("@/components/home/MobileActionBar"));
export const PaletteHint = dynamic(() => import("@/components/home/PaletteHint"));

/* ── Lazy, preloaded in idle time — in page order ── */
const ContributionsGrid = preloadable(() => import("@/components/home/ContributionsGrid"));
const ArtGallery = preloadable(() => import("@/components/home/ArtGallery"));

export function LazyContributions() {
  return (
    <LazySection size="lazy-h-contributions">
      <ContributionsGrid />
    </LazySection>
  );
}

export function LazyGallery() {
  return (
    <LazySection id="art" size="lazy-h-art">
      <ArtGallery />
    </LazySection>
  );
}
