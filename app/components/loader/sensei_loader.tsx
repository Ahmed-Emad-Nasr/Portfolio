"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, TargetAndTransition } from "framer-motion";
import styles from "./sensei_loader.module.css";

/* ─── Props ────────────────────────────────────────────────────────────────── */
export interface LoadingScreenProps {
  /** Kanji / symbol shown in the ring centre */
  symbol?: string;
  /** Small uppercase label above the name */
  label?: string;
  /** First part of the name (white) */
  firstName?: string;
  /** Last name shown in accent colour + italic */
  lastName?: string;
  /** Max ms to wait before force-dismissing the loader (safety net) */
  maxWaitMs?: number;
  /** Extra ms to keep the loader visible after the page is ready */
  minDisplayMs?: number;
}

/* ─── Rotating status messages ─────────────────────────────────────────────── */
const STATUS_MESSAGES = [
  "Initializing…",
  "Loading assets…",
  "Almost ready…",
  "One moment…",
];

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function LoadingScreen({
  symbol = "師",
  label = "Portfolio / Blog",
  firstName = "Ahmed Emad",
  lastName = "Nasr",
  maxWaitMs = 8000,
  minDisplayMs = 1200,
}: LoadingScreenProps) {
  const prefersReduced = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const readyRef = useRef(false);       // page load fired?
  const startRef = useRef(Date.now());  // when did the loader mount?

  /* ── Dismiss helper (respects minDisplayMs) ── */
  const dismiss = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(0, minDisplayMs - elapsed);
    window.setTimeout(() => setLoading(false), remaining);
  }, [minDisplayMs]);

  /* ── Real progress via PerformanceObserver ── */
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    let total = 0;
    let loaded = 0;

    const update = () => {
      if (total === 0) return;
      setProgress(Math.min(100, Math.round((loaded / total) * 100)));
    };

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          total++;
          loaded++;
          update();
        }
      }
    });

    try {
      observer.observe({ type: "resource", buffered: true });
    } catch {
      /* browser doesn't support it — fall through to CSS animation */
    }

    return () => observer.disconnect();
  }, []);

  /* ── Page-load listener + fallback timeout ── */
  useEffect(() => {
    /* Safety net: force-dismiss after maxWaitMs no matter what */
    const fallback = window.setTimeout(() => {
      setLoading(false);
    }, maxWaitMs);

    /* Show "Skip" button after 3 s */
    const skipTimer = window.setTimeout(() => setShowSkip(true), 3000);

    const handleLoad = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setProgress(100);
      dismiss();
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(fallback);
      window.clearTimeout(skipTimer);
    };
  }, [dismiss, maxWaitMs]);

  /* ── Rotating status messages (every 1.4 s) ── */
  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(
      () => setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length),
      1400
    );
    return () => window.clearInterval(id);
  }, [loading]);

  /* ── Ring animation props (respect prefers-reduced-motion) ── */
  const ringTransition: Transition = { duration: 4, repeat: Infinity, ease: "linear" as const };
  const ringAnim: { animate?: TargetAndTransition; transition?: Transition } = prefersReduced
    ? {}
    : { animate: { rotate: 360 }, transition: ringTransition };

  const pulseTransition: Transition = { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const };
  const pulseAnim: { animate?: TargetAndTransition; transition?: Transition } = prefersReduced
    ? {}
    : {
        animate: { scale: [1, 1.18, 1], opacity: [0.18, 0, 0.18] },
        transition: pulseTransition,
      };

  /* ── Exit animation ── */
  const exitAnim: TargetAndTransition = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.03, y: -6 };

  return (
    /* Outer status region for screen readers */
    <div role="status" aria-live="polite" aria-label="Page loading">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={exitAnim}
            transition={{ duration: 0.5, ease: "easeInOut" as const }}
            className={styles.loader}
          >
            {/* Background grid */}
            <div className={styles.neuralGrid} aria-hidden="true" />

            {/* Ring + pulse + symbol */}
            <div className={styles.ringWrap} aria-hidden="true">
              {/* Outer pulse halo */}
              <motion.div className={styles.ringPulse} {...pulseAnim} />

              {/* Spinning ring */}
              <motion.div className={styles.ring} {...ringAnim} />

              {/* Centre kanji */}
              <div className={styles.symbol}>{symbol}</div>
            </div>

            {/* Name + label */}
            <motion.div
              initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.5 }}
              className={styles.copy}
            >
              <div className={styles.copyRuleRow}>
                <div className={styles.copyRule} />
                <span className={styles.copyLabel}>{label}</span>
                <div className={styles.copyRule} />
              </div>
              <h2 className={styles.title}>
                {firstName}
                <span className={styles.titleAccent}>{lastName}</span>
              </h2>

              {/* Status message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIdx}
                  initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
                  transition={{ duration: 0.3 }}
                  className={styles.statusMsg}
                  aria-live="off"
                >
                  {STATUS_MESSAGES[statusIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Skip button (shown after 3 s) */}
            <AnimatePresence>
              {showSkip && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={styles.skipBtn}
                  onClick={() => setLoading(false)}
                  aria-label="Skip loading screen"
                >
                  Skip →
                </motion.button>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className={styles.progressBar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              {progress > 0 ? (
                /* Real progress from PerformanceObserver */
                <motion.div
                  className={styles.progressFill}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" as const, duration: 0.4 }}
                  onAnimationComplete={() => {
                    if (progress === 100) dismiss();
                  }}
                />
              ) : (
                /* Fallback CSS animation when PerformanceObserver isn't available */
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" as const }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}