"use client";

/*
 * File: page-client.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Compose page sections and manage initial app loading state
 */

import { memo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AppBar from "@/app/components/header/sensei-header";
import HomeSection from "@/app/components/home/sensei-home";
import LoadingScreen from "@/app/components/loader/sensei_loader";

// ─── Dynamic imports ──────────────────────────────────────────────────────────

// Fallback بسيط للحفاظ على المساحة لحد ما الكومبوننت يحمل
const SectionSkeleton = () => <div style={{ minHeight: '50vh' }} />;

const ExperienceSection = dynamic(() => import("@/app/components/experience/experience-section"), {
  loading: () => <SectionSkeleton />
});

const WriteupsSection = dynamic(() => import("@/app/components/case-studies/sensei-case-studies"), {
  loading: () => <SectionSkeleton />
});

const ProjectsSection = dynamic(() => import("@/app/components/projects/sensei-projects"), {
  loading: () => <SectionSkeleton />
});

const ArtGallerySection = dynamic(() => import("@/app/components/art_gallery/sensei-art"), { 
  ssr: false,
  loading: () => null,
});

const DesktopQuickCTA = dynamic(() => import("@/app/core/components/DesktopQuickCTA"));
const MobileQuickActions = dynamic(() => import("@/app/core/components/MobileQuickActions"));

// ─── MainClient ───────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    let didMarkReady = false;
    const MIN_LOADER_MS = 120;

    const markAppReady = () => {
      if (didMarkReady) return;
      didMarkReady = true;
      setIsAppReady(true);
    };

    const waitForDomReady =
      document.readyState !== "loading"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
          });

    const minLoaderDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_LOADER_MS);
    });

    const bootstrap = async () => {
      await waitForDomReady;
      await minLoaderDelay;
      window.requestAnimationFrame(markAppReady);
    };

    bootstrap();

    return () => {
      didMarkReady = true;
    };
  }, []);

  return (
    <main id="main-content" style={{ position: "relative" }}>
      <LoadingScreen isLoading={!isAppReady} />

      <div
        style={{
          opacity: isAppReady ? 1 : 0,
          pointerEvents: isAppReady ? "auto" : "none",
          height: isAppReady ? "auto" : "100vh", 
          overflow: isAppReady ? "visible" : "hidden",
        }} >
        <AppBar />
        <HomeSection />
        <ExperienceSection />
        
        <WriteupsSection />
        
        <ProjectsSection />

        <ArtGallerySection />
        <DesktopQuickCTA />
        <MobileQuickActions />
      </div>
    </main>
  );
});

export default MainClient;