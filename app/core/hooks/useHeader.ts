"use client";

/*
 * File: useHeader.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Handle header navigation state, active section tracking, and mobile menu
 */

import { useState, useEffect, useCallback } from "react";
import {
  faHome, 
  faBook, 
  faCertificate,
  faClipboardCheck,
  faFolder, 
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:       faHome,
  Experience: faBook,
  Writeups: faClipboardCheck,
  Projects:   faFolder,
  Contact:    faEnvelope,
  Certifications: faCertificate,
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
      }
    } catch {
      // localStorage is not available (cross-origin iframe, private browsing, etc.)
    }

    let ticking = false;
    let lastSection = "Home";

    const handleScroll = (): void => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          const isMobile = window.innerWidth <= 994;
          const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");
          const headerRect = headerElement?.getBoundingClientRect();
          const headerHeight = headerRect?.height ?? (isMobile ? 64 : 76);
          const headerTop = headerElement ? Number.parseFloat(window.getComputedStyle(headerElement).top || "0") : 0;
          const topOffset = Number.isFinite(headerTop) ? headerTop : 0;
          const marker = Math.max(72, Math.round(topOffset + headerHeight + (isMobile ? 8 : 12)));
          let current = "Home";
          let smallestDistance = Number.POSITIVE_INFINITY;

          for (const section of SECTIONS) {
            const el = document.getElementById(section);
            if (!el) continue;
            const { top } = el.getBoundingClientRect();
            const distance = Math.abs(top - marker);

            if (distance < smallestDistance) {
              smallestDistance = distance;
              current = section;
            }
          }
          
          if (current !== lastSection) {
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
    handleScroll();
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