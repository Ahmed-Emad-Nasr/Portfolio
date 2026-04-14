"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header and mobile menu behavior
 */

import { useCallback, useMemo, memo, useEffect, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";
import { usePathname } from "next/navigation";

const MENU_ICON_BASE = styles.MenuIcon;
const NAVBAR_BASE    = styles.navbar;
const ACTIVE_CLASS   = styles.active;
const BLOG_PATH = "/Portfolio/blog";

const SenseiHeader = memo(function SenseiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const {
    isMenuOpen, activeSection, toggleMenu, sectionIcons, setActiveSection, setIsMenuOpen,
  } = useHeader();

  const isBlogRoute =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === BLOG_PATH ||
    pathname.startsWith(`${BLOG_PATH}/`);

  useEffect(() => {
    if (window.innerWidth > 994) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = useCallback((section: string): void => {
    const target = document.getElementById(section);
    if (target) {
      const headerElement = document.querySelector<HTMLElement>("[data-site-header='true']");
      const headerRect = headerElement?.getBoundingClientRect();
      const computedTop = headerElement ? Number.parseFloat(window.getComputedStyle(headerElement).top || "0") : 0;
      const headerHeight = headerRect?.height ?? 0;
      const offset = headerHeight + (Number.isFinite(computedTop) ? computedTop : 0) + 10;
      const targetTop = window.scrollY + target.getBoundingClientRect().top - offset;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  }, []);

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      setActiveSection(section);

      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
        // Wait a frame so body overflow lock is released before scrolling.
        window.requestAnimationFrame(() => {
          scrollToSection(section);
        });
        return;
      }

      scrollToSection(section);
    },
    [scrollToSection, setActiveSection, setIsMenuOpen]
  );

  // Keep keyboard behavior predictable: Escape closes mobile menu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      handleNavLinkClick("Home", event);
    },
    [handleNavLinkClick]
  );

  const handleBackdropClick = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const navLinks = useMemo(
    () =>
      Object.entries(sectionIcons).map(([section, icon]) => {
        const navLabel = section.replace(/([a-z])([A-Z])/g, "$1 $2");

        return (
          <a
            key={section}
            href={`#${section}`}
            className={activeSection === section ? ACTIVE_CLASS : undefined}
            onClick={(event) => handleNavLinkClick(section, event)}
            aria-current={activeSection === section ? "page" : undefined}
          >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
            <span className={styles.navText}>{navLabel}</span>
          </a>
        );
      }),
    [sectionIcons, activeSection, handleNavLinkClick]
  );

  const menuIconClass = isMenuOpen ? `${MENU_ICON_BASE} ${ACTIVE_CLASS}` : MENU_ICON_BASE;
  const navbarClass = isMenuOpen ? `${NAVBAR_BASE} ${ACTIVE_CLASS}` : NAVBAR_BASE;

  return (
    <AnimatePresence>
      <motion.header
        className={isScrolled ? `${styles.header} ${styles.scrolled}` : styles.header}
        data-site-header="true"
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -32, opacity: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <motion.a
          href={BLOG_PATH}
          className={isBlogRoute ? `${styles.blogLink} ${ACTIVE_CLASS}` : styles.blogLink}
          style={{ marginLeft: '0.5rem' }}
          aria-label="Open blog page"
          aria-current={isBlogRoute ? "page" : undefined}
          tabIndex={0}
          onClick={() => {
            if (window.innerWidth <= 994) {
              setIsMenuOpen(false);
            }
          }}
          whileHover={{ scale: 1.06, backgroundColor: "#22c55e", color: "#0f172a" }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <span className={styles.navText}>Blog</span>
        </motion.a>
        <button
          type="button"
          className={menuIconClass}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-controls="main-navigation"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav
          id="main-navigation"
          className={navbarClass}
          aria-label="Main navigation"
        >
          {Object.entries(sectionIcons).map(([section, icon]) => (
            <motion.a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? ACTIVE_CLASS : undefined}
              onClick={(event) => handleNavLinkClick(section, event)}
              aria-current={activeSection === section ? "page" : undefined}
              whileHover={{ scale: 1.08, backgroundColor: "rgba(34,197,94,0.09)" }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ position: "relative" }}
            >
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
              <span className={styles.navText}>{section.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
              {/* تم حذف الخط السفلي المتحرك */}
            </motion.a>
          ))}
        </nav>
        {isMenuOpen ? <button type="button" className={styles.backdrop} aria-label="Close navigation menu" onClick={handleBackdropClick} /> : null}
      </motion.header>
    </AnimatePresence>
  );
});

export default SenseiHeader;