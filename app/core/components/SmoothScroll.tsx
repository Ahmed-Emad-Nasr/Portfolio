"use client";

/*
 * Lenis smooth scrolling, driven by its own requestAnimationFrame loop
 * (autoRaf).
 *
 * Sensei-Dev's feel: each frame the page covers 10% of the distance left
 * (lerp 0.1). With lerp set, Lenis ignores `duration` for the wheel; links
 * and shortcuts use their own glide (core/utils/scroll.ts).
 *
 * Touch screens keep the phone's own scrolling (syncTouch off): it already
 * has momentum, and a smoothed finger feels like lag. With "reduce motion"
 * on, the wheel scrolls natively too.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";
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
  /* Read once on the client; ReactLenis renders nothing on the server */
  const [smooth] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: smooth, autoRaf: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
