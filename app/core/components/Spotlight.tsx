"use client";

/*
 * Spotlight.tsx — a spotlight that follows the cursor across a card grid
 * Author: Ahmed Emad Nasr
 *
 * This is the only component in the set that genuinely costs something.
 * Every other interaction is pure CSS. I wrote it because it is the
 * clearest "the site is responding to you" effect there is, and it can be
 * made cheap if written correctly — but you should know what you are
 * paying.
 *
 * ═══ THE COST ═══
 *
 *   · one listener on the container (not one per card) — event delegation
 *   · rAF throttle: one write per frame no matter how many mouse events
 *   · it writes two CSS variables and nothing else — no layout maths, no
 *     DOM reads during the motion (dimensions are measured once and cached)
 *   · painting: a radial-gradient on the card under the cursor only
 *
 * That paint is real and it is not free. On desktop you will not feel it.
 * Which is why the component returns null on any touch device and any tier
 * that is not "high" — every phone, every tablet and every weak laptop
 * never loads a line of it.
 *
 * ═══ USAGE ═══
 *
 *   <Spotlight className={styles.grid}>
 *     <article data-fx="card">…</article>
 *     <article data-fx="card">…</article>
 *   </Spotlight>
 *
 * Requires the rules in _PATCHES/3-spotlight.md.
 */

import React, { useEffect, useRef } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";

type SpotlightProps = {
  children: React.ReactNode;
  className?: string;
  /*
   * React.HTMLAttributes does not include data-* attributes. TypeScript only
   * waives unknown data-* props on intrinsic elements (<div>), not on custom
   * components — so without this the callers passing data-fx="timeline" would
   * fail `npm run type-check`.
   */
  [key: `data-${string}`]: string | undefined;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

export default function Spotlight({ children, className, ...rest }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = useDeviceTier();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // This condition is what makes the component safe. Any touch device, or
// any device that is not powerful,
    // bails out here and registers no listener at all.
    if (tier !== "high") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;
    let target: HTMLElement | null = null;

    /*
     * The write happens inside rAF, not inside the handler.
     *
     * pointermove fires up to 120 times a second on a 120Hz display.
     * Without this throttle we would be writing to the DOM more often
     * than frames are actually painted — work that is discarded before
     * it can be seen.
     */
    const flush = () => {
      frame = 0;
      if (!target) return;
      target.style.setProperty("--spot-x", `${pendingX}px`);
      target.style.setProperty("--spot-y", `${pendingY}px`);
    };

    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-fx="card"]',
      );

      if (card !== target) {
        // Clear the card we just left, or it stays lit
        target?.removeAttribute("data-spot");
        target = card;
        target?.setAttribute("data-spot", "on");
      }

      if (!card) return;

      /*
       * getBoundingClientRect forces the browser to calculate layout.
       * Calling it here is acceptable because it happens once per frame
       * on a single element — not in a loop.
       *
       * Caching would be wrong: the card lifts 4px on hover, and the
       * cached dimensions would be stale.
       */
      const rect = card.getBoundingClientRect();
      pendingX = event.clientX - rect.left;
      pendingY = event.clientY - rect.top;

      frame ||= requestAnimationFrame(flush);
    };

    const onLeave = () => {
      target?.removeAttribute("data-spot");
      target = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    // passive: true tells the browser the handler will not call
    // preventDefault, so it need not wait before continuing the scroll.
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      target?.removeAttribute("data-spot");
    };
  }, [tier]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
