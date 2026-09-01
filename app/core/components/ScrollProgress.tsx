"use client";

/*
 * ScrollProgress.tsx
 * Author: Ahmed Emad Nasr
 *
 * A progress bar segmented by the page's sections — sitting exactly on the
 * header's red rule (the same 2px), so it adds no layout space at all.
 *
 * Why segmented? A continuous bar only says "where you are in the page". A
 * segmented one also says "which section you are in and how much of it is
 * left" — and each segment's width is proportional to that section's real
 * length, so the shape itself carries information about the page structure.
 *
 * Deliberate performance decisions:
 * 1. Zero re-renders during scroll. Every calculation is written straight
 *    to the DOM through refs, exactly as the header does with
 *    classList.toggle.
 * 2. rAF throttle + passive listener, so the scroll thread is never blocked.
 * 3. transform: scaleX() only — no width animation causing layout/paint
 *    every frame.
 * 4. ResizeObserver on the body: dynamic sections add page height after
 *    hydration, and without it the proportions stay wrong until the first
 *    scroll.
 * 5. If a section is missing from the DOM, the split falls back to equal
 *    widths rather than breaking.
 *
 * Works with Lenis with no wiring: root mode performs a real scroll on the
 * window, so the scroll event fires normally.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollProgress.module.css";

// The same IDs the scroll spy uses — one source of truth
const PORTFOLIO_SECTIONS = ["Home", "Experience", "Projects", "Certifications", "Coverage", "Contact"] as const;
const BLOG_SECTIONS = ["blog-pdfs-title", "youtube-hub-title"] as const;
// The case page has no sections — a single continuous bar across the page.
// (The first segment always starts at 0 and the last ends at the bottom
//  of the page, so one segment is exactly an ordinary progress bar.)
const CASE_SECTIONS = ["case-body"] as const;

/** Safety margin above a section, so its segment completes before the
    section disappears under the header */
const HEADER_OFFSET = 80;

export default function ScrollProgress() {
  const pathname = usePathname();

  // Both arrays are module-level constants, so the reference is stable and
  // the effect does not re-run on every render.
  const ids = pathname.startsWith("/blog/")
    ? CASE_SECTIONS
    : pathname.startsWith("/blog")
      ? BLOG_SECTIONS
      : PORTFOLIO_SECTIONS;

  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const segs = segRefs.current;
    const fills = fillRefs.current;
    if (!fills.length) return;

    let raf = 0;
    let ranges: { start: number; end: number }[] = [];
    const lastValues = new Array<number>(fills.length).fill(-1);

    const measure = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);

      const starts = ids.map((id, i) => {
        // The first segment has to start at the very top, not at the Home section
        if (i === 0) return 0;
        const el = document.getElementById(id);
        if (!el) return (maxScroll / ids.length) * i; // fallback: equal distribution
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        return Math.min(maxScroll, Math.max(0, top));
      });

      ranges = starts.map((start, i) => ({
        start,
        end: i === starts.length - 1 ? maxScroll : Math.max(start + 1, starts[i + 1]),
      }));

      // Each segment's width is proportional to the section's actual length
      for (let i = 0; i < ranges.length; i++) {
        const seg = segs[i];
        if (!seg) continue;
        seg.style.flexGrow = String(Math.max(0.06, (ranges[i].end - ranges[i].start) / maxScroll));
      }
    };

    const paint = () => {
      raf = 0;
      const y = window.scrollY;

      for (let i = 0; i < ranges.length; i++) {
        const { start, end } = ranges[i];
        const ratio = (y - start) / (end - start);
        const value = Math.round(Math.min(1, Math.max(0, ratio)) * 1000) / 1000;

        if (value === lastValues[i]) continue;
        lastValues[i] = value;

        const fill = fills[i];
        const seg = segs[i];
        if (!fill || !seg) continue;

        fill.style.transform = `scaleX(${value})`;
        seg.dataset.state = value >= 1 ? "done" : value > 0 ? "active" : "idle";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const remeasure = () => {
      measure();
      paint();
    };

    remeasure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids]);

  // aria-hidden deliberately: the element is purely decorative, and the
  // screen reader already has the position. Updating aria-valuenow every frame is spam.
  return (
    <div className={styles.track} aria-hidden="true">
      {ids.map((id, i) => (
        <span
          key={id}
          data-state="idle"
          className={styles.segment}
          ref={(el) => {
            segRefs.current[i] = el;
          }}
        >
          <span
            className={styles.fill}
            ref={(el) => {
              fillRefs.current[i] = el;
            }}
          />
        </span>
      ))}
    </div>
  );
}
