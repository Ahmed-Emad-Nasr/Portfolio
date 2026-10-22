"use client";

/*
 * Lenis smooth scrolling, driven by its own requestAnimationFrame loop
 * (autoRaf). It used to run on GSAP's ticker, which put GSAP and
 * ScrollTrigger into the layout bundle of every page; now GSAP is only
 * downloaded by the two sections that animate with it (hero, timeline).
 * ScrollTrigger follows Lenis through the native scroll events Lenis fires.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { registerLenis } from "@/app/core/utils/scroll";

function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    // The keyboard shortcuts scroll through the same instance (core/utils/scroll.ts)
    registerLenis(lenis);
    return () => registerLenis(null);
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, autoRaf: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
