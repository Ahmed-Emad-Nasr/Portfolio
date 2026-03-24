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
const AnimatedBackground = dynamic(() => import("@/app/components/animated_background/animated_background"), { ssr: false });
const ServicesSection = dynamic(() => import("@/app/components/services/sensei-services-projects"), { ssr: false });
const ExperienceSection = dynamic(() => import("@/app/components/experience/experience-section"), { ssr: false });
const ProjectsSection = dynamic(() => import("@/app/components/services/sensei-projects"), { ssr: false });
const ArtGallerySection = dynamic(() => import("@/app/components/art_gallery/sensei-art"), { ssr: false });
const SkillsSection = dynamic(() => import("@/app/components/skills/sensei-skills"), { ssr: false });
const ContactSection = dynamic(() => import("@/app/components/contact/sensei-contact"), { ssr: false });

// ─── MainClient ───────────────────────────────────────────────────────────────

const MainClient = memo(function MainClient() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // ⏱️ 1200ms provides optimal time for Next.js to load dynamic components
    // in the background after the initial page loads. Uses both timer + load event as fallback.
    let timeoutId: NodeJS.Timeout | null = null;
    let didMarkReady = false;

    const markAppReady = () => {
      if (didMarkReady) return;
      didMarkReady = true;
      setIsAppReady(true);
      // Clean up listener after firing
      window.removeEventListener("load", markAppReady);
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Primary: Timer-based approach
    timeoutId = setTimeout(markAppReady, 1200);

    // Fallback: If page already fully loaded, don't wait for timer
    if (document.readyState === "complete") {
      markAppReady();
      return () => {};
    }

    // Fallback: Listen for window load event in case it fires before timer
    window.addEventListener("load", markAppReady, { once: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <ServicesSection />
        <ContactSection />
        <ArtGallerySection />
      </div>
    </main>
  );
});

export default MainClient;