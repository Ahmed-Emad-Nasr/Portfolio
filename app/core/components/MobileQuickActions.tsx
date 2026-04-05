"use client";

import { memo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faPhoneVolume, faFilePdf, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import styles from "./mobile-quick-actions.module.css";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const MobileQuickActions = memo(function MobileQuickActions() {
  const [isCallLocked, setIsCallLocked] = useState(false);

  const handleBookCallClick = () => {
    if (isCallLocked) {
      return;
    }

    setIsCallLocked(true);
    window.setTimeout(() => setIsCallLocked(false), 1000);
  };

  return (
    <div className={styles.wrap}>
      <a
        href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
        className={`${styles.btn} ${styles.primary}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book a quick call on WhatsApp"
        onClick={handleBookCallClick}
      >
        <FontAwesomeIcon icon={faPhoneVolume} />
        Book Call
      </a>
      <a
        href="Assets/cv/AhmedEmadNasr_CV.pdf"
        className={`${styles.btn} ${styles.secondary}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open CV PDF"
      >
        <FontAwesomeIcon icon={faFilePdf} />
        Open CV
      </a>
      <a
        href="/Portfolio/blog"
        className={`${styles.btn} ${styles.tertiary}`}
        aria-label="Open blog page"
      >
        <FontAwesomeIcon icon={faBookOpen} />
        Blog
      </a>
      <button
        type="button"
        className={`${styles.btn} ${styles.tertiary}`}
        aria-label="Scroll to top"
        onClick={scrollToTop}
      >
        <FontAwesomeIcon icon={faArrowUp} />
        Top
      </button>
    </div>
  );
});

export default MobileQuickActions;
