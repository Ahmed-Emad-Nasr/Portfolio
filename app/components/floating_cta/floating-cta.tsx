"use client";

/*
 * File: floating-cta.tsx
 * Purpose: Persistent floating command CTA with quick actions
 */

import styles from "./floating-cta.module.css";
import { trackEvent } from "@/app/core/utils/analytics";

export default function FloatingCTA() {
  return (
    <div className={styles.palette} role="region" aria-label="Quick actions">
      <a
        href="#Contact"
        className={styles.primaryAction}
        onClick={() => trackEvent("cta_click", { source: "floating_cta", action: "hire", destination: "#Contact" })}
      >
        Hire
      </a>
      <a
        href="#Projects"
        className={styles.secondaryAction}
        onClick={() => trackEvent("cta_click", { source: "floating_cta", action: "collaborate", destination: "#Projects" })}
      >
        Collaborate
      </a>
      <a
        href="https://wa.me/201018166445?text=Hi%20Ahmed%2C%20I%20want%20to%20book%20a%20quick%20security%20call."
        target="_blank"
        rel="noopener noreferrer"
        className={styles.secondaryAction}
        onClick={() => trackEvent("cta_click", { source: "floating_cta", action: "book_call", destination: "whatsapp" })}
      >
        Book Call
      </a>
    </div>
  );
}
