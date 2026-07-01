"use client";

/*
 * Client entry for the homepage
 * PERF: bootstrap simplified — single rAF, no DOMContentLoaded wait
 * PERF: inline styles structured properly to leverage global motion CSS variables
 */

import { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import KanjiDivider from "@/app/core/components/KanjiDivider";
import ClientOnly from "@/app/core/components/ClientOnly";

const AppBar = dynamic(() => import("@/app/components/header/sensei-header"), {
  ssr: false,
  loading: () => null,
});

const HomeSection = dynamic(() => import("@/app/components/home/sensei-home"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" className="skeleton-shimmer" style={HOME_PLACEHOLDER_STYLE} />,
});

const ExperienceSection = dynamic(() => import("@/app/components/experience/experience-section"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" className="skeleton-shimmer" style={EXPERIENCE_PLACEHOLDER_STYLE} />,
});

const ProjectsSection = dynamic(() => import("@/app/components/projects/sensei-projects"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" className="skeleton-shimmer" style={PROJECTS_PLACEHOLDER_STYLE} />,
});

const ArtGallerySection = dynamic(() => import("@/app/components/art_gallery/sensei-art"), {
  ssr: false,
  loading: () => <div role="presentation" aria-hidden="true" className="skeleton-shimmer" style={ART_PLACEHOLDER_STYLE} />,
});

// ─── Styles — module-level constants, never re-allocated ─────────────────────

const BASE_TRANSITION = "opacity var(--motion-normal) var(--motion-ease), transform var(--motion-normal) var(--motion-ease)";

const CONTENT_STYLE_HIDDEN: React.CSSProperties = {
  opacity: 0,
  transform: "translate3d(0, 10px, 0)",
  pointerEvents: "none",
  visibility: "hidden",
  transition: BASE_TRANSITION,
};

const CONTENT_STYLE_VISIBLE: React.CSSProperties = {
  opacity: 1,
  transform: "translate3d(0, 0, 0)",
  pointerEvents: "auto",
  visibility: "visible",
  transition: BASE_TRANSITION,
};

const MAIN_STYLE: React.CSSProperties = { position: "relative" };
const HOME_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "78vh" };
const EXPERIENCE_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "88vh" };
const PROJECTS_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "92vh" };
const ART_PLACEHOLDER_STYLE: React.CSSProperties = { minHeight: "62vh" };

// ─── MainClient ──────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Next.js guarantees document is at least "interactive" before hydration.
    // Single rAF is sufficient to let the loader paint before we reveal content.
    const id = window.requestAnimationFrame(() => setIsAppReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <main id="main-content" style={MAIN_STYLE}>
      <LoadingScreen />
      <AppBar />
      <div style={isAppReady ? CONTENT_STYLE_VISIBLE : CONTENT_STYLE_HIDDEN}>
        <HomeSection />
        <ClientOnly>
          <KanjiDivider text="武士道 • 継続は力なり • 改善 • 不撓不屈" angle={1.5} />
        </ClientOnly>
        <ExperienceSection />
        <ClientOnly>
          <KanjiDivider text="設計 • 開発 • 構築 • 実装 • 実験" reverse angle={-1.5} />
        </ClientOnly>
        <ProjectsSection />
        <ClientOnly>
          <KanjiDivider text="認定 • 成就 • 学問 • 知識 • 技能" angle={2} />
        </ClientOnly>
        <ArtGallerySection />
        <ClientOnly>
          <KanjiDivider text="芸術 • 創造 • 精神 • 表現 • 魂" reverse angle={-2} />
        </ClientOnly>
      </div>
    </main>
  );
});

export default MainClient;