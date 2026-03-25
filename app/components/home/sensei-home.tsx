"use client";

/*
 * File: sensei-home.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render home hero with social links and action buttons
 */

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faUserSecret, faFilePdf, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { homeSummaryParagraph } from "@/app/core/data";

const BTN_1_CLASS = `${styles.btn} ${styles.btn1}`;
const BTN_2_CLASS = `${styles.btn} ${styles.btn2}`;

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();

  return (
    <section className={styles.home} id="Home">
      <div className={styles.container}>
        <div className={styles.homeImg}>
          <img src="Assets/art-gallery/Images/logo/My_Logo.webp" alt="Ahmed Emad Nasr Image" className={styles.image} width={350} height={350} fetchPriority="high" loading="eager" decoding="async" onClick={handleImageClick} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23333' width='350' height='350'/%3E%3C/svg%3E"; }} />
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
            <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X" aria-label="X profile"><FontAwesomeIcon icon={faXTwitter} /></a>
          </div>
          <div className={styles.homeButton}>
            <a href="#Contact" className={BTN_1_CLASS}>Hire Me <FontAwesomeIcon icon={faUserSecret} /></a>
            <a href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf" download className={BTN_2_CLASS}>Download CV <FontAwesomeIcon icon={faFilePdf} /></a>
            <a href="#Projects" className={`${styles.btn} ${styles.btn2}`}>View Projects <FontAwesomeIcon icon={faBriefcase} /></a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;