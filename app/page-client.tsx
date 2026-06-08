"use client";

/*
 * Client entry for the homepage — lazily loads heavy sections and
 * manages the app-ready state for a smoother initial render.
 * Author: Ahmed Emad Nasr
 */

import { memo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/app/components/loader/sensei_loader";

const AppBar = dynamic(() => import("@/app/components/header/sensei-header"), {
  ssr: false,
  loading: () => null,
});

const HomeSection = dynamic(() => import("@/app/components/home/sensei-home"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={HOME_PLACEHOLDER_STYLE} />,
});

const ExperienceSection = dynamic(() => import("@/app/components/experience/experience-section"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={EXPERIENCE_PLACEHOLDER_STYLE} />,
});

const ProjectsSection = dynamic(() => import("@/app/components/projects/sensei-projects"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={PROJECTS_PLACEHOLDER_STYLE} />,
});

const ArtGallerySection = dynamic(() => import("@/app/components/art_gallery/sensei-art"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" style={ART_PLACEHOLDER_STYLE} />,
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const CONTENT_STYLE_HIDDEN: React.CSSProperties = {
  opacity: 0,
  transform: "translate3d(0, 10px, 0)",
  pointerEvents: "none",
  visibility: "hidden",
  transition: "opacity var(--motion-normal) var(--motion-ease), transform var(--motion-normal) var(--motion-ease)",
};

const CONTENT_STYLE_VISIBLE: React.CSSProperties = {
  opacity: 1,
  transform: "translate3d(0, 0, 0)",
  pointerEvents: "auto",
  visibility: "visible",
  transition: "opacity var(--motion-normal) var(--motion-ease), transform var(--motion-normal) var(--motion-ease)",
};

const MAIN_STYLE: React.CSSProperties = {
  position: "relative",
};

const HOME_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "78vh" };
const EXPERIENCE_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "88vh" };
const PROJECTS_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "92vh" };
const ART_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "62vh" };

// ─── MainClient ──────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const markAppReady = () => {
      if (!isMounted.current) return;
      setIsAppReady(true);
    };

    const bootstrap = async () => {
      if (document.readyState === "loading") {
        await new Promise<void>((resolve) => {
          document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
        });
      }

      // Single rAF + 50 ms minimum timeout.
      // The double-rAF pattern adds ~32–66 ms on budget devices (30 fps rAF).
      // One rAF guarantees we're past the current paint frame; the 50 ms
      // minimum ensures the loader has actually appeared on screen before we
      // hide it, without adding unnecessary delay on fast devices.
      requestAnimationFrame(() => {
        setTimeout(markAppReady, 50);
      });
    };

    bootstrap();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <main id="main-content" style={MAIN_STYLE}>
      <LoadingScreen />

      {/* AppBar is outside the animated wrapper so it is truly fixed to the
          viewport and unaffected by the transform applied to page content. */}
      <AppBar />

      {/* Content is always in the DOM (dynamic imports start immediately),
          but invisible/non-interactive until isAppReady flips. */}
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