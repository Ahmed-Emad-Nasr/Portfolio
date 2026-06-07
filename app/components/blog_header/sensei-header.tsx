"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Sticky blog navigation header — Cybersecurity HUD v2
 *
 * Fixes applied:
 *  1. handleNavLinkClick uses NAV_ITEMS to resolve targetId — no more hardcoded strings
 *  2. setActiveSection added to handleNavLinkClick dependency array
 *  3. scrollToTop uses "main-content" (matches SPY_SECTIONS) instead of missing "Home" id
 *  4. SCROLL_SAMPLE_MS reduced 180 → 80ms for snappier scrolled state
 *  5. resize listener wrapped in requestAnimationFrame to throttle repaints
 *  6. <header> gets aria-label="Blog header" for multi-landmark clarity
 */

import { useCallback, memo, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faFileLines, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { useScrollSpy } from "@/app/core/hooks/useScrollSpy";

// FIX: reduced from 180 → 80ms for snappier scrolled-state response
const SCROLL_SAMPLE_MS = 80;

const NAV_ITEMS = [
  { label: "Home",        targetId: "main-content",      icon: faHouse     },
  { label: "Cases",       targetId: "blog-pdfs-title",   icon: faFileLines },
  { label: "YouTube Hub", targetId: "youtube-hub-title", icon: faYoutube   },
] as const;

const SPY_SECTIONS = [
  { label: "Home",        elementId: "main-content"      },
  { label: "Cases",       elementId: "blog-pdfs-title"   },
  { label: "YouTube Hub", elementId: "youtube-hub-title" },
] as const;

/** Shield icon — inline SVG so no extra dep needed */
const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L14 4V9C14 12.3 11.3 14.9 8 16C4.7 14.9 2 12.3 2 9V4L8 1Z" />
  </svg>
);

const SenseiHeader = memo(function SenseiHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "blog-activeSection",
  });

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId = 0;

    const apply = () => {
      if (window.innerWidth > 994) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
        return;
      }
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
    };

    // FIX: wrap resize handler in rAF to throttle layout reads on rapid resize
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
  }, [isMenuOpen]);

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
  }, [isMenuOpen]);

  // ── Section fade animation ──────────────────────────────────────────────────
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
      { duration: 420, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "both" }
    );
  }, []);

  // ── Scroll to a section by DOM id ──────────────────────────────────────────
  const scrollToSection = useCallback(
    (elementId: string) => {
      const target = document.getElementById(elementId);
      if (!target) return;

      const headerEl  = document.querySelector<HTMLElement>("[data-site-header='true']");
      const headerH   = headerEl?.getBoundingClientRect().height ?? 0;
      const computedTop = headerEl
        ? parseFloat(window.getComputedStyle(headerEl).top || "0")
        : 0;
      const offset  = headerH + (isFinite(computedTop) ? computedTop : 0) + 10;
      const targetY = window.scrollY + target.getBoundingClientRect().top - offset;

      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      playSectionFade(target);
    },
    [playSectionFade]
  );

  // ── Scroll to top (Home) ───────────────────────────────────────────────────
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // FIX: was getElementById("Home") which doesn't exist in the DOM.
    // "main-content" is the correct elementId from SPY_SECTIONS for Home.
    const homeEl = document.getElementById("main-content");
    if (homeEl) playSectionFade(homeEl);
  }, [playSectionFade]);

  // ── Nav link click handler ─────────────────────────────────────────────────
  const handleNavLinkClick = useCallback(
    (
      label: string,
      event?: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>
    ) => {
      event?.preventDefault();

      // FIX: was added to deps (was missing before)
      setActiveSection(label);

      if (window.innerWidth <= 994) setIsMenuOpen(false);

      // FIX: resolve targetId from NAV_ITEMS — no more hardcoded label comparisons
      const item = NAV_ITEMS.find((i) => i.label === label);
      if (!item) return;

      if (label === "Home") {
        // Home scrolls to top, not to an anchor
        if (window.innerWidth <= 994) {
          requestAnimationFrame(scrollToTop);
        } else {
          scrollToTop();
        }
        return;
      }

      if (window.innerWidth <= 994) {
        requestAnimationFrame(() => scrollToSection(item.targetId));
      } else {
        scrollToSection(item.targetId);
      }
    },
    // FIX: setActiveSection added to dependency array
    [scrollToSection, scrollToTop, setActiveSection]
  );

  const handleBackdropClick = useCallback(() => setIsMenuOpen(false), []);

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
        aria-label="Blog header"
      >
        {/* Scan sweep overlay */}
        <span className={styles.headerScan} aria-hidden="true" />

        {/* Brand / logo */}
        <div className={styles.brand} aria-hidden="true">
          <div className={styles.brandIcon}>
            <ShieldIcon />
          </div>
          <span className={styles.brandText}>
            AHMED<span className={styles.brandAccent}>.BLOG</span>
          </span>
        </div>

        {/* Navigation links */}
        <nav
          id="main-navigation"
          className={navbarClass}
          aria-label="Blog navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.label === "Home" ? "#top" : `#${item.targetId}`}
              className={activeSection === item.label ? styles.active : undefined}
              onClick={(e) => handleNavLinkClick(item.label, e)}
              aria-current={activeSection === item.label ? "page" : undefined}
            >
              <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
              <span className={styles.navText}>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Portfolio CTA — back link, no active state needed */}
        <Link
          href="/"
          className={styles.blogLink}
          aria-label="Back to portfolio"
          onClick={() => {
            if (window.innerWidth <= 994) setIsMenuOpen(false);
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          <span className={styles.navText}>Portfolio</span>
        </Link>

        {/* Hamburger */}
        <button
          type="button"
          className={menuIconClass}
          onClick={() => setIsMenuOpen((prev) => !prev)}
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