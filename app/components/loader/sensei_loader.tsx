"use client";
import { useState, useEffect, useRef } from "react";
import type { JSX } from "react";
import styles from "./sensei_loader.module.css";
import loadingGif from "@/public/Assets/loading/loading.gif";

/**
 * @Author Ahmed Emad Nasr
 * @Description Fast & Clean Loader Component - GPU Optimized
 */
function SenseiLoader(): JSX.Element | null {
  const [showLoader, setShowLoader]   = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // دالة الـ fade-out — بتشغّل CSS transition وبعدها بتشيل العنصر من الـ DOM
    const startFadeOut = () => {
      setIsFadingOut(true);
      innerTimerRef.current = setTimeout(() => setShowLoader(false), 500);
    };

    // لو الصفحة اتحملت بالفعل → fade فوراً
    if (document.readyState === "complete") {
      startFadeOut();
      return;
    }

    // لسه بتتحمل → استنى حدث load
    window.addEventListener("load", startFadeOut, { once: true });

    return () => {
      window.removeEventListener("load", startFadeOut);
      if (innerTimerRef.current !== null) {
        clearTimeout(innerTimerRef.current);
      }
    };
  }, []);

  if (!showLoader) return null;

  return (
    <div
      className={`${styles.loader}${isFadingOut ? ` ${styles.fadeOut}` : ""}`}
      id="page-loader"
      aria-hidden="true"
    >
      <div className={styles.loaderContent}>
        <img
          src={loadingGif.src}
          alt="Loading..."
          width={250}
          height={250}
          loading="eager"
          decoding="async"
          className={styles.spinner}
        />
      </div>
    </div>
  );
}

export default SenseiLoader;