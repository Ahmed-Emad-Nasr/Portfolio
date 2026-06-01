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

/*
 * Using a static object avoids inline style object creation on every render.
 * These are the two states the content wrapper can be in.
 */
const CONTENT_STYLE_HIDDEN: React.CSSProperties = {
  // Avoid layout shift: keep content rendered but hidden (opacity/visibility)
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

const HOME_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "78vh",
};

const EXPERIENCE_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "88vh",
};

const PROJECTS_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "92vh",
};

const ART_PLACEHOLDER_STYLE: React.CSSProperties = {
  minHeight: "62vh",
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
      <LoadingScreen />

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