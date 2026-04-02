"use client";

import { memo } from "react";
import styles from "./social-proof-section.module.css";
import { trackEvent } from "@/app/core/utils/analytics";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Ahmed combines clear threat analysis with practical action plans. His incident response support reduced our alert confusion and improved triage speed.",
    name: "Security Team Lead",
    role: "Managed Detection & Response",
  },
  {
    quote:
      "His communication style is straightforward and reliable. Reports were structured, useful, and easy for both technical and non-technical stakeholders.",
    name: "IT Operations Manager",
    role: "Enterprise Infrastructure",
  },
  {
    quote:
      "Professional, detail-oriented, and fast. Ahmed helped us strengthen monitoring workflows and improve daily SOC operations quality.",
    name: "Blue Team Supervisor",
    role: "Cyber Defense Unit",
  },
];

const SocialProofSection = memo(function SocialProofSection() {
  return (
    <section className={styles.section} id="Testimonials">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>Trusted By Teams That Prioritize Security</h2>
          <p className={styles.subtitle}>
            Real feedback from professionals who collaborated with me on SOC operations, incident response, and security improvement initiatives.
          </p>
        </header>

        <div className={styles.grid}>
          {testimonials.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className={styles.card}
              onMouseEnter={() => trackEvent("social_proof_hover", { card_index: index + 1 })}
            >
              <p className={styles.quote}>
                <span aria-hidden="true">&ldquo;</span>
                {item.quote}
                <span aria-hidden="true">&rdquo;</span>
              </p>
              <div className={styles.person}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.role}>{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});

export default SocialProofSection;
