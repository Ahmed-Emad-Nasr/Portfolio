"use client";

/*
 * File: sensei-services-projects.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render services section cards with scroll-based reveal animations
 */

import { memo } from "react";
import Link from "next/link";
import styles from "./sensei-services-projects.module.css";
import { toBulletItems } from "@/app/core/utils/bulletUtils";
import MotionInView from "@/app/core/components/MotionInView";
import { serviceCatalog } from "@/app/core/data";
import { trackEvent } from "@/app/core/utils/analytics";
import { recordFunnelEvent } from "@/app/core/utils/engagement";

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

type ServiceItemProps = {
  icon: string;
  title: string;
  description: string;
  outcome: string;
  from: string;
  slug: string;
};

const ServiceItem = memo<ServiceItemProps>(({ icon, title, description, outcome, from, slug }) => {
  const descriptionBullets = toBulletItems(description);

  return (
    <div className={styles["single-service"]}>
      <div className={styles["part-1"]}>
        <i className={icon} aria-hidden="true" />
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles["part-2"]}>
        <ul className={styles["description-list"]}>
          {descriptionBullets.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
        <div className={styles.serviceMetaRow}>
          <span className={styles.outcomeTag}>Deliverable: {outcome}</span>
          <span className={styles.priceTag}>From {from}</span>
        </div>
        <Link
          href={`/services/${slug}`}
          className={styles.detailsBtn}
          onClick={() => {
            trackEvent("service_card_open", { service: slug });
            recordFunnelEvent("service_cta_click");
          }}
        >
          View Service Details
        </Link>
      </div>
    </div>
  );
});

ServiceItem.displayName = "ServiceItem";

function SenseiServicesProjects() {
  return (
    <section className={styles["section-services"]} id="Services">
      <div className={styles.container}>
        <MotionInView
          className={styles["header-section"]}
          variants={sectionVariants}
        >
          <h2 className={styles.title}><span lang="ja">事業 •</span><span lang="en"> Services</span></h2>
          <p className={styles.sectionLead}>Clear service paths, measurable outcomes, and direct next steps.</p>
        </MotionInView>
        <div className={styles["grid-container"]}>
          {serviceCatalog.length > 0 ? (
            serviceCatalog.map((service, index) => (
              <MotionInView
                key={service.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.16) }}
                threshold={0.08}
                triggerOnce
              >
                <ServiceItem {...service} />
              </MotionInView>
            ))
          ) : (
            <div className={styles.emptyState} aria-live="polite">
              <p>No services are available right now.</p>
              <span className={styles.emptyStateHint}>Please check back shortly.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(SenseiServicesProjects);