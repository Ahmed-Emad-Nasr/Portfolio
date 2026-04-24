"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render sticky navigation header and mobile menu behavior (Cybersecurity HUD Theme)
 */

import { useCallback, memo, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";
import { usePathname } from "next/navigation";

const MENU_ICON_BASE = styles.MenuIcon;
const NAVBAR_BASE    = styles.navbar;
const ACTIVE_CLASS   = styles.active;
const BLOG_PATH      = "/blog";

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

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
    }
  }, []);

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      setActiveSection(section);

      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
        window.requestAnimationFrame(() => {
          scrollToSection(section);
        });
        return;
      }

      scrollToSection(section);
    },
    [scrollToSection, setActiveSection, setIsMenuOpen]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  const handleBackdropClick = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const menuIconClass = isMenuOpen ? `${MENU_ICON_BASE} ${ACTIVE_CLASS}` : MENU_ICON_BASE;
  const navbarClass = isMenuOpen ? `${NAVBAR_BASE} ${ACTIVE_CLASS}` : NAVBAR_BASE;

  return (
    <>
      <header
        className={isScrolled ? `${styles.header} ${styles.scrolled}` : styles.header}
        data-site-header="true"
      >
        <Link
          href={BLOG_PATH}
          className={isBlogRoute ? `${styles.blogLink} ${ACTIVE_CLASS}` : styles.blogLink}
          aria-label="Open blog page"
          aria-current={isBlogRoute ? "page" : undefined}
          tabIndex={0}
          onClick={() => {
            if (window.innerWidth <= 994) {
              setIsMenuOpen(false);
            }
          }}
        >
          <span className={styles.navText}>Blog</span>
        </Link>

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
            <a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? ACTIVE_CLASS : undefined}
              onClick={(event) => handleNavLinkClick(section, event)}
              aria-current={activeSection === section ? "page" : undefined}
            >
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
              <span className={styles.navText}>{section.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
            </a>
          ))}
        </nav>
      </header>

      {/* Backdrop moved outside header to avoid transform containment issues */}
      {isMenuOpen ? (
        <button 
          type="button" 
          className={styles.backdrop} 
          aria-label="Close navigation menu" 
          onClick={handleBackdropClick} 
        />
      ) : null}
    </>
  );
});

export default SenseiHeader;