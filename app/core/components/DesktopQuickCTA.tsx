"use client";

import { memo, useState } from "react";
import styles from "./desktop-quick-cta.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faPhoneVolume, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const DesktopQuickCTA = memo(function DesktopQuickCTA() {
  const [isCallLocked, setIsCallLocked] = useState(false);

  const handleBookCallClick = () => {
    if (isCallLocked) {
      return;
    }

    setIsCallLocked(true);
    recordFunnelEvent("service_cta_click");
    window.setTimeout(() => setIsCallLocked(false), 1000);
  };

  return (
    <aside className={styles.wrap} aria-label="Quick actions">
      <a
        href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.btn} ${styles.primary}`}
        onClick={handleBookCallClick}
      >
        <FontAwesomeIcon icon={faPhoneVolume} />
        Book Call
      </a>
      <button
        type="button"
        className={`${styles.btn} ${styles.tertiary}`}
        onClick={scrollToTop}
      >
        <FontAwesomeIcon icon={faArrowUp} />
        Top
      </button>
      <a
        href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.btn} ${styles.secondary}`}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        Open CV
      </a>
    </aside>
  );
});

export default DesktopQuickCTA;
