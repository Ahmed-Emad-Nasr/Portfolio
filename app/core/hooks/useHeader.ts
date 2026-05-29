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
  faFolder, 
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useScrollSpy } from "./useScrollSpy";

const SECTION_ICONS: Record<string, IconProp> = {
  Home:       faHome,
  Experience: faBook,
  Projects:   faFolder,
  Certifications: faCertificate,
};

const SECTIONS = Object.keys(SECTION_ICONS);
const SPY_SECTIONS = SECTIONS.map((label) => ({ label, elementId: label }));

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "portfolio-activeSection",
  });

  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((prev) => !prev);
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