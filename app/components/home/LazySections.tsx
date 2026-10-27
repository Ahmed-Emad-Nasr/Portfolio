"use client";

/*
 * Every dynamic import on the one-page site, in one place.
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
 *   Lazy (ssr: false)             not in the HTML; code and data download
 *                                 only when the reader nears the section
 *                                 (core/components/LazySection.tsx).
 */

import dynamic from "next/dynamic";
import LazySection, { LazyPlaceholder } from "@/app/core/components/LazySection";

/* ── Server-rendered, split per section ── */
export const WorkShowcase = dynamic(() => import("@/app/components/services/WorkShowcase"));
export const ProjectsGrid = dynamic(() => import("@/app/components/services/ProjectsGrid"));
export const CredentialsGallery = dynamic(() => import("@/app/components/experience/CredentialsGallery"));
export const FaqSection = dynamic(() => import("@/app/components/services/FaqSection"));
export const ContactFooter = dynamic(() => import("@/app/components/header/ContactFooter"));
export const MobileActionBar = dynamic(() => import("@/app/components/home/MobileActionBar"));
export const PaletteHint = dynamic(() => import("@/app/components/home/PaletteHint"));

/* ── Lazy: loaded near the viewport ── */
const pending = () => <LazyPlaceholder />;

const ContributionsGrid = dynamic(() => import("@/app/components/services/ContributionsGrid"), { ssr: false, loading: pending });
const CaseLibraryBlock = dynamic(() => import("@/app/components/cases/CaseLibraryBlock"), { ssr: false, loading: pending });
const AttackBlock = dynamic(() => import("@/app/components/cases/AttackBlock"), { ssr: false, loading: pending });
const DetectionLibrary = dynamic(() => import("@/app/components/cases/DetectionLibrary"), { ssr: false, loading: pending });
const TriageChallenge = dynamic(() => import("@/app/components/cases/TriageChallenge"), { ssr: false, loading: pending });
const ArtGallery = dynamic(() => import("@/app/components/art-gallery/ArtGallery"), { ssr: false, loading: pending });

export function LazyContributions() {
  return (
    <LazySection minHeight="32rem">
      <ContributionsGrid />
    </LazySection>
  );
}

export function LazyCaseLibrary() {
  return (
    <LazySection id="cases" minHeight="200svh">
      <CaseLibraryBlock />
    </LazySection>
  );
}

export function LazyAttack() {
  return (
    <LazySection id="attack" minHeight="120svh">
      <AttackBlock />
    </LazySection>
  );
}

export function LazyDetections() {
  return (
    <LazySection id="detections" minHeight="100svh">
      <DetectionLibrary />
    </LazySection>
  );
}

export function LazyTriage() {
  return (
    <LazySection id="triage" minHeight="100svh">
      <TriageChallenge />
    </LazySection>
  );
}

export function LazyGallery() {
  return (
    <LazySection id="art" minHeight="200svh">
      <ArtGallery />
    </LazySection>
  );
}
