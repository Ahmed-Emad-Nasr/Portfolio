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
    // Animate meteors - أول دورة بدون delay
    meteorRefs.current.forEach((meteor, i) => {
      if (!meteor) return;
      const animate = (first = false) => {
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
        setTimeout(() => animate(false), random(2500, 5000));
      };
      // أول دورة بدون أي delay
      animate(true);
    });
  }, []);

  // --- فقاعات: أول دورة بدون delay ---
  const bubbleParams = useRef<{angle:number,translateX:number,startLeft:number,size:number,duration:number,delay:number,opacity:number}[]>([]);
  if (bubbleParams.current.length !== NUM_BUBBLES) {
    bubbleParams.current = Array.from({ length: NUM_BUBBLES }).map(() => {
      const angle = random(-30, 30);
      const translateX = Math.tan((angle * Math.PI) / 180) * 100;
      const startLeft = random(0, 100);
      const size = random(44, 96);
      const duration = random(12, 28);
      const delay = random(0, 14);
      const opacity = random(0.10, 0.22);
      return { angle, translateX, startLeft, size, duration, delay, opacity };
    });
  }

  // عند أول تحميل: animationDelay = 0، بعدين يرجع delay الطبيعي
  const [bubblesLoaded, setBubblesLoaded] = React.useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setBubblesLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.bgEffects} aria-hidden="true">
      {/* Bubbles - أكبر وحمراء */}
      {bubbleParams.current.map((params, i) => (
        <div
          key={`bubble-${i}`}
          className={styles.bubble}
          style={{
            left: `${params.startLeft}vw`,
            width: `${params.size}px`,
            height: `${params.size}px`,
            opacity: params.opacity,
            animationDelay: bubblesLoaded ? `${params.delay}s` : `0s`,
            animationDuration: `${params.duration}s`,
            '--bubble-x': `${params.translateX}vw`,
            '--bubble-main': 'var(--main-red, #e53935)',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
