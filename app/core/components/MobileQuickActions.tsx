"use client";

import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import styles from "./mobile-quick-actions.module.css";
import { trackEvent } from "@/app/core/utils/analytics";

const MobileQuickActions = memo(function MobileQuickActions() {
  return (
    <div className={styles.wrap}>
      <a
        href="#Contact"
        className={`${styles.btn} ${styles.primary}`}
        onClick={() => trackEvent("cta_click", { source: "mobile_quick_actions", action: "contact", destination: "#Contact" })}
      >
        <FontAwesomeIcon icon={faEnvelope} />
        Contact
      </a>
      <a
        href="/Assets/cv/AhmedEmad_SOCAnalyst_CV.pdf"
        download
        className={`${styles.btn} ${styles.secondary}`}
        onClick={() => trackEvent("cta_click", { source: "mobile_quick_actions", action: "download_cv", destination: "cv_pdf" })}
      >
        <FontAwesomeIcon icon={faFilePdf} />
        CV
      </a>
    </div>
  );
});

export default MobileQuickActions;
