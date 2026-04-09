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
import ExperienceSection from "@/app/components/experience/experience-section";
import ProjectsSection from "@/app/components/projects/sensei-projects";
import CaseStudiesSection from "@/app/components/case-studies/sensei-case-studies";
import ContactSection from "@/app/components/contact/sensei-contact";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import MobileQuickActions from "@/app/core/components/MobileQuickActions";
import DesktopQuickCTA from "@/app/core/components/DesktopQuickCTA";
import ErrorBoundary from "@/app/core/components/ErrorBoundary";
import VisualModeToggle from "@/app/core/components/VisualModeToggle";

// ─── Dynamic imports ──────────────────────────────────────────────────────────
const loadAnimatedBackground = () => import("@/app/components/animated_background/animated_background");
const loadArtGallerySection = () => import("@/app/components/art_gallery/sensei-art");

const AnimatedBackground = dynamic(loadAnimatedBackground, { ssr: false });
const ArtGallerySection = dynamic(loadArtGallerySection, { ssr: false });

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
      loadAnimatedBackground();
      window.requestAnimationFrame(markAppReady);
    };

    bootstrap();

    return () => {
      didMarkReady = true;
    };
  }, []);

  return (
    <main id="main-content" style={{ position: "relative" }}>
      {/* تمرير حالة التحميل للـ Loader بدلاً من إخفائه فجأة */}
      <LoadingScreen isLoading={!isAppReady} />

      <div
        style={{
          opacity: isAppReady ? 1 : 0,
          pointerEvents: isAppReady ? "auto" : "none",
          height: isAppReady ? "auto" : "100vh", 
          overflow: isAppReady ? "visible" : "hidden",
        }}
      >
        <AnimatedBackground />
        <VisualModeToggle />
        <AppBar />
        <HomeSection />
        <ExperienceSection />
        <ErrorBoundary title="Case studies section">
          <CaseStudiesSection />
        </ErrorBoundary>
        <ErrorBoundary title="Projects section">
          <ProjectsSection />
        </ErrorBoundary>
        <ErrorBoundary title="Contact section">
          <ContactSection />
        </ErrorBoundary>
        <ArtGallerySection />
        <DesktopQuickCTA />
        <MobileQuickActions />
      </div>
    </main>
  );
});

export default MainClient;