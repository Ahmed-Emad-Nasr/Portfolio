"use client";

/*
 * smooth-scroll.tsx — FIXED
 *
 * Three bugs in the previous version:
 *
 * 1. `useLenis()` was called in the SAME component that renders <ReactLenis>.
 *    The context provider lives inside the returned JSX, so the parent can
 *    never read it — `lenis` was always null and the entire useEffect body
 *    never ran. GSAP/ScrollTrigger were bundled (~70 KB) and did nothing.
 *    Fix: the hook now lives in a CHILD of the provider.
 *
 * 2. `gsap.ticker.add(...)` was never removed on cleanup (only `lenis.off`
 *    was). With reactStrictMode: true the effect runs twice in dev, so raf
 *    callbacks stacked up. Fix: keep the callback reference and remove it.
 *
 * 3. Lenis ran at full strength on every device. Smooth-scroll hijacking is
 *    a top cause of stutter on low-end phones, and it fights native momentum
 *    scrolling on touch. Fix: disabled entirely at the low tier.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";

/**
 * Lives INSIDE <ReactLenis>, so useLenis() can actually reach the context.
 * Renders nothing — it only wires Lenis's scroll loop to GSAP's ticker.
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // GSAP + ScrollTrigger are ~70 KB. Load them only once smooth scroll is
    // actually active, instead of shipping them to every visitor up front.
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      // Keep the reference so we can actually remove it later.
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(tick);
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useDeviceTier();

  // On weak hardware native scrolling beats any JS-driven easing. Bailing out
  // here also means Lenis never attaches its wheel/touch listeners at all.
  if (tier === "low") return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: tier === "mid" ? 0.12 : 0.07, // less interpolation work at mid
        duration: 1.2,
        smoothWheel: true,
        // Never hijack touch scrolling — it breaks momentum and feels laggy.
        syncTouch: false,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}