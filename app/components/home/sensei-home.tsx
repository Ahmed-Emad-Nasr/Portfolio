"use client";

/*
 * File: sensei-home.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render home hero with social links and action buttons
 */

import { memo } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faUserSecret, faFilePdf, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";

const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: SLIDE_EASE } },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: SLIDE_EASE } },
};

const BTN_1_CLASS = `${styles.btn} ${styles.btn1}`;
const BTN_2_CLASS = `${styles.btn} ${styles.btn2}`;

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const [containerRef, containerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles.home} id="Home">
      <motion.div ref={containerRef} className={styles.container} initial="hidden" animate={containerInView ? "visible" : "hidden"} variants={CONTAINER_VARIANTS}>
        <motion.div className={styles.homeImg} variants={ITEM_VARIANTS}>
          <img src="Assets/art-gallery/Images/logo/My_Logo.webp" alt="Ahmed Emad Nasr Image" className={styles.image} width={350} height={350} fetchPriority="high" loading="eager" decoding="async" onClick={handleImageClick} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23333' width='350' height='350'/%3E%3C/svg%3E"; }} />
        </motion.div>

        <motion.div className={styles.homeContent} variants={ITEM_VARIANTS}>
          <h1><span className={styles.highlight}>Ahmed Emad Nasr</span></h1>
          <motion.div className={styles.availabilityStatus} variants={ITEM_VARIANTS}>
            <span className={`${styles.statusDot} ${styles.dotAvailable}`}></span>
            <span>Available for Opportunities</span>
          </motion.div>
          <h2 className={styles.typingText}><span className={styles.typingHighlight} /></h2>
          <p>Computer Science student at Benha University, specializing in SOC, Incident Response, and Cybersecurity. Experienced in monitoring, alert triage, DFIR, and system defense through DEPI & ITI training and SOC projects. Passionate about securing digital environments.</p>
          <motion.div className={styles.socialIcon} variants={ITEM_VARIANTS}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="Linkedin" aria-label="LinkedIn profile"><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp chat"><FontAwesomeIcon icon={faWhatsapp} /></a>
            <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X" aria-label="X profile"><FontAwesomeIcon icon={faXTwitter} /></a>
          </motion.div>
          <motion.div className={styles.homeButton} variants={ITEM_VARIANTS}>
            <a href="#Contact" className={BTN_1_CLASS}>Hire Me <FontAwesomeIcon icon={faUserSecret} /></a>
            <a href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf" download className={BTN_2_CLASS}>Download CV <FontAwesomeIcon icon={faFilePdf} /></a>
            <a href="#Projects" className={`${styles.btn} ${styles.btn2}`}>View Projects <FontAwesomeIcon icon={faBriefcase} /></a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default SenseiHome;