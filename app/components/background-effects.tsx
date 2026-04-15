"use client";
import React, { useEffect, useRef, useCallback } from 'react';
import styles from './background-effects.module.css';

const NUM_BUBBLES = 16;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function BackgroundEffects() {
  const meteorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- Animation control state ---
  const [animationsActive, setAnimationsActive] = React.useState(true);

  // --- Meteor animation logic ---
  // Store animation timeouts to clear them when pausing
  const meteorTimeouts = useRef<number[][]>([]); // array of timeout ids per meteor

  // Helper to clear all timeouts
  const clearAllMeteorTimeouts = useCallback(() => {
    meteorTimeouts.current.forEach((timeouts) => {
      if (timeouts) timeouts.forEach((id) => clearTimeout(id));
    });
    meteorTimeouts.current = [];
  }, []);

  // Animate meteors
  const startMeteorAnimations = useCallback(() => {
    clearAllMeteorTimeouts();
    meteorTimeouts.current = meteorRefs.current.map((meteor, i) => {
      if (!meteor) return [];
      let running = true;
      const timeouts: number[] = [];
      const animate = () => {
        if (!running) return;
        meteor.style.transition = 'none';
        meteor.style.top = `${random(0, 80)}vh`;
        meteor.style.left = `-${random(10, 30)}vw`;
        meteor.style.opacity = '0';
        timeouts.push(window.setTimeout(() => {
          meteor.style.transition = 'all 1.2s linear';
          meteor.style.top = `${random(0, 80)}vh`;
          meteor.style.left = `${random(100, 120)}vw`;
          meteor.style.opacity = '0.3';
        }, 50));
        timeouts.push(window.setTimeout(() => animate(), random(2500, 5000)));
      };
      animate();
      return timeouts;
    });
  }, [clearAllMeteorTimeouts]);

  // Pause meteors
  const pauseMeteorAnimations = useCallback(() => {
    clearAllMeteorTimeouts();
    // Hide meteors visually
    meteorRefs.current.forEach((meteor) => {
      if (meteor) meteor.style.opacity = '0';
    });
  }, [clearAllMeteorTimeouts]);

  // Effect to start/stop meteor animations
  useEffect(() => {
    if (animationsActive) {
      startMeteorAnimations();
    } else {
      pauseMeteorAnimations();
    }
    return () => {
      clearAllMeteorTimeouts();
    };
  }, [animationsActive, startMeteorAnimations, pauseMeteorAnimations, clearAllMeteorTimeouts]);

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
  // عند فقدان التركيز: أوقف الأنيميشنز (CSS)
  useEffect(() => {
    if (!animationsActive) return;
    const timeout = setTimeout(() => setBubblesLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, [animationsActive]);

  // --- مراقبة تركيز الصفحة ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setAnimationsActive(true);
      } else {
        setAnimationsActive(false);
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    // pagehide (للخروج النهائي)
    const handlePageHide = () => setAnimationsActive(false);
    window.addEventListener('pagehide', handlePageHide);
    // pageshow (للعودة)
    const handlePageShow = () => setAnimationsActive(true);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
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
            opacity: animationsActive ? params.opacity : 0,
            animationPlayState: animationsActive ? 'running' : 'paused',
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
