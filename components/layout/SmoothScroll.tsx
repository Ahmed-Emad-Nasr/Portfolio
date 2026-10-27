"use client";

/*
 * Lenis smooth wheel scrolling (lerp 0.1, Sensei-Dev's feel). Touch keeps
 * native scrolling; with "reduce motion" the wheel is native too. Jumps
 * (links, shortcuts) are instant and go through lib/scroll.ts.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { registerLenis } from "@/lib/scroll";

function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
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
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: smooth, autoRaf: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
