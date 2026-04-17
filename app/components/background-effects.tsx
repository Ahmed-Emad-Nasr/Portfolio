"use client";

/*
 * File: background-effects.tsx
 * Purpose: Render lightweight static ambient glows for the background.
 * Optimized: Removed heavy JS loops, memory leaks, and animated blur filters.
 */

import React from 'react';
import styles from './background-effects.module.css';

export default function BackgroundEffects() {
  // لا يوجد حاجة لأي JavaScript أو State معقدة هنا
  // يتم الاعتماد بالكامل على CSS خفيف جداً
  
  return (
    <div className={styles.bgEffects} aria-hidden="true">
      <div className={`${styles.glowOrb} ${styles.orb1}`} />
      <div className={`${styles.glowOrb} ${styles.orb2}`} />
      <div className={`${styles.glowOrb} ${styles.orb3}`} />
    </div>
  );
}