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

  // a11y / keyboard-nav fix: Lenis drives scroll position itself (virtual
  // scroll), so it never finds out when the browser's native `Tab` focus
  // tries to scroll an off-screen element into view. Without this, tabbing
  // through links/buttons either doesn't visually scroll at all, or snaps
  // back to the old position once Lenis's next frame runs. We listen for
  // `focusin` ourselves and explicitly tell Lenis to scroll to whatever
  // just received focus.
  useEffect(() => {
    if (!lenis) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || typeof target.getBoundingClientRect !== "function") return;

      // Skip elements already fully in view — avoids a jarring re-scroll
      // on every single Tab press when nothing needs to move.
      const rect = target.getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (inView) return;

      lenis.scrollTo(target, { offset: -100, immediate: reducedMotion });
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [lenis, reducedMotion]);

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