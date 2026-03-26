"use client";

/*
 * File: sensei-home.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render home hero with social links and action buttons
 */

import { memo, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import { faUserSecret, faFilePdf, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { homeSummaryParagraph } from "@/app/core/data";
import { trackEvent } from "@/app/core/utils/analytics";

const BTN_1_CLASS = `${styles.btn} ${styles.btn1}`;
const BTN_2_CLASS = `${styles.btn} ${styles.btn2}`;
const BTN_CV_CLASS = `${styles.btn} ${styles.cvBtn}`;

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const containerRef = useRef<HTMLDivElement>(null);

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
            <a
              href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
              download
              className={BTN_CV_CLASS}
              onClick={() => trackEvent("cta_click", { source: "hero", action: "download_cv", destination: "cv_pdf" })}
            >
              Download CV <FontAwesomeIcon icon={faFilePdf} />
            </a>
            <a
              href="#Projects"
              className={`${styles.btn} ${styles.btn2}`}
              onClick={() => trackEvent("cta_click", { source: "hero", action: "view_projects", destination: "#Projects" })}
            >
              View Projects <FontAwesomeIcon icon={faBriefcase} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;