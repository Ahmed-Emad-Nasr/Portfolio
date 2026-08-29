"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp, faYoutube, faInstagram, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFilePdf, faBriefcase, faEnvelope, faShuffle } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/utils/utils";
import { YOUTUBE_CHANNEL_URL } from "@/app/core/config/youtube";

// REMOVED: CV_VARIANT was computed from Math.random() at module scope, written
// to localStorage on every load, and then never read by anything. Dead code
// that also risked a hydration mismatch.

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

/* The role ticker is animated with CSS `content:` inside @keyframes words.
   Text that only exists in a pseudo-element is NOT in the DOM: crawlers see
   an empty <h2> and screen readers announce nothing — right where the most
   important keywords on the page should be. Keeping the same strings here
   as a visually-hidden node puts them back in the markup without touching
   the visual effect. Keep this list in sync with @keyframes words. */
const ROLES = [
  "Information Security Engineer",
  "Cybersecurity Engineer",
  "SOC/DFIR Engineer",
  "Malware Analyst",
  "Cybersecurity Instructor",
] as const;

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const [failed, setFailed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* globals/sensei-home.module.css already contain a rule set that pauses
     every infinite loop in this section (.ringOuter, .ringInner, .badgeDot,
     the typing ticker, .speedLine, .particle) via
     `.home[data-in-view="false"]`. Nothing was ever setting that attribute,
     so all of it kept running for the whole session — including while the
     visitor is three sections down. This observer is the missing half.

     The attribute is written directly on the node instead of through state:
     toggling a class must not re-render a section this large, and the CSS
     is the only consumer. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.inView = entry.isIntersecting ? "true" : "false";
      },
      // Resume slightly before the hero is back on screen so the animations
      // are already running by the time it is visible.
      { rootMargin: "150px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    // The download itself is a native browser action (static file, no
    // network request from React), this just gives the click a moment
    // of visible feedback before the state resets.
    window.setTimeout(() => setIsDownloading(false), 1200);
  };

  return (
    <section ref={sectionRef} className={`${styles.home} noLine noBg`} id="Home" data-in-view="true">
      {/* Speed lines */}
      <div className={styles.bgLayer} aria-hidden="true">
        {SPEED_LINES.map((line, i) => (
          <span
            key={i}
            className={styles.speedLine}
            data-decorative="true"
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
            data-decorative="true"
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
      {/* role="img" without an accessible name is invalid, and aria-hidden
          cancels it anyway. Decoration only — aria-hidden alone is correct. */}
      <div className={styles.japaneseBg} aria-hidden="true">
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
      <div className={styles.scanlines} data-decorative="true" aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.homeImg}>
          {/* Hinomaru glow */}
          <div className={styles.hinomaru} aria-hidden="true">
            <div className={styles.hinomaruGlow} />
          </div>

          {/* Rotating rings */}
          <div className={styles.ringOuter} data-decorative="true" aria-hidden="true" />
          <div className={styles.ringInner} data-decorative="true" aria-hidden="true" />

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
            <span className={`${styles.hudLine} ${styles.hudAccent}`}>Ahmed Emad Nasr</span>
          </div>

          {/* The handler opens a YouTube video, not another photo. A control
              that does something other than what its label says is a liability
              on a page a recruiter is reading — label now matches behaviour. */}
          <button
            type="button"
            className={styles.imageButton}
            onClick={handleImageClick}
            aria-label="Watch Ahmed's YouTube channel"
          >
            {/* LCP element. It carried `loading="lazy"`, which told the browser
                to defer the one image the score is measured against, while
                layout.tsx preloaded a DIFFERENT file. `priority` emits the
                correct preload automatically — the manual <link> can go. */}
            <Image
              src={failed ? "/Assets/art-gallery/Images/logo/My_Logo.webp" : "Assets/art-gallery/Images/logo/3omda.webp"}
              alt="Ahmed Emad Nasr, SOC Analyst"
              className={styles.image}
              width={560}
              height={560}
              sizes="(max-width: 968px) 80vw, 560px"
              priority
              fetchPriority="high"
              decoding="async"
              onError={() => setFailed(true)}
            />
            <span className={styles.imageHint} aria-hidden="true">
              <FontAwesomeIcon icon={faShuffle} />
              <span>Watch channel</span>
            </span>
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
            <span className={styles.roleStatic}>{ROLES.join(" · ")}</span>
            <span className={styles.typingHighlight} aria-hidden="true" />
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
                <span>Blue Team Operator</span>
              </div>
              <div className={styles.specItem}>
                <span>Tools</span>
                <span>SIEM, EDR, XDR, SOAR</span>
              </div>
              <div className={styles.specItem}>
                <span>Focus</span>
                <span>MITRE , NIST 800-61</span>
              </div>
            </div>
          </div>

          <p className={styles.tagline}>
            Computer Science graduate with hands-on experience as a SOC Analyst and Blue Team
            Operator across 10+ SOC training programs and 200+ simulated alerts (DEPI, ITI, projects).
            Cybersecurity professional specialized in Incident Response, SOC operations, and Digital Forensics. Experienced in SIEM tuning (Wazuh, ELK, Splunk), threat detection, and penetration testing across internship and lab environments.
          </p>

          {/* FIX: كل من page.tsx و layout.tsx فيهم JSON-LD بيشاور على "#Contact"،
              وماكانش فيه أي عنصر بالـ id ده في الموقع كله. ده مكان بيانات
              التواصل فعلياً — الإضافة دي id بس، مفيش أي path اتغير. */}
          <div id="Contact" className={styles.socialIcon}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" className={styles.iconLinkedin} aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="https://wa.me/201013972690" target="_blank" rel="noopener noreferrer" className={styles.iconWhatsapp} aria-label="WhatsApp">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={styles.iconYoutube} aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="https://www.instagram.com/ahmed_emad_nasr/" target="_blank" rel="noopener noreferrer" className={styles.iconInstagram} aria-label="Instagram">
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
              className={`${styles.btn} ${styles.cvBtn} ${isDownloading ? styles.btnLoading : ""}`}
              onClick={handleDownloadClick}
              aria-live="polite"
            >
              {isDownloading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Downloading…
                </>
              ) : (
                <>
                  Download CV <FontAwesomeIcon icon={faFilePdf} />
                </>
              )}
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
      <div className={styles.quote} aria-hidden="true">
        <div className={styles.quoteRule} />
        <p className={styles.quoteText}>備えあれば憂いなし — READINESS LEAVES NO ROOM FOR FEAR</p>
      </div>
    </section>
  );
});

export default SenseiHome;