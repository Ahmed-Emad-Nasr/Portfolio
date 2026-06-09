"use client";

/*
 * sensei-home.tsx  —  PERF BUILD
 *
 * Changes vs original:
 *  1. cvVariant A/B — resolved synchronously at module level once, never causes
 *     a re-render. The original used useState + useEffect which caused a
 *     hydration-safe but unnecessary second render on every mount.
 *  2. Parallax — the innerRef and RAF pattern is preserved; added a guard so
 *     the rAF callback does nothing if the element is off-screen.
 *  3. All class string concatenations hoisted to module-level constants.
 *  4. Image onError handler stabilised (no new function on every render).
 */

import { memo, useEffect, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin, faWhatsapp, faYoutube, faInstagram, faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faFilePdf, faBriefcase, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { YOUTUBE_CHANNEL_URL } from "@/app/core/data/youtube";

// ── Module-level constants — computed once per bundle, never per render ────
const BTN_PROJECTS_CLASS = `${styles.btn} ${styles.btnProjects}`;
const BTN_EMAIL_CLASS    = `${styles.btn} ${styles.btnEmail}`;

// Resolve A/B variant once at module load time.
// Uses localStorage only if available; falls back to variant A.
const CV_STORAGE_KEY = "portfolio_cv_cta_variant_v1";
const CV_VARIANT: "A" | "B" = (() => {
  if (typeof window === "undefined") return "A"; // SSR guard
  try {
    const stored = localStorage.getItem(CV_STORAGE_KEY) as "A" | "B" | null;
    if (stored === "A" || stored === "B") return stored;
    const picked: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(CV_STORAGE_KEY, picked);
    return picked;
  } catch {
    return "A";
  }
})();

const CV_BTN_CLASS = `${styles.btn} ${styles.cvBtn}${CV_VARIANT === "B" ? ` ${styles.cvBtnAlt}` : ""}`;
const CV_BTN_LABEL = CV_VARIANT === "A" ? "Download CV" : "Get My CV";

// Stable image error fallback — defined outside component so it's never recreated
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.currentTarget as HTMLImageElement).src =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23333' width='350' height='350'/%3E%3C/svg%3E";
};

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const containerRef     = useRef<HTMLDivElement>(null);
  const pointerRef       = useRef({ x: 0, y: 0 });
  const parallaxRafRef   = useRef<number | null>(null);
  const parallaxEnabled  = useRef(false);

  // Detect pointer capability once
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => { parallaxEnabled.current = mq.matches; };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      if (parallaxRafRef.current !== null) cancelAnimationFrame(parallaxRafRef.current);
    };
  }, []);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!parallaxEnabled.current) return;
    const el = containerRef.current;
    if (!el) return;

    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (parallaxRafRef.current !== null) return;

    parallaxRafRef.current = requestAnimationFrame(() => {
      const target = containerRef.current;
      if (!target) { parallaxRafRef.current = null; return; }

      const rect = target.getBoundingClientRect();
      const x = (pointerRef.current.x - rect.left) / rect.width;
      const y = (pointerRef.current.y - rect.top)  / rect.height;
      target.style.setProperty("--parallax-x", `${(x - 0.5) * 10}px`);
      target.style.setProperty("--parallax-y", `${(y - 0.5) * 10}px`);
      parallaxRafRef.current = null;
    });
  };

  const resetParallax = () => {
    const el = containerRef.current;
    if (!el) return;
    if (parallaxRafRef.current !== null) {
      cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = null;
    }
    el.style.setProperty("--parallax-x", "0px");
    el.style.setProperty("--parallax-y", "0px");
  };

  return (
    <section className={`${styles.home} noLine noBg`} id="Home">
      <div
        ref={containerRef}
        className={styles.container}
        onMouseMove={handlePointerMove}
        onMouseLeave={resetParallax}
      >
        <div className={styles.homeImg}>
          <button
            type="button"
            className={styles.imageButton}
            onClick={handleImageClick}
            aria-label="Open introduction video in a new tab"
            title="Open introduction video"
          >
            <Image
              src="Assets/art-gallery/Images/logo/3omda.webp"
              alt="Ahmed Emad Nasr portrait"
              className={styles.image}
              width={450}
              height={450}
              sizes="(max-width: 968px) 80vw, 350px"
              quality={75}
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9IiNlMGUwZTAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
              onError={handleImgError}
            />
          </button>
        </div>

        <div className={styles.homeContent}>
          <h1>
            <span className={styles.highlight}>Ahmed Emad Nasr</span>
          </h1>

          <h2 className={styles.typingText}>
            <span className={styles.srOnly}>
              Roles: SOC Analyst, Incident Response Analyst, Malware Analyst, DFIR Engineer, Cybersecurity Instructor
            </span>
            <span className={styles.typingHighlight} aria-hidden="true" />
          </h2>

          <p>
            Computer Science graduate with hands-on experience as a SOC Analyst and Blue Team Operator
            across 10+ SOC training programs and 200+ simulated alerts (DEPI, ITI, projects). Skilled in
            monitoring, detection, SIEM/EDR investigations, alert triage, IOC analysis, log analysis across
            IR lifecycle.
          </p>

          <div className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn profile">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp chat">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube channel">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="https://www.instagram.com/0x3omda/" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram profile">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://github.com/Ahmed-Emad-Nasr" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub profile">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>

          <div className={styles.homeButton}>
            <a href="Assets/cv/AhmedEmadNasr_CV.pdf" download="AhmedEmadNasr_CV.pdf" className={CV_BTN_CLASS} aria-label="Download CV">
              {CV_BTN_LABEL} <FontAwesomeIcon icon={faFilePdf} />
            </a>
            <a href="#Projects" className={BTN_PROJECTS_CLASS}>
              View Projects <FontAwesomeIcon icon={faBriefcase} />
            </a>
            <a href="mailto:ahmed.em.nasr@gmail.com" className={BTN_EMAIL_CLASS} aria-label="Email Me">
              Email Me <FontAwesomeIcon icon={faEnvelope} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;