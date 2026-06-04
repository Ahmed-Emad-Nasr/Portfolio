"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule = typeof import("lenis/react");
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = Math.max(doc.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scrollProgressTrack" aria-hidden="true">
      <span
        className="scrollProgressBar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extracted at module level — defining components inside useMemo/useCallback
// causes React to remount them on every render (breaks hook rules).
// ---------------------------------------------------------------------------
type SyncProps = {
  lenis: NonNullable<ReturnType<LenisReactModule["useLenis"]>>;
  gsap: GsapModule["default"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
};

function LenisScrollTriggerSync({ lenis, gsap, ScrollTrigger }: SyncProps) {
  useEffect(() => {
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    const handleRaf = (time: number) => {
      // gsap ticker provides time in seconds; Lenis v2+ expects seconds directly.
      // If using Lenis v1.x, change this to: lenis.raf(time * 1000)
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(handleRaf);
    gsap.ticker.lagSmoothing(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        (e.target as HTMLElement)?.isContentEditable
      ) return;

      const current = (lenis as any).scroll ?? window.scrollY ?? 0;
      const maxScroll = document.documentElement.scrollHeight || document.body.scrollHeight;
      let delta = 0;

      switch (e.code) {
        case "ArrowDown":  delta = 100; break;
        case "ArrowUp":    delta = -100; break;
        case "PageDown":   delta = window.innerHeight * 0.9; break;
        case "PageUp":     delta = -window.innerHeight * 0.9; break;
        case "Space":
          delta = e.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9;
          break;
        case "Home":
          e.preventDefault();
          (lenis as any).scrollTo(0);
          return;
        case "End":
          e.preventDefault();
          (lenis as any).scrollTo(maxScroll);
          return;
        default:
          return;
      }

      e.preventDefault();
      const target = Math.max(0, Math.min(maxScroll, current + delta));
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
  }, [lenis, gsap, ScrollTrigger]);

  return null;
}

// ---------------------------------------------------------------------------
// Inner wrapper — rendered only after modules are loaded.
// Keeps the useLenis() call legal (must be inside ReactLenis tree).
// ---------------------------------------------------------------------------
type InnerProps = {
  children: ReactNode;
  lenisModule: LenisReactModule;
  gsap: GsapModule["default"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
  prefersReducedMotion: boolean;
};

function SmoothScrollInner({
  children,
  lenisModule,
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
}: InnerProps) {
  const { ReactLenis, useLenis } = lenisModule;
  const lenis = useLenis();

  return (
    <ReactLenis
      root
      options={{
        lerp: prefersReducedMotion ? 1 : 0.04,
        duration: prefersReducedMotion ? 0 : 1.4,
        smoothWheel: !prefersReducedMotion,
        wheelMultiplier: 0.65,
        touchMultiplier: 0.75,
        syncTouch: false,
      }}
    >
      <ScrollProgressBar />
      {lenis && (
        <LenisScrollTriggerSync
          lenis={lenis}
          gsap={gsap}
          ScrollTrigger={ScrollTrigger}
        />
      )}
      {children}
    </ReactLenis>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [lenisModule, setLenisModule] = useState<LenisReactModule | null>(null);
  const [gsapModule, setGsapModule] = useState<GsapModule | null>(null);
  const [scrollTriggerModule, setScrollTriggerModule] = useState<ScrollTriggerModule | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let isActive = true;

    void Promise.all([
      import("lenis/react"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([lenis, gsap, scrollTrigger]) => {
      if (!isActive) return;
      gsap.default.registerPlugin(scrollTrigger.ScrollTrigger);
      setLenisModule(lenis);
      setGsapModule(gsap);
      setScrollTriggerModule(scrollTrigger);
    });

    return () => {
      isActive = false;
    };
  }, [prefersReducedMotion]);

  if (
    prefersReducedMotion ||
    !lenisModule ||
    !gsapModule ||
    !scrollTriggerModule
  ) {
    return (
      <>
        <ScrollProgressBar />
        {children}
      </>
    );
  }

  return (
    <SmoothScrollInner
      lenisModule={lenisModule}
      gsap={gsapModule.default}
      ScrollTrigger={scrollTriggerModule.ScrollTrigger}
      prefersReducedMotion={!!prefersReducedMotion}
    >
      {children}
    </SmoothScrollInner>
  );
}