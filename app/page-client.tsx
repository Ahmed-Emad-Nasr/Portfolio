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
import TrustSection from "@/app/components/trust/trust-section";
import ServicesSection from "@/app/components/services/sensei-services-projects";
import ExperienceSection from "@/app/components/experience/experience-section";
import ProjectsSection from "@/app/components/projects/sensei-projects";
import CaseStudiesSection from "@/app/components/case-studies/sensei-case-studies";
import FAQSection from "@/app/components/faq/sensei-faq";
import ContactSection from "@/app/components/contact/sensei-contact";
import LoadingScreen from "@/app/components/loader/sensei_loader";
import MobileQuickActions from "@/app/core/components/MobileQuickActions";
import DesktopQuickCTA from "@/app/core/components/DesktopQuickCTA";
import ErrorBoundary from "@/app/core/components/ErrorBoundary";

// ─── Dynamic imports ──────────────────────────────────────────────────────────
const AnimatedBackground = dynamic(() => import("@/app/components/animated_background/animated_background"), { ssr: false });
const ArtGallerySection = dynamic(() => import("@/app/components/art_gallery/sensei-art"), { ssr: false });

// ─── MainClient ───────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Avoid fixed delays so users can interact as soon as the page is actually ready.
    let didMarkReady = false;

    const markAppReady = () => {
      if (didMarkReady) return;
      didMarkReady = true;
      setIsAppReady(true);
      window.removeEventListener("load", markAppReady);
    };

    // If the page is already loaded, unlock immediately after the current paint.
    if (document.readyState === "complete") {
      window.requestAnimationFrame(markAppReady);
      return () => {};
    }

    // Otherwise wait for the natural load event.
    window.addEventListener("load", markAppReady, { once: true });

    return () => {
      window.removeEventListener("load", markAppReady);
    };
  }, []);

  return (
    <main style={{ position: "relative" }}>
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
        <TrustSection />
        <ExperienceSection />
        <ErrorBoundary title="Projects section">
          <ProjectsSection />
        </ErrorBoundary>
        <ErrorBoundary title="Case studies section">
          <CaseStudiesSection />
        </ErrorBoundary>
        <ErrorBoundary title="FAQ section">
          <FAQSection />
        </ErrorBoundary>
        <ErrorBoundary title="Services section">
          <ServicesSection />
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