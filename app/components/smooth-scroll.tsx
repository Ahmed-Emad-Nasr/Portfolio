"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule = typeof import("lenis/react");
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [lenisModule, setLenisModule] = useState<LenisReactModule | null>(null);
  const [gsapModule, setGsapModule] = useState<GsapModule | null>(null);
  const [scrollTriggerModule, setScrollTriggerModule] = useState<ScrollTriggerModule | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let isActive = true;

    void Promise.all([import("lenis/react"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([lenis, gsap, scrollTrigger]) => {
        if (!isActive) {
          return;
        }

        gsap.default.registerPlugin(scrollTrigger.ScrollTrigger);
        setLenisModule(lenis);
        setGsapModule(gsap);
        setScrollTriggerModule(scrollTrigger);
      }
    );

    return () => {
      isActive = false;
    };
  }, [prefersReducedMotion]);

  const LenisScrollTriggerSync = useMemo(() => {
    if (!lenisModule || !gsapModule || !scrollTriggerModule) {
      return null;
    }

    const { useLenis } = lenisModule;
    const { default: gsap } = gsapModule;
    const { ScrollTrigger } = scrollTriggerModule;

    function LenisScrollTriggerSyncComponent() {
      const lenis = useLenis();

      useEffect(() => {
        if (!lenis) {
          return;
        }

        const handleScroll = () => {
          ScrollTrigger.update();
        };

        const handleRaf = (time: number) => {
          lenis.raf(time * 1000);
        };

        lenis.on("scroll", handleScroll);
        gsap.ticker.add(handleRaf);
        gsap.ticker.lagSmoothing(0);

        return () => {
          lenis.off("scroll", handleScroll);
          gsap.ticker.remove(handleRaf);
        };
      }, [lenis]);

      return null;
    }

    return LenisScrollTriggerSyncComponent;
  }, [gsapModule, lenisModule, scrollTriggerModule]);

  if (prefersReducedMotion || !lenisModule || !gsapModule || !scrollTriggerModule || !LenisScrollTriggerSync) {
    return <>{children}</>;
  }

  const { ReactLenis } = lenisModule;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 0.9,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
