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
        <div className={styles["header-section"]}>
          <h2 className={styles.title}><span lang="ja">事業 •</span><span lang="en"> Services</span></h2>
        </div>
        <div className={styles["grid-container"]}>
          {serviceCatalog.map((service, index) => (
            <MotionInView
              key={service.slug}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: Math.min(index * 0.025, 0.1) }}
              threshold={0.12}
              triggerOnce
            >
              <ServiceItem {...service} />
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(SenseiServicesProjects);