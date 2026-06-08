"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./sensei_loader.module.css";

// ---------------------------------------------------------------------------
// Cinematic easing — matches globals.css --motion-ease
// ---------------------------------------------------------------------------
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN: [number, number, number, number] = [0.55, 0, 1, 0.45];

export default function LoadingScreen() {
  const [loading, setLoading]       = useState(true);
  const [progress, setProgress]     = useState(0);
  const [exiting, setExiting]       = useState(false);
  const progressRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const minTimeRef                  = useRef(false); // ensure minimum display time

  // ---------------------------------------------------------------------------
  // Progress simulation — ticks toward 90%, then jumps to 100% on real load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Simulate organic progress: fast at first, slows near 90%
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressRef.current!);
          return 90;
        }
        // Decelerate as it approaches 90
        const increment = (90 - prev) * 0.045;
        return prev + Math.max(increment, 0.3);
      });
    }, 80);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Real load detection — enforce minimum 2.2s for cinematic feel
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const MIN_DISPLAY = 2200; // ms — minimum time loader is visible
    const startTime = Date.now();

    const finish = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY - elapsed);

      setTimeout(() => {
        // Jump progress to 100%, then exit after a brief pause
        setProgress(100);
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => setLoading(false), 1200); // match exit animation
        }, 400);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }

    window.addEventListener("load", finish, { once: true });
    return () => window.removeEventListener("load", finish);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          // Fade in on mount
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Cinematic exit: fade out + subtle scale down
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(6px)",
          }}
          transition={{
            duration: 1.1,
            ease: EASE_IN,
          }}
          className={styles.loader}
          aria-hidden="true"
          aria-live="polite"
        >
          {/* Background grid */}
          <motion.div
            className={styles.neuralGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
          />

          {/* Spinner ring */}
          <motion.div
            className={styles.ringWrap}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className={styles.ring}
            />
            <motion.div
              className={styles.symbol}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.35 }}
            >
              師
            </motion.div>
          </motion.div>

          {/* Copy — staggered entrance */}
          <motion.div
            className={styles.copy}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.55 }}
          >
            <motion.div
              className={styles.copyRuleRow}
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
            >
              <div className={styles.copyRule} />
              <span className={styles.copyLabel}>Loading Systems</span>
              <div className={styles.copyRule} />
            </motion.div>

            <motion.h2
              className={styles.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.85 }}
            >
              Ahmed Emad<span className={styles.titleAccent}>Nasr</span>
            </motion.h2>
          </motion.div>

          {/* Progress bar — driven by real progress state */}
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
              // Smooth width transition
              transition={{ duration: 0.35, ease: EASE }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}