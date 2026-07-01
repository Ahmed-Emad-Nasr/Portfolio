"use client";
import React from "react";
import styles from "../page.module.css";

import { useEffect, useState } from "react";

type HeroProps = {
  totalCasesCount: number;
  totalScreenshotsCount: number;
  featuredWriteupsCount?: number;
  synonyms?: string[];
};

export default function BlogHeroSection({ totalCasesCount, totalScreenshotsCount, featuredWriteupsCount = 0, synonyms = ["DFIR","Writeups","Analyses"] }: HeroProps) {
  const [synIndex, setSynIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSynIndex((i) => (i + 1) % synonyms.length), 2800);
    return () => clearInterval(t);
  }, [synonyms.length]);
  return (
    <header className={styles.blogHero} role="region" aria-labelledby="blog-hero-title">
      <div className={styles.blogHeroInner}>
        <div className={styles.blogHeroContent}>
          <h1 id="blog-hero-title" className={styles.blogHeroTitle}>SOC Reports & Cybersecurity Writeups</h1>
          <p className={styles.blogHeroSubtitle}>Deep-dive incident response reports, DFIR investigations, and malware analysis — practical notes, tools, and screenshots.</p>
          <div className={styles.blogHeroCtas}>
            <a href="#blog-pdfs-title" className={styles.primaryAction}>Browse Cases</a>
            <a href="#" className={styles.secondaryAction}>Subscribe</a>
          </div>
        </div>
        <div className={styles.blogHeroStats} aria-hidden="false">
          <div className={styles.heroStat}><strong>{totalCasesCount}</strong><span>Cases</span></div>
          <div className={styles.heroStat}><strong>{totalScreenshotsCount}</strong><span>Screenshots</span></div>
          <div className={styles.heroStat} aria-label="featured writeups count"><strong>{featuredWriteupsCount > 0 ? featuredWriteupsCount : "—"}</strong><span>{synonyms[synIndex]}</span></div>
        </div>
      </div>
    </header>
  );
}
