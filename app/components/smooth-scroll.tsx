"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();

  // a11y: prefers-reduced-motion (CSS) never reaches Lenis — this is a JS
  // scroll hijack, not a CSS transition/animation — so we check the OS
  // setting explicitly and tell Lenis to behave like native/instant scroll
  // for anyone who has it turned on (WCAG 2.3.3).
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!lenis) return;

    // Named reference so we can actually remove it on cleanup.
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      // Bug fix: the previous version never removed this ticker callback.
      // Every time this effect re-ran (React Strict Mode double-invokes
      // effects in dev, and any remount does the same in prod), another
      // lenis.raf() got permanently added to the ticker — so scroll frames
      // silently started doing 2x, 3x... the work over a session.
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        lerp: reducedMotion ? 1 : 0.1,
        duration: reducedMotion ? 0 : 1.2,
        smoothWheel: !reducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}