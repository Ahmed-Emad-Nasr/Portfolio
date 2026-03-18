"use client";
import { useState, useEffect, useCallback } from "react";
import {
  faHome, 
  faUserSecret, 
  faBook, 
  faFolder, 
  faPalette, 
  faBrain,
  faEnvelope // 1. تم استدعاء أيقونة قسم التواصل
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:       faHome,
  Experience: faBook,
  Skills:     faBrain,
  Projects:   faFolder,
  Services:   faUserSecret,
  Contact:    faEnvelope, 
  ArtGallery: faPalette,
};

const SECTIONS = Object.keys(SECTION_ICONS);

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    // Safely access localStorage with try/catch for cross-origin iframes
    try {
      const savedSection = localStorage.getItem("activeSection");
      if (savedSection && SECTIONS.includes(savedSection)) {
        setActiveSection(savedSection);
        // Optional: document.getElementById(savedSection)?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      // localStorage is not available (cross-origin iframe, private browsing, etc.)
    }

    let ticking = false; // Flag for requestAnimationFrame
    let lastSection = "Home"; // Cache to prevent redundant updates

    const handleScroll = (): void => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          const current = SECTIONS.find((section) => {
            const el = document.getElementById(section);
            if (!el) return false;
            const { top, bottom } = el.getBoundingClientRect();
            return top <= 150 && bottom >= 150; // Offset adjusted slightly for better UX
          });
          
          // Only update if section actually changed (prevents race condition & storage thrashing)
          if (current && current !== lastSection) {
            lastSection = current;
            setActiveSection(current);
            try {
              localStorage.setItem("activeSection", current);
            } catch {
              // localStorage is not available; silently ignore
            }
          }
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth > 994 && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return {
    isMenuOpen,
    activeSection,
    toggleMenu,
    sectionIcons: SECTION_ICONS,
    setActiveSection,
    setIsMenuOpen,
  };
};