"use client";

/*
 * DividerDrift — the section dividers' scroll drift for browsers without
 * CSS scroll-driven animations (Firefox, Safari before 26). Everywhere else
 * globals.css does it (.divider-track, animation-timeline: view()) and this
 * returns before doing anything.
 *
 * Same travel and direction as the CSS: 0 → -25% while the banner crosses
 * the screen, reversed for data-reverse. One passive scroll listener, one
 * write per visible banner per frame, nothing while none is on screen.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DividerDrift() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracks = [...document.querySelectorAll<HTMLElement>(".divider-track")];
    if (!tracks.length || !("IntersectionObserver" in window)) return;

    const visible = new Set<HTMLElement>();
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      for (const t of visible) {
        const r = t.getBoundingClientRect();
        /* 0 as it enters at the bottom, 1 as it leaves at the top (view()) */
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const x = (t.hasAttribute("data-reverse") ? 1 - p : p) * -25;
        t.style.translate = `${x.toFixed(2)}% 0`;
      }
    };
    const onScroll = () => {
      if (!raf && visible.size) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement);
      onScroll();
    });
    tracks.forEach((t) => io.observe(t));
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}
