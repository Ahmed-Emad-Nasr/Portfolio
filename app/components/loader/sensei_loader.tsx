"use client";
import { useState, useEffect } from "react";
import type { JSX } from "react";
import styles from "./sensei_loader.module.css";
import loadingGif from "@/public/Assets/loading/loading.gif";

/**
 * @Author Ahmed Emad Nasr
 * @Description Fast & Clean Loader Component - GPU Optimized
 */
function SenseiLoader({ isLoading }: { isLoading: boolean }): JSX.Element | null {
  const [render, setRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // تم تعديل الوقت لـ 800ms ليتناسب مع وقت انتقال الـ CSS (0.8s) 
      const timer = setTimeout(() => setRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!render) return null;

  return (
    <div
      className={`${styles.loader} ${!isLoading ? styles.fadeOut : ""}`}
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