"use client";

/*
 * File: smooth-scroll.tsx
 * PERF BUILD: 
 * - Consolidated ALL scroll listeners (GSAP, Navbar, Progress Bar) into a SINGLE Lenis event.
 * - Eliminated redundant DOM writes and redundant Window event listeners.
 */

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule = typeof import("lenis/react");
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

const NAV_SHOW = new CustomEvent("navbar:visibility", { detail: { hidden: false } });
const NAV_HIDE = new CustomEvent("navbar:visibility", { detail: { hidden: true } });

// ---------------------------------------------------------------------------
// Unified Scroll Controller (Zero Overlap)
// ---------------------------------------------------------------------------
type SyncProps = {
  lenis: any;
  gsap: any;
  ScrollTrigger: any;
  barRef: React.RefObject<HTMLSpanElement | null>;
};

function UnifiedScrollController({ lenis, gsap, ScrollTrigger, barRef }: SyncProps) {
  const navState = useRef({ lastY: 0, isHidden: false });
  const prevProgress = useRef(-1);

  useEffect(() => {
    (window as any).__lenis__ = lenis;

    const handleScroll = (e: any) => {
      // 1. Sync GSAP
      ScrollTrigger.update();

      // 2. Progress Bar (e.progress is 0 to 1 directly from Lenis)
      const progress = e.progress * 100;
      if (Math.abs(progress - prevProgress.current) > 0.3) {
        prevProgress.current = progress;
        if (barRef.current) barRef.current.style.transform = `scaleX(${e.progress.toFixed(4)})`;
      }

      // 3. Navbar Visibility
      const current = e.scroll;
      const delta = current - navState.current.lastY;

      if (current < 60) {
        if (navState.current.isHidden) {
          navState.current.isHidden = false;
          window.dispatchEvent(NAV_SHOW);
        }
      } else if (delta > 80) {
        if (!navState.current.isHidden) {
          navState.current.isHidden = true;
          window.dispatchEvent(NAV_HIDE);
        }
        navState.current.lastY = current;
      } else if (delta < -10) {
        if (navState.current.isHidden) {
          navState.current.isHidden = false;
          window.dispatchEvent(NAV_SHOW);
        }
        navState.current.lastY = current;
      }
    };

    const handleRaf = (time: number) => { lenis.raf(time * 1000); };

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(handleRaf);
    gsap.ticker.lagSmoothing(0);

    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (ev.target as HTMLElement)?.isContentEditable) return;

      const current = lenis.scroll ?? 0;
      const maxScroll = document.documentElement.scrollHeight;
      let delta = 0;

      switch (ev.code) {
        case "ArrowDown":  delta = 100; break;
        case "ArrowUp":    delta = -100; break;
        case "PageDown":   delta = window.innerHeight * 0.9; break;
        case "PageUp":     delta = -window.innerHeight * 0.9; break;
        case "Space":      delta = ev.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9; break;
        case "Home":       ev.preventDefault(); lenis.scrollTo(0); return;
        case "End":        ev.preventDefault(); lenis.scrollTo(maxScroll); return;
        default:           return;
      }

      ev.preventDefault();
      lenis.scrollTo(Math.max(0, Math.min(maxScroll, current + delta)));
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(handleRaf);
      window.removeEventListener("keydown", handleKeyDown);
      delete (window as any).__lenis__;
    };
  }, [lenis, gsap, ScrollTrigger, barRef]);

  return null;
}

// ---------------------------------------------------------------------------
// Inner wrapper
// ---------------------------------------------------------------------------
type InnerProps = {
  children: ReactNode;
  lenisModule: LenisReactModule;
  gsap: GsapModule["default"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
};

function SmoothScrollInner({ children, lenisModule, gsap, ScrollTrigger }: InnerProps) {
  const { ReactLenis, useLenis } = lenisModule;
  const lenis = useLenis();
  const barRef = useRef<HTMLSpanElement>(null);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 1.27,
        smoothWheel: true,
        wheelMultiplier: 0.7,
        touchMultiplier: 0.8,
        syncTouch: false,
      }}
    >
      <div className="scrollProgressTrack" aria-hidden="true">
        <span ref={barRef} className="scrollProgressBar" />
      </div>
      
      {lenis && <UnifiedScrollController lenis={lenis} gsap={gsap} ScrollTrigger={ScrollTrigger} barRef={barRef} />}
      
      {children}
    </ReactLenis>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [modules, setModules] = useState<{
    lenis: LenisReactModule;
    gsap: GsapModule["default"];
    ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
  } | null>(null);

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = prev; };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let active = true;

    void Promise.all([
      import("lenis/react"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([lenis, gsap, st]) => {
      if (!active) return;
      gsap.default.registerPlugin(st.ScrollTrigger);
      setModules({ lenis, gsap: gsap.default, ScrollTrigger: st.ScrollTrigger });
    });

    return () => { active = false; };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !modules) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollInner
      lenisModule={modules.lenis}
      gsap={modules.gsap}
      ScrollTrigger={modules.ScrollTrigger}
    >
      {children}
    </SmoothScrollInner>
  );
}

// ---------------------------------------------------------------------------
// External Hooks (Simplified)
// ---------------------------------------------------------------------------
export function useLenisSnap(selector: string) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!targets.length) return;

    let isSnapping = false;
    let snapTimeout: ReturnType<typeof setTimeout>;

    const getClosestTarget = (): HTMLElement | null => {
      let closest: HTMLElement | null = null;
      let minDist = Infinity;
      for (const el of targets) {
        const dist = Math.abs(el.getBoundingClientRect().top);
        if (dist < minDist) { minDist = dist; closest = el; }
      }
      return minDist < window.innerHeight * 0.45 ? closest : null;
    };

    const onScrollEnd = () => {
      if (isSnapping) return;
      const target = getClosestTarget();
      if (!target || Math.abs(target.getBoundingClientRect().top) < 8) return;

      isSnapping = true;
      const lenis = (window as any).__lenis__;
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.0, offset: 0, onComplete: () => { isSnapping = false; } });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { isSnapping = false; }, 1000);
      }
    };

    // نعتمد على حدث الـ scroll العادي هنا لأن ده مرتبط بالـ DOM nodes مش الـ Progress.
    const onScroll = () => {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(onScrollEnd, 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(snapTimeout); };
  }, [selector]);
}

export function useParallax<T extends HTMLElement>(speed = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId = 0;

    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      ref.current.style.transform = `translateY(${(-(center * speed)).toFixed(2)}px)`;
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (rafId) window.cancelAnimationFrame(rafId); };
  }, [speed]);

  return ref;
}