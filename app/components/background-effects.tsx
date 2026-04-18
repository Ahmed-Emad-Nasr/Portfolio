"use client";

/*
 * File: background-effects.tsx
 * Purpose: Render ambient glows and JS-driven particles strictly capped at 60 FPS.
 * Optimized: DOM manipulation via Refs (No React Re-renders).
 */

import React, { useEffect, useRef, memo } from 'react';
import styles from './background-effects.module.css';

const BackgroundEffects = memo(function BackgroundEffects() {
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([]);
  const meteorsRef = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number | null>(null);

  // إعدادات الفقاعات (نفس مدد التأخير والمدة من كود الـ CSS القديم بالمللي ثانية)
  const bubblesData = [
    { duration: 12000, delay: 0 },
    { duration: 18000, delay: 4000 },
    { duration: 14000, delay: 2000 },
    { duration: 22000, delay: 7000 },
    { duration: 16000, delay: 1000 },
    { duration: 19000, delay: 5000 },
    { duration: 20000, delay: 8000 },
    { duration: 15000, delay: 3000 },
  ];

  // إعدادات النيازك
  const meteorsData = [
    { duration: 8000, delay: 0 },
    { duration: 12000, delay: 3000 },
    { duration: 9000, delay: 5000 },
    { duration: 14000, delay: 1000 },
    { duration: 10000, delay: 7000 },
  ];

  useEffect(() => {
    // إيقاف التحديثات للأجهزة المحمولة لتوفير البطارية (متطابق مع Media Query)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    let lastTime = performance.now();
    const startTime = performance.now();
    const fpsInterval = 1000 / 60; // قفل الإطارات على 60 FPS

    const animate = (currentTime: number) => {
      requestRef.current = requestAnimationFrame(animate);

      const elapsed = currentTime - lastTime;

      // تطبيق التحديثات فقط إذا تجاوز الوقت 16.67 مللي ثانية
      if (elapsed > fpsInterval) {
        lastTime = currentTime - (elapsed % fpsInterval);
        const totalElapsed = currentTime - startTime;

        // 1. حساب وتحريك الفقاعات
        bubblesRef.current.forEach((el, index) => {
          if (!el) return;
          const { duration, delay } = bubblesData[index];
          if (totalElapsed < delay) return; // انتظار وقت الـ Delay

          const activeTime = (totalElapsed - delay) % duration;
          const progress = activeTime / duration; // النسبة من 0 إلى 1

          const y = progress * -110; // الصعود إلى -110vh
          const scale = 0.8 + (0.4 * progress); // محاكاة scale(0.8) إلى scale(1.2)

          let opacity = 0.8;
          if (progress < 0.1) {
            opacity = (progress / 0.1) * 0.8; // ظهور تدريجي
          } else if (progress > 0.9) {
            opacity = ((1 - progress) / 0.1) * 0.8; // اختفاء تدريجي
          }

          el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
          el.style.opacity = opacity.toFixed(3);
        });

        // 2. حساب وتحريك النيازك
        meteorsRef.current.forEach((el, index) => {
          if (!el) return;
          const { duration, delay } = meteorsData[index];
          if (totalElapsed < delay) return;

          const activeTime = (totalElapsed - delay) % duration;
          const progress = activeTime / duration;

          let y = 0;
          let opacity = 0;

          // النيزك يتحرك فقط في أول 15% من مدته
          if (progress <= 0.15) {
            const moveProgress = progress / 0.15;
            y = moveProgress * 120; // النزول إلى 120vh

            if (progress <= 0.05) {
              opacity = (progress / 0.05) * 0.8;
            } else {
              opacity = 0.8 - ((progress - 0.05) / 0.1) * 0.8;
            }
          }

          el.style.transform = `translate3d(0, ${y}vh, 0)`;
          el.style.opacity = opacity.toFixed(3);
        });
      }
    };

    // تشغيل الـ Loop
    requestRef.current = requestAnimationFrame(animate);

    // تنظيف الـ Memory Leak عند تدمير المكون
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [bubblesData, meteorsData]);

  return (
    <div className={styles.bgEffects} aria-hidden="true">
      {/* 1. Static Ambient Glows */}
      <div className={`${styles.glowOrb} ${styles.orb1}`} />
      <div className={`${styles.glowOrb} ${styles.orb2}`} />
      <div className={`${styles.glowOrb} ${styles.orb3}`} />

      {/* 2. Floating Cyber Bubbles */}
      <div className={styles.particles}>
        {bubblesData.map((_, i) => (
          <div
            key={`bubble-${i}`}
            ref={(el) => { bubblesRef.current[i] = el; }}
            className={`${styles.bubble} ${styles[`bubble${i + 1}`]}`}
          />
        ))}
      </div>

      {/* 3. Cyber Meteorites */}
      <div className={styles.meteors}>
        {meteorsData.map((_, i) => (
          <div
            key={`meteor-${i}`}
            ref={(el) => { meteorsRef.current[i] = el; }}
            className={`${styles.meteor} ${styles[`meteor${i + 1}`]}`}
          />
        ))}
      </div>
    </div>
  );
});

export default BackgroundEffects;