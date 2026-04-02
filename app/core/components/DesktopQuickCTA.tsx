"use client";

import { memo } from "react";
import styles from "./desktop-quick-cta.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneVolume, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { trackEvent } from "@/app/core/utils/analytics";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

const DesktopQuickCTA = memo(function DesktopQuickCTA() {
  return (
    <aside className={styles.wrap} aria-label="Quick actions">
      <a
        href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.btn} ${styles.primary}`}
        onClick={() => {
          trackEvent("cta_click", { source: "desktop_quick_cta", action: "book_call", destination: "whatsapp" });
          recordFunnelEvent("service_cta_click");
        }}
      >
        <FontAwesomeIcon icon={faPhoneVolume} />
        Book Call
      </a>
      <a
        href="Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.btn} ${styles.secondary}`}
        onClick={() => trackEvent("cta_click", { source: "desktop_quick_cta", action: "open_cv", destination: "cv_pdf" })}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        Open CV
      </a>
    </aside>
  );
});

export default DesktopQuickCTA;
