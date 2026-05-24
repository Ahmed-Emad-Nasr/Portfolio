"use client";

/*
 * File: sensei-header.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Sticky blog navigation header — Cybersecurity HUD v2
 */

import { useCallback, memo, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import styles from "./sensei-header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faFileLines, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

const SCROLL_SAMPLE_MS = 180;

const NAV_ITEMS = [
  { label: "Home", targetId: null, icon: faHouse },
  { label: "Cases", targetId: "blog-pdfs-title", icon: faFileLines },
  { label: "YouTube Hub", targetId: "youtube-hub-title", icon: faYoutube },
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
  const [activeSection, setActiveSection] = useState<string>("Home");

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    const apply = () => {
      if (window.innerWidth > 994) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
        return;
      }
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
    };

    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
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

  // ── Smooth scroll to section ────────────────────────────────────────────────
  const scrollToSection = useCallback((section: string) => {
    const target = document.getElementById(section);
    if (!target) return;
    const headerEl = document.querySelector<HTMLElement>("[data-site-header='true']");
    const headerH = headerEl?.getBoundingClientRect().height ?? 0;
    const computedTop = headerEl
      ? parseFloat(window.getComputedStyle(headerEl).top || "0")
      : 0;
    const offset = headerH + (isFinite(computedTop) ? computedTop : 0) + 10;
    const targetY = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNavLinkClick = useCallback(
    (section: string, event?: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>) => {
      event?.preventDefault();
      setActiveSection(section);
      if (section === "Home") {
        if (window.innerWidth <= 994) setIsMenuOpen(false);
        scrollToTop();
        return;
      }
      if (window.innerWidth <= 994) {
        setIsMenuOpen(false);
        requestAnimationFrame(() => scrollToSection(section === "Cases" ? "blog-pdfs-title" : "youtube-hub-title"));
      } else {
        scrollToSection(section === "Cases" ? "blog-pdfs-title" : "youtube-hub-title");
      }
    },
    [scrollToSection, scrollToTop]
  );

  const handleBackdropClick = useCallback(
    () => setIsMenuOpen(false),
    []
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
      <header
        className={headerClass}
        data-site-header="true"
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
              href={item.targetId ? `#${item.targetId}` : "#top"}
              className={activeSection === item.label ? styles.active : undefined}
              onClick={(e) => handleNavLinkClick(item.label, e)}
              aria-current={activeSection === item.label ? "page" : undefined}
            >
              <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
              <span className={styles.navText}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Online status chip */}
        <div className={styles.statusChip} aria-hidden="true">
          <span className={styles.statusDot} />
          online
        </div>

        {/* Portfolio CTA */}
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
          onClick={() => setIsMenuOpen((current) => !current)}
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