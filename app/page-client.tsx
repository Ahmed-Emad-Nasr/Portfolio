"use client";

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
    // in the background after the initial page loads
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1200);

    // Use readyState to detect if page is already loaded before attaching listener
    if (document.readyState !== "loading") {
      // Page is already loaded or loading — do not attach additional listener
      return () => clearTimeout(timer);
    }

    return () => clearTimeout(timer);
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
          /* تم توحيد تأثير الظهور مع باقي الموقع */
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)", 
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