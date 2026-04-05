"use client";

/*
 * File: sensei_loader.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render startup loader and manage fade-out lifecycle timing
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import type { JSX } from "react";
import styles from "./sensei_loader.module.css";
import loadingGif from "@/public/Assets/loading/loading.gif";
function SenseiLoader({ isLoading }: { isLoading: boolean }): JSX.Element | null {
  const [render, setRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Keep a short delay to preserve fade-out smoothness without adding heavy wait time.
      const timer = setTimeout(() => setRender(false), 450);
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
        <Image
          src={loadingGif.src}
          alt="Loading..."
          width={250}
          height={250}
          sizes="250px"
          quality={70}
          priority
          className={styles.spinner}
        />
        <div className={styles.loadingCopy}>
          <span className={styles.loadingLabel}>Preparing experience</span>
          <span className={styles.loadingHint}>Loading sections, data, and interactions...</span>
          <span className={styles.loadingBar} />
        </div>
      </div>
    </div>
  );
}

export default SenseiLoader;