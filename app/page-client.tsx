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
import AboutSection from "@/app/components/about/sensei-about";
import ExperienceSection from "@/app/components/experience/experience-section";
import ProjectsSection from "@/app/components/projects/sensei-projects";
import CaseStudiesSection from "@/app/components/case-studies/sensei-case-studies";
import ContactSection from "@/app/components/contact/sensei-contact";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import MobileQuickActions from "@/app/core/components/MobileQuickActions";
import DesktopQuickCTA from "@/app/core/components/DesktopQuickCTA";
import ErrorBoundary from "@/app/core/components/ErrorBoundary";

// ─── Dynamic imports ──────────────────────────────────────────────────────────
const loadAnimatedBackground = () => import("@/app/components/animated_background/animated_background");
const loadArtGallerySection = () => import("@/app/components/art_gallery/sensei-art");
const loadSkillsShowcase = () => import("@/app/components/skills/skills-showcase");
const loadCertificationsShowcase = () => import("@/app/components/certifications/certifications-showcase");
const loadStatsTestimonials = () => import("@/app/components/stats/stats-testimonials");

const AnimatedBackground = dynamic(loadAnimatedBackground, { ssr: false });
const ArtGallerySection = dynamic(loadArtGallerySection, { ssr: false });
const SkillsShowcase = dynamic(loadSkillsShowcase, { ssr: false });
const CertificationsShowcase = dynamic(loadCertificationsShowcase, { ssr: false });
const StatsTestimonials = dynamic(loadStatsTestimonials, { ssr: false });

// ─── MainClient ───────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    let didMarkReady = false;
    const PRELOAD_TIMEOUT_MS = 2500;
    const MIN_LOADER_MS = 450;

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

    const preloadDynamicSections = Promise.allSettled([
      loadAnimatedBackground(),
      loadArtGallerySection(),
      loadSkillsShowcase(),
      loadCertificationsShowcase(),
      loadStatsTestimonials(),
    ]);

    const boundedPreload = Promise.race([
      preloadDynamicSections,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, PRELOAD_TIMEOUT_MS);
      }),
    ]);

    const minLoaderDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_LOADER_MS);
    });

    const bootstrap = async () => {
      await waitForDomReady;
      await boundedPreload;
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
        <AppBar />
        <HomeSection />
        <AboutSection />
          <ErrorBoundary title="Skills showcase section">
            <SkillsShowcase />
          </ErrorBoundary>
          <ErrorBoundary title="Certifications showcase section">
            <CertificationsShowcase />
          </ErrorBoundary>
          <ErrorBoundary title="Stats & testimonials section">
            <StatsTestimonials />
          </ErrorBoundary>
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