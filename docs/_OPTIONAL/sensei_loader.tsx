"use client";

/*
 * sensei_loader.tsx — FIXED
 *
 * The old version blocked the screen for a MINIMUM of 2.2 s *after* the
 * `load` event had already fired:
 *
 *     handleLoad = () => setTimeout(() => setLoading(false), 2200)
 *
 * So a site that finished loading in 800 ms still showed a spinner until
 * ~3 s. Combined with the sections being ssr:false, first meaningful paint
 * landed past 3 s on mid-range hardware. That is a self-inflicted LCP
 * penalty, not a loading indicator.
 *
 * New behaviour:
 * - Dismisses as soon as the page is ready (no artificial floor).
 * - Keeps a SHORT minimum (400 ms) purely to avoid a jarring flash when the
 *   page is already cached — long enough to read as intentional, short
 *   enough to never be the bottleneck.
 * - Hard safety timeout so a stalled asset can never trap the user behind
 *   the overlay (the old code had no escape hatch if `load` never fired).
 * - Skips the whole animated boot sequence at the low tier.
 */

import { useEffect, useState } from "react";
// LazyMotion is deliberately NOT imported here. layout.tsx mounts
// <MotionProvider> (a strict LazyMotion) above everything, and this component
// renders inside it — the nested provider it used to create was a duplicate
// feature bundle, the exact pattern that was just removed from MotionInView.
import { AnimatePresence, m } from "framer-motion";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import styles from "./sensei_loader.module.css";

const BOOT_LINES = [
  "INITIALIZING SYSTEMS",
  "LOADING BUSHIDO PROTOCOL",
  "CALIBRATING DRIFT ANGLE",
  "ENGINE CHECK — ALL CLEAR",
  "BOOST PRESSURE NOMINAL",
  "SENSEI READY",
] as const;

/** Minimum visible time — prevents a one-frame flash, nothing more. */
const MIN_VISIBLE_MS = 400;
/** Absolute ceiling: never trap the user, even if an asset hangs. */
const MAX_VISIBLE_MS = 4000;

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const tier = useDeviceTier();
  const reduced = tier === "low";

  useEffect(() => {
    const mountedAt = performance.now();
    let minTimer: number | undefined;

    const dismiss = () => {
      const elapsed = performance.now() - mountedAt;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      minTimer = window.setTimeout(() => setLoading(false), wait);
    };

    /*
     * التعديل الوحيد في الملف ده عن الأصل.
     *
     * كان بيستنى حدث `load` بتاع الـ window. `load` مبيضربش غير لما
     * **كل** المصادر تخلص: كل الصور — بما فيها اللي تحت الطية وبره
     * الشاشة تماماً — وكل الخطوط وكل ملف JS. على تليفون على شبكة
     * متوسطة ده بسهولة ٣–٥ ثواني شاشة سودا لمحتوى خلص جاهز من زمان.
     *
     * اللي محتاجينه هو "المحتوى الأساسي اتعرض"، وده `DOMContentLoaded`.
     * أي readyState غير "loading" معناه إن الـ parser خلص والـ DOM
     * جاهز.
     *
     * صفر فرق بصري: نفس الأنيميشن، نفس الـ MIN_VISIBLE_MS، نفس كل حاجة.
     * الفرق إن الشاشة بتتشال أول ما تبقى مستعدة فعلاً بدل ما تستنى صور
     * الزائر مش شايفها أصلاً.
     */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", dismiss, { once: true });
    } else {
      dismiss();
    }

    // Escape hatch — the old code would hang forever if `load` never fired.
    const hardStop = window.setTimeout(() => setLoading(false), MAX_VISIBLE_MS);

    return () => {
      document.removeEventListener("DOMContentLoaded", dismiss);
      if (minTimer !== undefined) window.clearTimeout(minTimer);
      window.clearTimeout(hardStop);
    };
  }, []);

  // Boot-line ticker: pointless work once hidden, and skipped on weak devices.
  useEffect(() => {
    if (!loading || reduced) return;
    const id = window.setInterval(
      () => setCurrentLine((prev) => (prev + 1) % BOOT_LINES.length),
      350,
    );
    return () => window.clearInterval(id);
  }, [loading, reduced]);

  return (
      <AnimatePresence>
        {loading && (
          <m.div
            initial={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.76, 0, 0.24, 1] }}
            className={styles.loader}
            role="status"
            /* aria-live was "polite" around a ticker that swaps text every
               350 ms — a screen reader would read six boot lines out loud
               before the visitor reached any content. The overlay announces
               itself once via aria-label; the theatre inside is decoration. */
            aria-live="off"
            aria-label="Loading"
          >
            {/* Three full-screen painted overlays. Decorative only — the CSS
                tier rules strip them on low-end devices. */}
            {!reduced && (
              <>
                <div className={styles.speedLines} data-decorative="true" aria-hidden="true" />
                <div className={styles.neuralGrid} data-decorative="true" aria-hidden="true" />
                <div className={styles.scanlines} data-decorative="true" aria-hidden="true" />
              </>
            )}

            <div className={styles.cornerTopLeft} aria-hidden="true" />
            <div className={styles.cornerTopRight} aria-hidden="true" />
            <div className={styles.cornerBottomLeft} aria-hidden="true" />
            <div className={styles.cornerBottomRight} aria-hidden="true" />

            <div className={styles.emblem} aria-hidden="true">
              {/* Previously THREE separate infinite framer-motion loops (rotate,
                  scale-pulse, opacity-pulse), each its own animation frame
                  subscription. Rotation alone carries the idea. */}
              <m.div
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={styles.outerRing}
              />
              <div className={styles.innerRing} />
              <div className={styles.symbolWrap}>
                <span className={styles.symbol}>師</span>
              </div>
            </div>

            <div className={styles.bootText} aria-hidden="true">
              <div className={styles.bootLineRow}>
                <div className={styles.bootLine} />
                <span className={styles.bootLineText}>
                  {reduced ? "LOADING" : BOOT_LINES[currentLine]}
                </span>
                <div className={styles.bootLine} />
              </div>
              {/* was <h2>. This overlay ships inside the exported HTML, so
                  "The Samurai Way." was the first heading a crawler met on
                  every single page — above the real one. It is decoration,
                  so it is a <p> now. Styling is unchanged. */}
              <p className={styles.title}>
                The Samurai <span className={styles.titleAccent}>Way.</span>
              </p>
            </div>

            {/* The bar used to animate to 100% over a fixed 2.2 s, which was
                pure theatre — it reported a duration, not real progress.
                Now it is an indeterminate CSS sweep, which is honest. */}
            <div className={styles.progressBar} aria-hidden="true">
              <div className={styles.progressFill} data-decorative="true" />
            </div>

            <div className={styles.sideLabelLeft}>SEN-001</div>
            <div className={styles.sideLabelRight}>武士道</div>
          </m.div>
        )}
      </AnimatePresence>
  );
}