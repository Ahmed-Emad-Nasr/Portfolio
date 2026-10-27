"use client";

/*
 * Every dynamic import on the home page, in one place (the blog's are in
 * components/blog/BlogSections.tsx).
 *
 * Why here and not in app/page.tsx: next/dynamic called from a Server
 * Component does NOT code-split the Client Component it imports (see
 * node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md). Called from
 * a Client Component it does — each import() below is its own chunk.
 *
 * Two kinds:
 *
 *   Server-rendered, own chunk   in the HTML (search engines, no-JS readers),
 *                                 their JavaScript split per section.
 *   Lazy                          not in the HTML; code and data download in
 *                                 idle time, and the section mounts when the
 *                                 reader is within three screens
 *                                 (core/perf/lazy.tsx). The size class is the
 *                                 expected height per screen size
 *                                 (.lazy-h-* in globals.css).
 */

import dynamic from "next/dynamic";
import LazySection, { preloadable } from "@/app/core/perf/lazy";

/* ── Server-rendered, split per section ── */
export const WorkShowcase = dynamic(() => import("@/app/components/services/WorkShowcase"));
export const ProjectsGrid = dynamic(() => import("@/app/components/services/ProjectsGrid"));
export const CredentialsGallery = dynamic(() => import("@/app/components/experience/CredentialsGallery"));
export const FaqSection = dynamic(() => import("@/app/components/services/FaqSection"));
export const ContactFooter = dynamic(() => import("@/app/components/header/ContactFooter"));
export const MobileActionBar = dynamic(() => import("@/app/components/home/MobileActionBar"));
export const PaletteHint = dynamic(() => import("@/app/components/home/PaletteHint"));

/* ── Lazy, preloaded in idle time — in page order ── */
const ContributionsGrid = preloadable(() => import("@/app/components/services/ContributionsGrid"));
const ArtGallery = preloadable(() => import("@/app/components/art-gallery/ArtGallery"));

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
