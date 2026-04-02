"use client";

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneVolume, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import styles from "./mobile-quick-actions.module.css";
import { trackEvent } from "@/app/core/utils/analytics";

const MobileQuickActions = memo(function MobileQuickActions() {
  return (
    <div className={styles.wrap}>
      <a
        href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
        className={`${styles.btn} ${styles.primary}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book a quick call on WhatsApp"
        onClick={() => trackEvent("cta_click", { source: "mobile_quick_actions", action: "book_call", destination: "whatsapp" })}
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
        CV
      </a>
    </div>
  );
});

export default MobileQuickActions;
