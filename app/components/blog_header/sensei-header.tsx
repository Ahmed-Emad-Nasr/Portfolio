"use client";

/*
 * File: sensei-header.tsx (blog)
 * Author: Ahmed Emad Nasr
 * Purpose: Blog navigation header — Cybersecurity HUD v2
 */

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faFileLines, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { useScrollSpy } from "@/app/core/hooks/useScrollSpy";

import styles from "./sensei-header.module.css";

const NAV_ITEMS = [
  { label: "Home",        targetId: "main-content",       icon: faHouse },
  { label: "Cases",       targetId: "blog-pdfs-title",    icon: faFileLines },
  { label: "YouTube Hub", targetId: "youtube-hub-title",  icon: faYoutube },
] as const;

const SPY_SECTIONS = NAV_ITEMS.map(({ label, targetId }) => ({ label, elementId: targetId }));

const SESSION_ID = `0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;

function useUptime() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const ShieldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1L14 4V9C14 12.3 11.3 14.9 8 16C4.7 14.9 2 12.3 2 9V4L8 1Z" />
  </svg>
);

export default function SenseiHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const uptime    = useUptime();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { activeSection, setActiveSection } = useScrollSpy({
    sections: SPY_SECTIONS,
    defaultSection: "Home",
    storageKey: "blog-activeSection",
  });

  // ── Scroll → CSS class, zero re-renders ──────────────────────────────────
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      headerRef.current?.classList.toggle(styles.scrolled, window.scrollY > 18);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth > 994) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  // ── Nav click ─────────────────────────────────────────────────────────────
  const handleNavClick = (label: string, targetId: string, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveSection(label);

    const target = document.getElementById(targetId);
    if (!target) return;

    const doScroll = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const topGap  = parseFloat(getComputedStyle(headerRef.current!).top) || 0;
      window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerH - topGap - 10),
        behavior: "smooth",
      });
    };

    if (isMenuOpen) { setIsMenuOpen(false); requestAnimationFrame(doScroll); }
    else doScroll();
  };

  return (
    <>
      <header ref={headerRef} className={styles.header} data-site-header="true">
        <span className={styles.headerScan} aria-hidden="true" />

        {/* ── Top row ──────────────────────────────────────────────────── */}
        <div className={styles.topRow}>
          {/* Brand */}
          <div className={styles.brand} aria-hidden="true">
            <div className={styles.brandIcon}><ShieldIcon /></div>
            <span className={styles.brandText}>
              AHMED<span className={styles.brandAccent}>.BLOG</span>
            </span>
          </div>

          {/* Nav */}
          <nav
            id="main-navigation"
            className={isMenuOpen ? `${styles.navbar} ${styles.active}` : styles.navbar}
            aria-label="Blog navigation"
          >
            {NAV_ITEMS.map(({ label, targetId, icon }) => (
              <a
                key={label}
                href={`#${targetId}`}
                className={activeSection === label ? styles.active : undefined}
                onClick={(e) => handleNavClick(label, targetId, e)}
                aria-current={activeSection === label ? "page" : undefined}
              >
                <FontAwesomeIcon icon={icon} aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          {/* Right cluster */}
          <div className={styles.rightCluster}>
            <span className={styles.threatChip} aria-hidden="true">
              <span className={styles.threatDot} />
              THREAT:LOW
            </span>

            <span className={styles.statusChip} aria-hidden="true">
              <span className={styles.statusDot} />
              ONLINE
            </span>

            {/* Portfolio CTA */}
            <Link
              href="/"
              className={styles.blogLink}
              aria-label="Back to portfolio"
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
              Portfolio
            </Link>

            <button
              type="button"
              className={isMenuOpen ? `${styles.menuIcon} ${styles.active}` : styles.menuIcon}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-controls="main-navigation"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Meta row ─────────────────────────────────────────────────── */}
        <div className={styles.metaRow} aria-hidden="true">
          <span className={styles.metaItem}>SESSION <span>{SESSION_ID}</span></span>
          <span className={styles.metaItem}>UPTIME <span>{uptime}</span></span>
          <span className={styles.metaItem}>PROTOCOL <span>TLS 1.3</span></span>
          <span className={styles.metaItem}>LOC <span>EG/CAIRO</span></span>
        </div>
      </header>

      {/* Backdrop */}
      <button
        type="button"
        className={isMenuOpen ? `${styles.backdrop} ${styles.backdropActive}` : styles.backdrop}
        aria-label="Close navigation menu"
        onClick={() => setIsMenuOpen(false)}
        tabIndex={isMenuOpen ? 0 : -1}
      />
    </>
  );
}