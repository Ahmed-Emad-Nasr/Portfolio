"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { trackEvent } from "@/app/core/utils/analytics";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

type ServiceActionsProps = {
  slug: string;
};

export default function ServiceActions({ slug }: ServiceActionsProps) {
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
        Discuss This Service
      </a>
      <Link
        className={styles.btnSecondary}
        href="/"
        onClick={() => trackEvent("service_back_to_portfolio", { service: slug })}
      >
        Back To Portfolio
      </Link>
    </div>
  );
}
