"use client";

/*
 * Prerender — renders each deferred section once, off screen, in idle time.
 *
 * Sections below the fold carry content-visibility: auto (.cv-defer): the
 * browser skips their style, layout and paint until they near the screen,
 * which keeps the first load light. The catch is that the first time each
 * one nears the screen, all of that work lands in a frame while the reader
 * is scrolling — and until then its height is a guess, so anchors and the
 * scrollbar are slightly off.
 *
 * So, once the page is idle and the reader is not scrolling, this renders
 * one deferred section at a time for a single frame (core/perf/jump.ts
 * measureDeferred). The browser keeps its real height
 * (contain-intrinsic-size: auto) and the section goes back to being
 * skipped. Lazy sections are queued as they mount. Sections already above
 * the screen are left alone, so nothing ever moves under the reader.
 */

import { useEffect } from "react";
import { whenIdle } from "./idle";
import { measureDeferred } from "./jump";
import { LAZY_MOUNTED } from "./reveal";

export default function Prerender() {
  useEffect(() => {
    const queued = new WeakSet<Element>();
    const queueAll = () => {
      document.querySelectorAll(".cv-defer:not([data-cv-measured])").forEach((el) => {
        if (queued.has(el)) return;
        queued.add(el);
        whenIdle(() => {
          if (!el.isConnected) return;
          /* Never above the screen: a section the reader is past changing
             height would move the page under them (a jump measures those
             itself, before it moves) */
          if (el.getBoundingClientRect().bottom <= 0) {
            queued.delete(el);
            return;
          }
          return measureDeferred([el]);
        });
      });
    };
    queueAll();
    window.addEventListener(LAZY_MOUNTED, queueAll);
    return () => window.removeEventListener(LAZY_MOUNTED, queueAll);
  }, []);
  return null;
}
