"use client";
import { memo, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faUserSecret, faFilePdf, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import styles from "./sensei-home.module.css";
import { useRandomMedia } from "@/app/core/hooks/useRandomMedia";
import { aboutMeCards } from "@/app/core/data";

const SLIDE_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; // المصحح

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1, ease: SLIDE_EASE } },
};

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: SLIDE_EASE } },
};

const HEADER_INITIAL     = { opacity: 0, y: -30 } as const;
const HEADER_ANIMATE_IN  = { opacity: 1, y: 0 }   as const;
const HEADER_ANIMATE_OUT = {}                      as const;
const HEADER_TRANSITION  = { duration: 0.3, ease: SLIDE_EASE } as const;

const ICON_ANIMATE    = { rotate: 0 }   as const;
const ICON_HOVER      = { rotate: 360 } as const;
const ICON_TRANSITION = { duration: 0.3, ease: "easeOut" } as const;

const BTN_1_CLASS = `${styles.btn} ${styles.btn1}`;
const BTN_2_CLASS = `${styles.btn} ${styles.btn2}`;

type AboutMeCardProps = { icon: string; title: string; description: string; index: number; };

const AboutMeCard = memo<AboutMeCardProps>(({ icon, title, description, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const variants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.05, ease: SLIDE_EASE } },
  }), [index]);

  return (
    <motion.div ref={ref} className={styles["about-me-card"]} initial="hidden" animate={inView ? "visible" : "hidden"} variants={variants}>
      <div className={styles["card-part-1"]}>
        <motion.i className={icon} animate={ICON_ANIMATE} whileHover={ICON_HOVER} transition={ICON_TRANSITION} />
        <h3 className={styles["card-title"]}>{title}</h3>
      </div>
      <div className={styles["card-part-2"]}>
        <p className={styles["card-description"]}>{description}</p>
      </div>
    </motion.div>
  );
});

AboutMeCard.displayName = "AboutMeCard";

const SenseiHome = memo(function SenseiHome() {
  const { handleImageClick } = useRandomMedia();
  const isAvailable = true; 
  const [containerRef, containerInView] = useInView({ triggerOnce: false, threshold: 0.1 });
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={styles.home} id="Home">
      <motion.div ref={containerRef} className={styles.container} initial="hidden" animate={containerInView ? "visible" : "hidden"} variants={CONTAINER_VARIANTS}>
        <motion.div className={styles.homeImg} variants={ITEM_VARIANTS}>
          <img src="Assets/art-gallery/Images/logo/My_Logo.webp" alt="Ahmed Emad Nasr Image" className={styles.image} width={350} height={350} fetchPriority="high" loading="lazy" decoding="async" onClick={handleImageClick} />
        </motion.div>

        <motion.div className={styles.homeContent} variants={ITEM_VARIANTS}>
          <h1><span className={styles.highlight}>Ahmed Emad Nasr</span></h1>
          <motion.div className={styles.availabilityStatus} variants={ITEM_VARIANTS}>
            <span className={`${styles.statusDot} ${isAvailable ? styles.dotAvailable : styles.dotUnavailable}`}></span>
            <span>{isAvailable ? "Available for Opportunities" : "Currently Unavailable"}</span>
          </motion.div>
          <h2 className={styles.typingText}><span className={styles.typingHighlight} /></h2>
          <p>Computer Science student at Benha University, specializing in SOC, Incident Response, and Cybersecurity. Experienced in monitoring, alert triage, DFIR, and system defense through DEPI & ITI training and SOC projects. Passionate about securing digital environments.</p>
          <motion.div className={styles.socialIcon} variants={ITEM_VARIANTS}>
            <a href="https://www.linkedin.com/in/ahmed-emad-nasr/" target="_blank" rel="noopener noreferrer" title="Linkedin"><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href="https://wa.me/201018166445" target="_blank" rel="noopener noreferrer" title="WhatsApp"><FontAwesomeIcon icon={faWhatsapp} /></a>
            <a href="https://x.com/0x3omda" target="_blank" rel="noopener noreferrer" title="X"><FontAwesomeIcon icon={faXTwitter} /></a>
          </motion.div>
          <motion.div className={styles.homeButton} variants={ITEM_VARIANTS}>
            <a href="#Contact" className={BTN_1_CLASS}>Hire Me <FontAwesomeIcon icon={faUserSecret} /></a>
            <a href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf" download className={BTN_2_CLASS}>Download CV <FontAwesomeIcon icon={faFilePdf} /></a>
            <a href="#Projects" className={`${styles.btn} ${styles.btn3}`}>View Projects <FontAwesomeIcon icon={faBriefcase} /></a>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className={styles["about-me-section"]}>
        <motion.div ref={headerRef} className={styles["about-me-header"]} initial={HEADER_INITIAL} animate={headerInView ? HEADER_ANIMATE_IN : HEADER_ANIMATE_OUT} transition={HEADER_TRANSITION}>
          <h2 className={styles["about-me-title"]}><span lang="ja">自己紹介 •</span><span lang="en"> About Me</span></h2>
        </motion.div>
        <div className={styles["about-me-grid"]}>
          {aboutMeCards.map((card, index) => (
            <AboutMeCard key={`${card.title}-${index}`} {...card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default SenseiHome;