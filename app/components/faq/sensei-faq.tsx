"use client";

import { memo } from "react";
import styles from "./sensei-faq.module.css";
import SectionHeader from "@/app/core/components/SectionHeader";
import MotionInView from "@/app/core/components/MotionInView";
import { faqItems } from "@/app/core/data";

const SenseiFaq = memo(function SenseiFaq() {
  return (
    <section className={styles.section} id="FAQ">
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <SectionHeader japaneseText="質問" englishText="FAQ" titleClassName={styles.title} />
          <p className={styles.lead}>Clear answers for scope, delivery, and collaboration before we start.</p>
        </div>

        <div className={styles.grid}>
          {faqItems.map((item, index) => (
            <MotionInView
              key={`${item.q}-${index}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: Math.min(index * 0.03, 0.15) }}
              threshold={0.12}
              triggerOnce
            >
              <article className={styles.card}>
                <span className={styles.category}>{item.category}</span>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            </MotionInView>
          ))}
        </div>
      </div>
    </section>
  );
});

export default SenseiFaq;
