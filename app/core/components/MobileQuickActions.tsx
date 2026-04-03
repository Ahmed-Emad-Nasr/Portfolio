"use client";

import { memo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faPhoneVolume, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import styles from "./mobile-quick-actions.module.css";
import { trackEvent } from "@/app/core/utils/analytics";

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
    trackEvent("cta_click", { source: "mobile_quick_actions", action: "book_call", destination: "whatsapp" });
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
        href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
        className={`${styles.btn} ${styles.secondary}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open CV PDF"
        onClick={() => trackEvent("cta_click", { source: "mobile_quick_actions", action: "download_cv", destination: "cv_pdf" })}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        Open CV
      </a>
      <button
        type="button"
        className={`${styles.btn} ${styles.tertiary}`}
        aria-label="Scroll to top"
        onClick={() => {
          trackEvent("cta_click", { source: "mobile_quick_actions", action: "scroll_top", destination: "page_top" });
          scrollToTop();
        }}
      >
        <FontAwesomeIcon icon={faArrowUp} />
        Top
      </button>
    </div>
  );
});

export default MobileQuickActions;
