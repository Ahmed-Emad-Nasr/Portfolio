"use client";

/*
 * sensei-loader.tsx  —  PERF BUILD
 *
 * Changes vs original:
 *  1. Rotating status messages — replaced AnimatePresence + 3x motion.p with a
 *     single <p> whose content is written directly via a DOM ref. Zero React
 *     re-renders for status cycling (1.4s interval that previously called
 *     setStatusIdx → re-render → reconcile → animate).
 *  2. Progress bar — was a motion.div with animate={{ width }}; replaced with a
 *     plain <div> whose style.width is set via a ref. Zero re-renders for
 *     progress updates.
 *  3. showSkip — kept as React state because it only flips once and triggers a
 *     single layout change (acceptable).
 *  4. loading — kept as React state because it triggers the exit animation
 *     which must be React-driven via AnimatePresence.
 *  5. Ring / pulse animations moved fully to CSS (they were already motion.div
 *     with infinite repeat — CSS is cheaper for these).
 *  6. PerformanceObserver total/loaded tracking moved to refs (no state).
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import styles from "./sensei_loader.module.css";

export interface LoadingScreenProps {
  symbol?      : string;
  label?       : string;
  firstName?   : string;
  lastName?    : string;
  maxWaitMs?   : number;
  minDisplayMs?: number;
}

const STATUS_MESSAGES = [
  "Initializing…",
  "Loading assets…",
  "Almost ready…",
  "One moment…",
] as const;

export default function LoadingScreen({
  symbol       = "師",
  label        = "Portfolio / Blog",
  firstName    = "Ahmed Emad",
  lastName     = "Nasr",
  maxWaitMs    = 8000,
  minDisplayMs = 1200,
}: LoadingScreenProps) {
  const prefersReduced = useReducedMotion();

  // Only two pieces of React state — everything else is refs
  const [loading,   setLoading]   = useState(true);
  const [showSkip,  setShowSkip]  = useState(false);

  const startRef      = useRef(Date.now());
  const readyRef      = useRef(false);
  const statusMsgRef  = useRef<HTMLParagraphElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const totalRef      = useRef(0);
  const loadedRef     = useRef(0);

  // ── Dismiss helper ─────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    const remaining = Math.max(0, minDisplayMs - (Date.now() - startRef.current));
    setTimeout(() => setLoading(false), remaining);
  }, [minDisplayMs]);

  // ── Update progress bar via DOM ref — no setState ─────────────────────
  const setProgressDOM = useCallback((value: number) => {
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${value}%`;
      progressFillRef.current.parentElement?.setAttribute("aria-valuenow", String(value));
    }
    if (value >= 100) dismiss();
  }, [dismiss]);

  // ── PerformanceObserver — updates DOM directly ────────────────────────
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          totalRef.current++;
          loadedRef.current++;
          if (totalRef.current > 0) {
            setProgressDOM(Math.min(100, Math.round((loadedRef.current / totalRef.current) * 100)));
          }
        }
      }
    });

    try { observer.observe({ type: "resource", buffered: true }); } catch { /* noop */ }
    return () => observer.disconnect();
  }, [setProgressDOM]);

  // ── Page-load listener + fallback ────────────────────────────────────
  useEffect(() => {
    const fallback  = setTimeout(() => setLoading(false), maxWaitMs);
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Kick off the CSS indeterminate progress animation immediately
    if (progressFillRef.current && totalRef.current === 0) {
      progressFillRef.current.classList.add(styles.progressIndeterminate);
    }

    const handleLoad = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setProgressDOM(100);
    };

    if (document.readyState === "complete") handleLoad();
    else window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(fallback);
      clearTimeout(skipTimer);
    };
  }, [dismiss, maxWaitMs, setProgressDOM]);

  // ── Rotating status messages — DOM mutation, zero re-renders ─────────
  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % STATUS_MESSAGES.length;
      if (statusMsgRef.current) statusMsgRef.current.textContent = STATUS_MESSAGES[idx];
    }, 1400);
    return () => clearInterval(id);
  }, [loading]);

  // ── Exit animation ──────────────────────────────────────────────────
  const exitAnim: TargetAndTransition = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.03, y: -6 };

  return (
    <div role="status" aria-live="polite" aria-label="Page loading">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={exitAnim}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={styles.loader}
          >
            <div className={styles.neuralGrid} aria-hidden="true" />

            {/* Ring + pulse — now pure CSS animations */}
            <div className={styles.ringWrap} aria-hidden="true">
              <div className={prefersReduced ? styles.ringPulse : `${styles.ringPulse} ${styles.ringPulseAnim}`} />
              <div className={prefersReduced ? styles.ring     : `${styles.ring}      ${styles.ringSpinAnim}`} />
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
                {firstName}<span className={styles.titleAccent}>{lastName}</span>
              </h2>

              {/* Status message — mutated via ref, no re-renders */}
              <p ref={statusMsgRef} className={styles.statusMsg} aria-live="off">
                {STATUS_MESSAGES[0]}
              </p>
            </motion.div>

            {/* Skip button — single React state flip, acceptable */}
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

            {/* Progress bar — width driven by DOM ref */}
            <div
              className={styles.progressBar}
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div ref={progressFillRef} className={styles.progressFill} style={{ width: "0%" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}