"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Sticky navigation header — Cybersecurity HUD v2
 *
 * Fixes applied:
 *  1. statusChip rendered in JSX (was defined in CSS but never used)
 *  2. scrollToSection uses behavior: "smooth" (was "auto")
 *  3. isBlogRoute uses a safe helper to avoid false-positive prefix matches
 *  4. resize listener wrapped in requestAnimationFrame to throttle repaints
 *  5. SCROLL_SAMPLE_MS reduced from 180 → 80ms for snappier scrolled state
 *  6. <header> gets aria-label="Site header" for multi-landmark clarity
 */

import { useCallback, memo, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeader } from "@/app/core/hooks/useHeader";

// FIX: reduced from 180 → 80ms for a snappier scrolled-state response
const SCROLL_SAMPLE_MS = 80;
const BLOG_PATH        = "/blog";

// FIX: safe route-matching helper — avoids false positives like "/blogging"
function isBlogPath(pathname: string): boolean {
  return pathname === BLOG_PATH || pathname.startsWith(`${BLOG_PATH}/`);
}

/** Shield icon — inline SVG so no extra dep needed */
const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L14 4V9C14 12.3 11.3 14.9 8 16C4.7 14.9 2 12.3 2 9V4L8 1Z" />
  </svg>
);

const SenseiHeader = memo(function SenseiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const {
    isMenuOpen,
    activeSection,
    toggleMenu,
    sectionIcons,
    setActiveSection,
    setIsMenuOpen,
  } = useHeader();

  // FIX: use safe helper instead of inline startsWith
  const isBlogRoute = isBlogPath(pathname);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId = 0;

    // FIX: resize handler wrapped in rAF to throttle layout reads on rapid resize
    const apply = () => {
      if (window.innerWidth > 994) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
        return;
      }
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
    };

    const onResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        apply();
        rafId = 0;
      });
    };

    apply();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // ── Scroll detection (throttled) ────────────────────────────────────────────
  useEffect(() => {
    let rafId = 0;
    let timeoutId: number | undefined;
    let lastRun = 0;

    const update = () => {
      setIsScrolled(window.scrollY > 18);
      lastRun = performance.now();
      rafId = 0;
      timeoutId = undefined;
    };

    const onScroll = () => {
      const elapsed = performance.now() - lastRun;
      if (rafId || timeoutId !== undefined) return;
      if (elapsed >= SCROLL_SAMPLE_MS) {
        rafId = requestAnimationFrame(update);
      } else {
        timeoutId = window.setTimeout(() => {
          rafId = requestAnimationFrame(update);
        }, SCROLL_SAMPLE_MS - elapsed);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  // ── Escape key to close menu ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen, setIsMenuOpen]);

  // ── Smooth scroll to section ────────────────────────────────────────────────
  const playSectionFade = useCallback((target: HTMLElement) => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof target.animate !== "function") return;

    target.animate(
      [
        { opacity: 0.35, transform: "translate3d(0, 14px, 0)" },
        { opacity: 1,    transform: "translate3d(0, 0, 0)"    },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        fill: "both",
      }
    );
  }, []);

  const scrollToSection = useCallback(
    (section: string) => {
      const target = document.getElementById(section);
      if (!target) return;

      const headerEl = document.querySelector<HTMLElement>("[data-site-header='true']");
      const headerH  = headerEl?.getBoundingClientRect().height ?? 0;
      const computedTop = headerEl
        ? parseFloat(window.getComputedStyle(headerEl).top || "0")
        : 0;
      const offset  = headerH + (isFinite(computedTop) ? computedTop : 0) + 10;
      const targetY = window.scrollY + target.getBoundingClientRect().top - offset;

      // FIX: was behavior: "auto" — changed to "smooth" to match intent
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      playSectionFade(target);
    },
    [playSectionFade]
  );

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      setActiveSection(section);
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => scrollToSection(section));
      } else {
        scrollToSection(section);
      }
    },
    [scrollToSection, setActiveSection, setIsMenuOpen]
  );

  const handleBackdropClick = useCallback(
    () => setIsMenuOpen(false),
    [setIsMenuOpen]
  );

  const menuIconClass = isMenuOpen
    ? `${styles.MenuIcon} ${styles.active}`
    : styles.MenuIcon;

  const navbarClass = isMenuOpen
    ? `${styles.navbar} ${styles.active}`
    : styles.navbar;

  const headerClass = isScrolled
    ? `${styles.header} ${styles.scrolled}`
    : styles.header;

  return (
    <>
      {/* FIX: aria-label added for multi-landmark clarity */}
      <header
        className={headerClass}
        data-site-header="true"
        aria-label="Site header"
      >
        {/* Scan sweep overlay */}
        <span className={styles.headerScan} aria-hidden="true" />

        {/* Brand / logo */}
        <div className={styles.brand} aria-hidden="true">
          <div className={styles.brandIcon}>
            <ShieldIcon />
          </div>
          <span className={styles.brandText}>
            AHMED<span className={styles.brandAccent}>.SEC</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav
          id="main-navigation"
          className={navbarClass}
          aria-label="Main navigation"
        >
          {Object.entries(sectionIcons).map(([section, icon]) => (
            <a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? styles.active : undefined}
              onClick={(e) => handleNavLinkClick(section, e)}
              aria-current={activeSection === section ? "page" : undefined}
            >
              <FontAwesomeIcon icon={icon} aria-hidden="true" />
              <span className={styles.navText}>
                {section.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            </a>
          ))}
        </nav>

        {/* FIX: statusChip was fully defined in CSS but never rendered — added here */}
        <div className={styles.statusChip} aria-hidden="true">
          <span className={styles.statusDot} />
          <span>online</span>
        </div>

        {/* Blog CTA */}
        <Link
          href={BLOG_PATH}
          className={
            isBlogRoute
              ? `${styles.blogLink} ${styles.active}`
              : styles.blogLink
          }
          aria-label="Open blog page"
          aria-current={isBlogRoute ? "page" : undefined}
          onClick={() => {
            if (window.innerWidth <= 994) setIsMenuOpen(false);
          }}
        >
          <span className={styles.navText}>Blog</span>
        </Link>

        {/* Hamburger */}
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
      </header>

      {/* Backdrop — outside header to avoid transform containment */}
      {isMenuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation menu"
          onClick={handleBackdropClick}
        />
      )}
    </>
  );
});

export default SenseiHeader;