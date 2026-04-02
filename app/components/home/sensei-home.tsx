"use client";

/*
 * File: sensei-home.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render home hero with social links and action buttons
 */

import { memo, useEffect, useRef, useState } from "react";
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
const BTN_2_CLASS = `${styles.btn} ${styles.btn2}`;
const AB_STORAGE_KEY = "portfolio_cv_cta_variant_v1";
type CVVariant = "A" | "B";

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cvVariant, setCvVariant] = useState<CVVariant>("A");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AB_STORAGE_KEY);
      if (stored === "A" || stored === "B") {
        setCvVariant(stored);
        return;
      }

      const assignedVariant: CVVariant = Math.random() < 0.5 ? "A" : "B";
      window.localStorage.setItem(AB_STORAGE_KEY, assignedVariant);
      setCvVariant(assignedVariant);
      trackEvent("ab_test_assignment", {
        test_name: "hero_cv_cta",
        variant: assignedVariant,
      });
    } catch {
      setCvVariant("A");
    }
  }, []);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = containerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    element.style.setProperty("--parallax-x", `${(x - 0.5) * 10}px`);
    element.style.setProperty("--parallax-y", `${(y - 0.5) * 10}px`);
  };

  const resetParallax = () => {
    const element = containerRef.current;
    if (!element) return;
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

  const cvBtnClass = `${styles.btn} ${styles.cvBtn} ${cvVariant === "B" ? styles.cvBtnAlt : ""}`;
  const cvBtnLabel = cvVariant === "A" ? "Download CV" : "Get My CV";

  return (
    <section className={styles.home} id="Home">
      <div ref={containerRef} className={styles.container} onMouseMove={handlePointerMove} onMouseLeave={resetParallax}>
        <div className={styles.homeImg}>
          <Image
            src="Assets/art-gallery/Images/logo/My_Logo.webp"
            alt="Ahmed Emad Nasr Image"
            className={styles.image}
            width={350}
            height={350}
            sizes="(max-width: 968px) 80vw, 350px"
            quality={82}
            priority
            onClick={handleImageClick}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23333' width='350' height='350'/%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className={styles.homeContent}>
          <h1><span className={styles.highlight}>Ahmed Emad Nasr</span></h1>
          <div className={styles.availabilityStatus}>
            <span className={`${styles.statusDot} ${styles.dotAvailable}`}></span>
            <span>Available for Opportunities</span>
          </div>
          <h2 className={styles.typingText}><span className={styles.typingHighlight} /></h2>
          <p>{homeSummaryParagraph}</p>
          <div className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="Linkedin" aria-label="LinkedIn profile"><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp chat"><FontAwesomeIcon icon={faWhatsapp} /></a>
          </div>
          <div className={styles.homeButton}>
            <a
              href="#Contact"
              className={BTN_1_CLASS}
              onClick={() => trackEvent("cta_click", { source: "hero", action: "hire_me", destination: "#Contact" })}
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
              className={`${styles.btn} ${styles.btn2}`}
              onClick={() => trackEvent("cta_click", { source: "hero", action: "view_projects", destination: "#Projects" })}
            >
              View Projects <FontAwesomeIcon icon={faBriefcase} />
            </a>
          </div>
          <CVDownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;