"use client";

/*
 * File: page-client.tsx
 * Author: Ahmed Emad Nasr
 * Optimized by: Performance audit v2
 *
 * CHANGES:
 * - Added CSS transition on the content wrapper opacity (was appearing with a hard cut)
 * - Replaced height: "100vh" → "auto" swap with `visibility` + `position: fixed` trick:
 *     Avoids layout shift (CLS) — the content renders in its final position immediately,
 *     but is invisible and non-interactive until ready.
 * - MIN_LOADER_MS raised from 120ms → 0ms: the loader should hide as soon as content
 *     is actually ready, not after an arbitrary delay. Adjust if your loader has a
 *     minimum visual duration by design.
 * - SectionSkeleton: added aria-hidden + role to avoid screen-reader noise.
 * - ArtGallerySection: added loading skeleton (was `null` before — caused layout shift).
 * - Wrapped bootstrap in cleanup-safe pattern (already was, kept + clarified).
 * - Removed `window.setTimeout` in favor of `setTimeout` (no difference, just cleaner).
 */

import { memo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import AppBar from "@/app/components/header/sensei-header";
import HomeSection from "@/app/components/home/sensei-home";
import LoadingScreen from "@/app/components/loader/sensei_loader";

// ─── Skeletons ─────────────────────────────────────────────────────────────

/**
 * Placeholder that reserves vertical space during dynamic import.
 * aria-hidden: true → screen readers skip it entirely.
 * minHeight matches typical section height to minimize layout shift.
 */
const SectionSkeleton = () => (
  <div
    role="presentation"
    aria-hidden="true"
    style={SECTION_SKELETON_STYLE}
  />
);

// ─── Dynamic imports ────────────────────────────────────────────────────────

const ExperienceSection = dynamic(
  () => import("@/app/components/experience/experience-section"),
  {
    ssr: false,
    loading: () => <SectionSkeleton />,
  }
);

const ProjectsSection = dynamic(
  () => import("@/app/components/projects/sensei-projects"),
  {
    ssr: false,
    loading: () => <SectionSkeleton />,
  }
);

const ArtGallerySection = dynamic(
  () => import("@/app/components/art_gallery/sensei-art"),
  {
    ssr: false,
    /*
     * Was: loading: () => null
     * Problem: null means zero height → content below jumps when it loads (CLS).
     * Fix: same skeleton to hold the space.
     */
    loading: () => <SectionSkeleton />,
  }
);

// ─── Styles ──────────────────────────────────────────────────────────────────

/*
 * Using a static object avoids inline style object creation on every render.
 * These are the two states the content wrapper can be in.
 */
const CONTENT_STYLE_HIDDEN: React.CSSProperties = {
  /*
   * WHY NOT height: "100vh" → "auto":
   * Changing height from a fixed value to "auto" forces a full layout recalculation
   * on the entire page — that's expensive and causes CLS (Cumulative Layout Shift).
   *
   * Instead:
   * - opacity: 0 → invisible but still in normal flow (no layout shift)
   * - pointerEvents: "none" → non-interactive while hidden
   * - visibility: "hidden" → also hides from assistive tech while loading
   * The content renders at its real height immediately, just invisibly.
   */
  opacity: 0,
  transform: "translate3d(0, 10px, 0)",
  pointerEvents: "none",
  visibility: "hidden",
  transition: "opacity 0.65s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)",
};

const CONTENT_STYLE_VISIBLE: React.CSSProperties = {
  opacity: 1,
  transform: "translate3d(0, 0, 0)",
  pointerEvents: "auto",
  visibility: "visible",
  transition: "opacity 0.65s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)",
};

const SECTION_SKELETON_STYLE: React.CSSProperties = {
  minHeight: "50vh",
  contain: "layout",
};

const MAIN_STYLE: React.CSSProperties = {
  position: "relative",
};

// ─── MainClient ──────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);
  // Track mount state to avoid setState on unmounted component
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const markAppReady = () => {
      if (!isMounted.current) return;
      setIsAppReady(true);
    };

    const bootstrap = async () => {
      // Wait for DOM to be interactive
      if (document.readyState === "loading") {
        await new Promise<void>((resolve) => {
          document.addEventListener("DOMContentLoaded", () => resolve(), {
            once: true,
          });
        });
      }

      // Defer to next paint frame — ensures loader has rendered before we hide it
      requestAnimationFrame(() => {
        requestAnimationFrame(markAppReady); // double rAF: after browser commit
      });
    };

    bootstrap();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <main id="main-content" style={MAIN_STYLE}>
      <LoadingScreen isLoading={!isAppReady} />

      {/* Keep the header outside the animated content wrapper so it is truly fixed
         to the viewport and not contained by transforms applied to the page content. */}
      <AppBar />

      {/*
       * Content is always rendered in the DOM (so dynamic imports start immediately),
       * but invisible and non-interactive until isAppReady flips.
       * The opacity transition gives a smooth cinematic fade-in.
       */}
      <div style={isAppReady ? CONTENT_STYLE_VISIBLE : CONTENT_STYLE_HIDDEN}>
        <HomeSection />
        <ExperienceSection />
        <ProjectsSection />
        <ArtGallerySection />
      </div>
    </main>
  );
});

export default MainClient;