"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./sensei_loader.module.css";

const BOOT_LINES = [
  "INITIALIZING SYSTEMS",
  "LOADING BUSHIDO PROTOCOL",
  "CALIBRATING DRIFT ANGLE",
  "ENGINE CHECK — ALL CLEAR",
  "BOOST PRESSURE NOMINAL",
  "SENSEI READY",
] as const;

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    let timeoutId: number | undefined;

    const handleLoad = () => {
      timeoutId = window.setTimeout(() => setLoading(false), 2200);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % BOOT_LINES.length);
    }, 350);

    return () => window.clearInterval(interval);
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className={styles.loader}
          role="status"
          aria-live="polite"
          aria-label="Loading screen"
        >
          <div className={styles.speedLines} aria-hidden="true" />
          <div className={styles.neuralGrid} aria-hidden="true" />
          <div className={styles.scanlines} aria-hidden="true" />

          <div className={styles.cornerTopLeft} aria-hidden="true" />
          <div className={styles.cornerTopRight} aria-hidden="true" />
          <div className={styles.cornerBottomLeft} aria-hidden="true" />
          <div className={styles.cornerBottomRight} aria-hidden="true" />

          <div className={styles.emblem} aria-hidden="true">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className={styles.outerRing}
            />

            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={styles.innerRing}
            />

            <div className={styles.symbolWrap}>
              <motion.span
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={styles.symbol}
              >
                師
              </motion.span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={styles.bootText}
          >
            <div className={styles.bootLineRow}>
              <div className={styles.bootLine} />
              <motion.span
                key={currentLine}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={styles.bootLineText}
              >
                {BOOT_LINES[currentLine]}
              </motion.span>
              <div className={styles.bootLine} />
            </div>

            <h2 className={styles.title}>
              The Samurai <span className={styles.titleAccent}>Way.</span>
            </h2>
          </motion.div>

          <div className={styles.progressBar} aria-hidden="true">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={styles.progressFill}
            />
          </div>

          <div className={styles.sideLabelLeft}>SEN-001</div>
          <div className={styles.sideLabelRight}>武士道</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}