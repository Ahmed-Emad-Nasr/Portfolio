"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp, faYoutube, faInstagram, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFilePdf, faBriefcase, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { YOUTUBE_CHANNEL_URL } from "@/app/core/data/youtube";

// تحديد نسخة السيرة الذاتية (A/B Testing) بسرعة بدون Re-renders
const CV_VARIANT = typeof window !== "undefined" 
  ? (localStorage.getItem("cv_var") || (Math.random() < 0.5 ? "A" : "B")) 
  : "A";
if (typeof window !== "undefined") localStorage.setItem("cv_var", CV_VARIANT);

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const [failed, setFailed] = useState(false);

  return (
    <section className={`${styles.home} noLine noBg`} id="Home">
      <div className={styles.container}>
        <div className={styles.homeImg}>
          <button type="button" className={styles.imageButton} onClick={handleImageClick}>
            <Image
              src={failed ? "/Assets/art-gallery/Images/logo/My_Logo.webp" : "Assets/art-gallery/Images/logo/3omda.webp"}
              alt="Ahmed Emad Nasr"
              className={styles.image}
              width={450}
              height={450}
              sizes="(max-width: 968px) 80vw, 350px"
              quality={75}
              priority
              onError={() => setFailed(true)}
            />
          </button>
        </div>

        <div className={styles.homeContent}>
          <h1><span className={styles.highlight}>Ahmed Emad Nasr</span></h1>
          
          <h2 className={styles.typingText}>
            <span className={styles.typingHighlight} />
          </h2>

          <p>
            Computer Science graduate with hands-on experience as a SOC Analyst and Blue Team Operator
            across 10+ SOC training programs and 200+ simulated alerts (DEPI, ITI, projects). Skilled in
            monitoring, detection, SIEM/EDR investigations, alert triage, IOC analysis, log analysis across
            IR lifecycle.
          </p>

          <div className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank"><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href="https://wa.me/201018166445" target="_blank"><FontAwesomeIcon icon={faWhatsapp} /></a>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank"><FontAwesomeIcon icon={faYoutube} /></a>
            <a href="https://www.instagram.com/0x3omda/" target="_blank"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://github.com/Ahmed-Emad-Nasr" target="_blank"><FontAwesomeIcon icon={faGithub} /></a>
          </div>

          <div className={styles.homeButton}>
            <a href="Assets/cv/AhmedEmadNasr_CV.pdf" download="AhmedEmadNasr_CV.pdf" className={`${styles.btn} ${styles.cvBtn} ${CV_VARIANT === "B" ? styles.cvBtnAlt : ""}`}>
              {CV_VARIANT === "A" ? "Download CV" : "Get My CV"} <FontAwesomeIcon icon={faFilePdf} />
            </a>
            <a href="#Projects" className={`${styles.btn} ${styles.btnProjects}`}>
              View Projects <FontAwesomeIcon icon={faBriefcase} />
            </a>
            <a href="mailto:ahmed.em.nasr@gmail.com" className={`${styles.btn} ${styles.btnEmail}`}>
              Email Me <FontAwesomeIcon icon={faEnvelope} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;