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

// Precomputed so the decorative layers render the same on server and client
const SPEED_LINES = Array.from({ length: 8 }, (_, i) => ({
  top: 15 + i * 10,
  width: 40 + i * 8,
  rotate: -2 + i * 0.5,
  delay: 1.1 + i * 0.05,
}));

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: 10 + ((i * 7) % 80),
  top: 5 + ((i * 13) % 90),
  duration: 3 + (i % 4),
  delay: i * 0.3,
}));

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const [failed, setFailed] = useState(false);

  return (
    <section className={`${styles.home} noLine noBg`} id="Home">
      {/* Speed lines */}
      <div className={styles.bgLayer} aria-hidden="true">
        {SPEED_LINES.map((line, i) => (
          <span
            key={i}
            className={styles.speedLine}
            style={{
              top: `${line.top}%`,
              width: `${line.width}%`,
              transform: `rotate(${line.rotate}deg)`,
              animationDelay: `${line.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className={styles.bgLayer} aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Kanji watermark */}
      <div className={styles.japaneseBg} aria-hidden="true" role="img">
        <div className={styles.vertical}>
          <span>セ</span>
          <span>キ</span>
          <span>ュ</span>
          <span>リ</span>
          <span>ティ</span>
        </div>
        <div className={styles.vertical}>
          <span>盾</span>
        </div>
      </div>

      {/* Scanline overlay */}
      <div className={styles.scanlines} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.homeImg}>
          {/* Hinomaru glow */}
          <div className={styles.hinomaru} aria-hidden="true">
            <div className={styles.hinomaruGlow} />
          </div>

          {/* Rotating rings */}
          <div className={styles.ringOuter} aria-hidden="true" />
          <div className={styles.ringInner} aria-hidden="true" />

          {/* Viewfinder corners */}
          <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

          {/* HUD overlay text */}
          <div className={styles.hudTop} aria-hidden="true">
            <span className={`${styles.hudLine} ${styles.hudMain}`}>MONITORING ●</span>
            <span className={`${styles.hudLine} ${styles.hudDim}`}>SOC-01</span>
          </div>
          <div className={styles.hudBottom} aria-hidden="true">
            <span className={`${styles.hudLine} ${styles.hudDim}`}>SIEM / EDR</span>
            <span className={`${styles.hudLine} ${styles.hudAccent}`}>ブルーチーム</span>
          </div>

          <button type="button" className={styles.imageButton} onClick={handleImageClick}>
            <Image
              src={failed ? "/Assets/art-gallery/Images/logo/My_Logo.webp" : "Assets/art-gallery/Images/logo/3omda.webp"}
              alt="Ahmed Emad Nasr"
              className={styles.image}
              width={420}
              height={420}
              sizes="(max-width: 968px) 80vw, 420px"
              quality={60}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          </button>

          <div className={styles.ringDashed} aria-hidden="true" />
        </div>

        <div className={styles.homeContent}>
          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>セキュリティ・アナリスト</span>
          </div>

          {/* Massive name */}
          <h1>
            <span>Ahmed</span>
            <span className={styles.highlight}>Emad Nasr</span>
          </h1>

          {/* Typing role ticker */}
          <h2 className={styles.typingText}>
            <span className={styles.typingHighlight} />
          </h2>

          {/* Spec sheet */}
          <div className={styles.specSheet}>
            <div className={styles.specHeader}>
              <span className={styles.specHeaderDot} />
              <span className={styles.specHeaderLabel}>Analyst Specifications</span>
            </div>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span>Role</span>
                <span>SOC Analyst</span>
              </div>
              <div className={styles.specItem}>
                <span>Tools</span>
                <span>SIEM, EDR</span>
              </div>
              <div className={styles.specItem}>
                <span>Focus</span>
                <span>IR Lifecycle</span>
              </div>
            </div>
          </div>

          <p className={styles.tagline}>
            Computer Science graduate with hands-on experience as a SOC Analyst and Blue Team
            Operator across 10+ SOC training programs and 200+ simulated alerts (DEPI, ITI, projects).
          </p>
          <p>
            Skilled in monitoring, detection, SIEM/EDR investigations, alert triage, IOC analysis,
            and log analysis across the incident response lifecycle.
          </p>

          <div className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" className={styles.iconLinkedin} aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" className={styles.iconWhatsapp} aria-label="WhatsApp">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={styles.iconYoutube} aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="https://www.instagram.com/0x3omda/" target="_blank" rel="noopener noreferrer" className={styles.iconInstagram} aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://github.com/Ahmed-Emad-Nasr" target="_blank" rel="noopener noreferrer" className={styles.iconGithub} aria-label="GitHub">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>

          <div className={styles.homeButton}>
            <a
              href="Assets/cv/AhmedEmadNasr_CV.pdf"
              download="AhmedEmadNasr_CV.pdf"
              className={`${styles.btn} ${styles.cvBtn}`}
            >
              Download CV <FontAwesomeIcon icon={faFilePdf} />
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

      {/* Bottom proverb */}
      <div className={styles.quote} aria-hidden="true" role="img">
        <div className={styles.quoteRule} />
        <p className={styles.quoteText}>備えあれば憂いなし — READINESS LEAVES NO ROOM FOR FEAR</p>
      </div>
    </section>
  );
});

export default SenseiHome;