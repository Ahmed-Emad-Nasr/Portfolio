"use client";

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
  "CONNECTING_TO_SECURE_SERVER",
  "BYPASSING_FIREWALL",
  "DECRYPTING_USER_DATA",
  "ESTABLISHING_UPLINK",
] as const;

export default function LoadingScreen({
  symbol       = "SYSTEM",
  label        = "ROOT_ACCESS // GRANTED",
  firstName    = "AHMED_EMAD",
  lastName     = "NASR",
  maxWaitMs    = 8000,
  minDisplayMs = 1200,
}: LoadingScreenProps) {
  const prefersReduced = useReducedMotion();

  const [loading,   setLoading]   = useState(true);
  const [showSkip,  setShowSkip]  = useState(false);

  const startRef      = useRef(Date.now());
  const readyRef      = useRef(false);
  const statusMsgRef  = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const totalRef      = useRef(0);
  const loadedRef     = useRef(0);

  const dismiss = useCallback(() => {
    const remaining = Math.max(0, minDisplayMs - (Date.now() - startRef.current));
    setTimeout(() => setLoading(false), remaining);
  }, [minDisplayMs]);

  const setProgressDOM = useCallback((value: number) => {
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${value}%`;
      progressFillRef.current.parentElement?.setAttribute("aria-valuenow", String(value));
    }
    if (value >= 100) dismiss();
  }, [dismiss]);

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

  useEffect(() => {
    const fallback  = setTimeout(() => setLoading(false), maxWaitMs);
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

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

  useEffect(() => {
    if (!loading) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % STATUS_MESSAGES.length;
      if (statusMsgRef.current) statusMsgRef.current.textContent = STATUS_MESSAGES[idx];
    }, 1400);
    return () => clearInterval(id);
  }, [loading]);

  const exitAnim: TargetAndTransition = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.02 };

  return (
    <div role="status" aria-live="polite" aria-label="Page loading">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={exitAnim}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className={styles.loader}
          >
            {/* CRT Scanline Effect */}
            <div className={styles.scanlines} aria-hidden="true" />

            <div className={styles.ringWrap} aria-hidden="true">
              <div className={prefersReduced ? styles.ring : `${styles.ring} ${styles.ringSpinAnim}`} />
              <div className={styles.symbol}>{symbol}</div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: prefersReduced ? 0 : 0.2 }}
              className={styles.copy}
            >
              <div className={styles.copyLabel}>{label}</div>
              <h2 className={styles.title}>
                {firstName} <span className={styles.titleAccent}>[ {lastName} ]</span>
              </h2>

              <p className={styles.statusMsg} aria-live="off">
                &gt; <span ref={statusMsgRef}>{STATUS_MESSAGES[0]}</span>
                <span className={styles.cursor}>_</span>
              </p>
            </motion.div>

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
                  ABORT_SEQ
                </motion.button>
              )}
            </AnimatePresence>

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