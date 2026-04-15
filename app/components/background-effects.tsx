"use client";
import React, { useEffect, useRef } from 'react';
import styles from './background-effects.module.css';

const NUM_BUBBLES = 16;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function BackgroundEffects() {
  const meteorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Animate meteors
    meteorRefs.current.forEach((meteor, i) => {
      if (!meteor) return;
      const animate = () => {
        meteor.style.transition = 'none';
        meteor.style.top = `${random(0, 80)}vh`;
        meteor.style.left = `-${random(10, 30)}vw`;
        meteor.style.opacity = '0';
        setTimeout(() => {
          meteor.style.transition = 'all 1.2s linear';
          meteor.style.top = `${random(0, 80)}vh`;
          meteor.style.left = `${random(100, 120)}vw`;
          meteor.style.opacity = '0.3';
        }, 50);
        setTimeout(animate, random(2500, 5000));
      };
      setTimeout(animate, random(1000, 4000));
    });
  }, []);

  return (
    <div className={styles.bgEffects} aria-hidden="true">
      {/* Bubbles - أكبر وحمراء */}
      {Array.from({ length: NUM_BUBBLES }).map((_, i) => {
        const angle = random(-30, 30);
        const translateX = Math.tan((angle * Math.PI) / 180) * 100;
        const startLeft = random(0, 100);
        const size = random(44, 96); // فقاعات أكبر
        const duration = random(12, 28);
        const delay = random(0, 14);
        const opacity = random(0.10, 0.22);
        return (
          <div
            key={`bubble-${i}`}
            className={styles.bubble}
            style={{
              left: `${startLeft}vw`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              '--bubble-x': `${translateX}vw`,
              '--bubble-main': 'var(--main-red, #e53935)', // متغير لون الموقع أو fallback
            } as React.CSSProperties}
          />
        );
      })}

    </div>
  );
}
