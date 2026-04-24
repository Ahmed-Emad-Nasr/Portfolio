"use client";

/*
 * File: sensei_loader.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Render startup loader with only a GIF (Cybersecurity Boot-up Theme)
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import type { JSX } from "react";
import styles from "./sensei_loader.module.css";
import loadingGif from "@/public/Assets/loading/loading.gif";

function SenseiLoader({ isLoading }: { isLoading: boolean }): JSX.Element | null {
  const [render, setRender] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true); // تشغيل حركة الـ Fade-out الأول
      const timer = setTimeout(() => setRender(false), 500); // 500ms عشان ياخد وقته يختفي بنعومة
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!render) return null;

  return (
    <div
      className={`${styles.loader} ${fadeOut ? styles.fadeOut : ""}`}
      id="page-loader"
      aria-hidden="true"
    >
      <Image
        src={loadingGif.src}
        alt="System Booting..."
        width={250}
        height={250}
        sizes="250px"
        quality={70}
        priority
        className={styles.spinner}
      />
    </div>
  );
}

export default SenseiLoader;