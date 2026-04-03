"use client";

/*
 * File: sensei-home.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render home hero with social links and action buttons
 */

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import { faUserSecret, faFilePdf, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import CVDownloadModal from "@/app/components/cv-download-modal/CVDownloadModal";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { homeSummaryParagraph } from "@/app/core/data";
import { trackEvent } from "@/app/core/utils/analytics";

const BTN_1_CLASS = `${styles.btn} ${styles.btn1}`;
const AB_STORAGE_KEY = "portfolio_cv_cta_variant_v1";
type CVVariant = "A" | "B";
const HERO_PROOF_POINTS = ["200+ Alerts Investigated", "35+ Security Sessions", "Reply within 24h"] as const;

const pickVariant = <T extends string>(a: T, b: T): T => (Math.random() < 0.5 ? a : b);

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const parallaxRafRef = useRef<number | null>(null);
  const parallaxEnabledRef = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cvVariant, setCvVariant] = useState<CVVariant>("A");
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyCapability = () => {
      parallaxEnabledRef.current = mediaQuery.matches && !reducedMotion.matches;
    };

    applyCapability();
    mediaQuery.addEventListener("change", applyCapability);
    reducedMotion.addEventListener("change", applyCapability);

    return () => {
      mediaQuery.removeEventListener("change", applyCapability);
      reducedMotion.removeEventListener("change", applyCapability);
      if (parallaxRafRef.current !== null) {
        window.cancelAnimationFrame(parallaxRafRef.current);
      }
    };
  }, []);

  const availability = useMemo(() => {
    const cairoParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      weekday: "short",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(clock);

    const weekday = cairoParts.find((part) => part.type === "weekday")?.value ?? "Mon";
    const hourValue = Number(cairoParts.find((part) => part.type === "hour")?.value ?? "12");
    const isWeekend = weekday === "Fri" || weekday === "Sat";

    if (isWeekend) {
      return { label: "Limited Availability", hint: "Weekend response window (Cairo time)", toneClass: styles.dotLimited };
    }

    if (hourValue >= 10 && hourValue < 20) {
      return { label: "Available for Opportunities", hint: "Typically replies today (Cairo time)", toneClass: styles.dotAvailable };
    }

    return { label: "Available (Async)", hint: "Usually replies within 24h (Cairo time)", toneClass: styles.dotAsync };
  }, [clock]);

  useEffect(() => {
    try {
      const storedCV = window.localStorage.getItem(AB_STORAGE_KEY) as CVVariant | null;
      const assignedCV = storedCV === "A" || storedCV === "B" ? storedCV : pickVariant<CVVariant>("A", "B");
      window.localStorage.setItem(AB_STORAGE_KEY, assignedCV);
      setCvVariant(assignedCV);

      trackEvent("hero_ab_assigned", {
        cv_variant: assignedCV,
      });
    } catch {
      setCvVariant("A");
    }
  }, []);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!parallaxEnabledRef.current) return;

    const element = containerRef.current;
    if (!element) return;

    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (parallaxRafRef.current !== null) return;

    parallaxRafRef.current = window.requestAnimationFrame(() => {
      const target = containerRef.current;
      if (!target) {
        parallaxRafRef.current = null;
        return;
      }

      const rect = target.getBoundingClientRect();
      const x = (pointerRef.current.x - rect.left) / rect.width;
      const y = (pointerRef.current.y - rect.top) / rect.height;

      target.style.setProperty("--parallax-x", `${(x - 0.5) * 10}px`);
      target.style.setProperty("--parallax-y", `${(y - 0.5) * 10}px`);
      parallaxRafRef.current = null;
    });
  };

  const resetParallax = () => {
    const element = containerRef.current;
    if (!element) return;
    if (parallaxRafRef.current !== null) {
      window.cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = null;
    }
    element.style.setProperty("--parallax-x", "0px");
    element.style.setProperty("--parallax-y", "0px");
  };

  const handleDownloadCVClick = () => {
    trackEvent("cta_click", {
      source: "hero",
      action: "download_cv_modal",
      destination: "cv_modal_open",
      variant: cvVariant,
    });
    setIsModalOpen(true);
  };

  const handleHireMeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    trackEvent("cta_click", { source: "hero", action: "start_project", destination: "#Contact" });

    const contactSection = document.getElementById("Contact");
    if (!contactSection) {
      window.location.hash = "Contact";
      return;
    }

    const header = document.querySelector("header");
    const headerHeight = header?.getBoundingClientRect().height ?? 72;
    const top = contactSection.getBoundingClientRect().top + window.scrollY - (headerHeight + 14);
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const cvBtnClass = `${styles.btn} ${styles.cvBtn} ${cvVariant === "B" ? styles.cvBtnAlt : ""}`;
  const cvBtnLabel = cvVariant === "A" ? "Download CV" : "Get My CV";

  return (
    <section className={styles.home} id="Home">
      <div ref={containerRef} className={styles.container} onMouseMove={handlePointerMove} onMouseLeave={resetParallax}>
        <div className={styles.homeImg}>
          <button
            type="button"
            className={styles.imageButton}
            onClick={handleImageClick}
            aria-label="Open introduction video in a new tab"
            title="Open introduction video"
          >
            <Image
              src="Assets/art-gallery/Images/logo/My_Logo.webp"
              alt="Ahmed Emad Nasr portrait"
              className={styles.image}
              width={350}
              height={350}
              sizes="(max-width: 968px) 80vw, 350px"
              quality={82}
              priority
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23333' width='350' height='350'/%3E%3C/svg%3E";
              }}
            />
          </button>
        </div>

        <div className={styles.homeContent}>
          <h1><span className={styles.highlight}>Ahmed Emad Nasr</span></h1>
          <div className={styles.availabilityStatus}>
            <span className={`${styles.statusDot} ${availability.toneClass}`}></span>
            <span>{availability.label}</span>
            <small className={styles.availabilityMeta}>{availability.hint}</small>
          </div>
          <h2 className={styles.typingText}><span className={styles.typingHighlight} /></h2>
          <p>{homeSummaryParagraph}</p>
          <div className={styles.proofRow} aria-label="Key proof points">
            {HERO_PROOF_POINTS.map((point) => (
              <span key={point} className={styles.proofPill}>{point}</span>
            ))}
          </div>
          <div className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="Linkedin" aria-label="LinkedIn profile"><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp chat"><FontAwesomeIcon icon={faWhatsapp} /></a>
          </div>
          <div className={styles.homeButton}>
            <a
              href="#Contact"
              className={BTN_1_CLASS}
              onClick={handleHireMeClick}
            >
              <span className={styles.liveTag}><span className={styles.livePing} aria-hidden="true" /> Live</span> Hire Me <FontAwesomeIcon icon={faUserSecret} />
            </a>
            <button
              type="button"
              className={cvBtnClass}
              onClick={handleDownloadCVClick}
            >
              {cvBtnLabel} <FontAwesomeIcon icon={faFilePdf} />
            </button>
            <a
              href="#Projects"
              className={BTN_1_CLASS}
              onClick={() => trackEvent("cta_click", { source: "hero", action: "view_projects", destination: "#Projects" })}
            >
              View Projects <FontAwesomeIcon icon={faBriefcase} />
            </a>
          </div>
          <p className={styles.ctaHint}>Best next step: share your goal and receive a tailored response within 24 hours.</p>
          <CVDownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;