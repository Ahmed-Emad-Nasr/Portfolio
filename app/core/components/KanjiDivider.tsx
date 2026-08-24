"use client";

/*
 * KanjiDivider.tsx — REBUILT
 *
 * This component was the single biggest scroll-jank source on the site.
 * Four instances render on the homepage, and EACH one had:
 *
 *   1. backdrop-filter: blur(4px) on a full-width element. This is the most
 *      GPU-expensive property in CSS — it forces the compositor to re-sample
 *      everything behind the element on every frame.
 *   2. Its own useScroll() subscription → four separate scroll listeners
 *      driving four separate useTransform chains.
 *   3. will-change: transform permanently set, so four compositor layers were
 *      held in GPU memory for the whole session whether visible or not.
 *   4. Eight repeated copies of the text inside, each with three nested spans
 *      = ~200 extra DOM nodes across the page.
 *   5. ~40 inline style objects reallocated on every single render.
 *
 * REBUILT AS: a pure CSS marquee. No JS, no scroll listener, no framer-motion,
 * no backdrop-filter. The animation runs entirely on the compositor and
 * pauses itself when off-screen via content-visibility. Visually near-identical.
 */

import { memo } from "react";
import styles from "./KanjiDivider.module.css";

interface KanjiDividerProps {
  text?: string;
  reverse?: boolean;
  angle?: number;
}

const DEFAULT_TEXT = "武士道 • 継続は力なり • 改善 • 不撓不屈 • 七転八起";

/* Four repeats is the minimum that guarantees seamless wraparound at any
   viewport width — the old eight were double what the effect needed. */
const REPEATS = 4;

const KanjiDivider = memo(function KanjiDivider({
  text = DEFAULT_TEXT,
  reverse = false,
  angle = -1.5,
}: KanjiDividerProps) {
  return (
    <div
      className={styles.divider}
      aria-hidden="true"
      style={{ "--angle": `${angle}deg` } as React.CSSProperties}
    >
      <div className={styles.scrim} />
      <div className={styles.edgeTop} />
      <div className={styles.edgeBottom} />

      <div
        className={reverse ? `${styles.track} ${styles.reverse}` : styles.track}
        data-decorative="true"
      >
        {Array.from({ length: REPEATS }, (_, index) => (
          <span key={index} className={styles.group}>
            <span className={styles.brand}>Ahmed Emad Nasr</span>
            <span className={styles.sep}>•</span>
            <span className={styles.text}>{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
});

export default KanjiDivider;