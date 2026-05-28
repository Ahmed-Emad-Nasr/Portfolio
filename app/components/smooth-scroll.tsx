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

        const handleKeyDown = (e: KeyboardEvent) => {
          // Ignore when modifier keys are used
          if (e.altKey || e.ctrlKey || e.metaKey) return;

          const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
          // Don't intercept typing in inputs or editable areas
          if (targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;

          const current = (lenis as any).scroll ?? window.scrollY ?? 0;
          let delta = 0;
          switch (e.code) {
            case "ArrowDown":
                delta = 100; // adjusted step
              break;
            case "ArrowUp":
                delta = -100;
              break;
            case "PageDown":
                delta = window.innerHeight * 0.9; // unchanged
              break;
            case "PageUp":
                delta = -window.innerHeight * 0.9; // unchanged
              break;
            case "Space":
              // Space without shift behaves like PageDown, with shift behaves like PageUp
              if ((e as KeyboardEvent & { shiftKey?: boolean }).shiftKey) delta = -window.innerHeight * 0.9;
              else delta = window.innerHeight * 0.9;
              break;
            case "Home":
              e.preventDefault();
              (lenis as any).scrollTo(0);
              return;
            case "End":
              e.preventDefault();
              (lenis as any).scrollTo(document.documentElement.scrollHeight || document.body.scrollHeight);
              return;
            default:
              return; // not a scroll key
          }

          e.preventDefault();
          const target = Math.max(0, Math.min((document.documentElement.scrollHeight || document.body.scrollHeight), current + delta));
          // Use lenis.scrollTo if available
          try {
            (lenis as any).scrollTo(target);
          } catch {
            window.scrollTo({ top: target, behavior: "smooth" });
          }
        };

        window.addEventListener("keydown", handleKeyDown, { passive: false });

        return () => {
          lenis.off("scroll", handleScroll);
          gsap.ticker.remove(handleRaf);
          window.removeEventListener("keydown", handleKeyDown);
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
        lerp: prefersReducedMotion ? 1 : 0.08,
        duration: prefersReducedMotion ? 0 : 0.9,
        smoothWheel: !prefersReducedMotion,
        syncTouch: false,
      }}
    >
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
