"use client";

/*
 * File: background-effects.tsx
 * Purpose: Render lightweight static ambient glows, floating particles (bubbles), and cyber meteorites.
 * Optimized: 100% CSS-driven, GPU-accelerated (translate3d), 0% JS rendering cost.
 */

import React, { memo } from 'react';
import styles from './background-effects.module.css';

const BackgroundEffects = memo(function BackgroundEffects() {
  return (
    <div className={styles.bgEffects} aria-hidden="true">
      {/* 1. Static Ambient Glows (Performance: High) */}
      <div className={`${styles.glowOrb} ${styles.orb1}`} />
      <div className={`${styles.glowOrb} ${styles.orb2}`} />
      <div className={`${styles.glowOrb} ${styles.orb3}`} />

      {/* 2. Floating Cyber Bubbles (Data Particles) */}
      <div className={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <div key={`bubble-${i}`} className={`${styles.bubble} ${styles[`bubble${i + 1}`]}`} />
        ))}
      </div>

      {/* 3. Cyber Meteorites (Shooting Streams) */}
      <div className={styles.meteors}>
        {[...Array(5)].map((_, i) => (
          <div key={`meteor-${i}`} className={`${styles.meteor} ${styles[`meteor${i + 1}`]}`} />
        ))}
      </div>
    </div>
  );
});

export default BackgroundEffects;