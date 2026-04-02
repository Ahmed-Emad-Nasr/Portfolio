"use client";

/*
 * File: useHeader.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Handle header navigation state, active section tracking, and mobile menu
 */

import { useState, useEffect, useCallback } from "react";
import {
  faHome, 
  faAddressCard,
  faUserSecret, 
  faBook, 
  faCertificate,
  faFolder, 
  faHandshake,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:       faHome,
  About:      faAddressCard,
  Trust:      faHandshake,
  Experience: faBook,
  Projects:   faFolder,
  Services:   faUserSecret,
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
          const headerHeight = headerElement?.getBoundingClientRect().height ?? (isMobile ? 64 : 76);
          const marker = Math.max(72, Math.round(headerHeight + (isMobile ? 10 : 14)));
          let current: string | undefined;

          for (const section of SECTIONS) {
            const el = document.getElementById(section);
            if (!el) continue;
            const { top } = el.getBoundingClientRect();

            // Keep advancing while section tops are above marker;
            // this avoids losing active state in gaps between sections.
            if (top <= marker) {
              current = section;
              continue;
            }

            // Stop once we passed the first section below marker.
            break;
          }

          // Fallback to first section when near page top.
          if (!current) {
            current = "Home";
          }
          
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