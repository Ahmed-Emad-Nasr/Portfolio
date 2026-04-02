"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { trackEvent } from "@/app/core/utils/analytics";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type ServiceActionsProps = {
  slug: string;
};

const ctaBySlug: Record<string, string> = {
  "soc-analysis": "Start SOC Review",
  "incident-response": "Plan Incident Response",
  "threat-hunting": "Start Threat Hunt",
  "siem-edr-implementation": "Plan SIEM or EDR Setup",
  "log-analysis-forensics": "Review Investigation Scope",
  vapt: "Schedule VAPT Scope Call",
  "training-awareness": "Plan Team Training",
  "malware-analysis": "Start Malware Analysis",
};

export default function ServiceActions({ slug }: ServiceActionsProps) {
  const primaryCtaLabel = ctaBySlug[slug] || "Discuss This Service";

  return (
    <div className={styles.actions}>
      <a
        className={styles.btnPrimary}
        href="/#Contact"
        onClick={() => {
          recordFunnelEvent("service_cta_click");
          trackEvent("service_book_call", { service: slug });
        }}
      >
        {primaryCtaLabel}
      </a>
      <Link
        className={styles.btnSecondary}
        href="/"
        onClick={() => trackEvent("service_back_to_portfolio", { service: slug })}
      >
        Back To Portfolio
      </Link>
      <p className={styles.trustLine}>Typical response window: within 24 hours. Delivery is structured and remote-friendly.</p>
    </div>
  );
}
