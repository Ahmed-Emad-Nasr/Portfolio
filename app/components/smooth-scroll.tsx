"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule = typeof import("lenis/react");
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

// ---------------------------------------------------------------------------
// Scroll Progress Bar
// PERF: Skip setState when progress delta < 0.5% — avoids re-renders mid-scroll
// ---------------------------------------------------------------------------
function ScrollProgressBar() {
  const barRef = useRef<HTMLSpanElement>(null);
  // Drive directly via ref — no React re-render needed for a CSS transform
  const prevProgress = useRef(-1);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - window.innerHeight || 1;
      const progress = (scrollTop / scrollHeight) * 100;

      // Skip DOM write when change is imperceptible
      if (Math.abs(progress - prevProgress.current) > 0.3) {
        prevProgress.current = progress;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${(progress / 100).toFixed(4)})`;
        }
      }
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // PERF: No resize listener — progress bar doesn't need to react to resize
  // (scrollHeight updates naturally on next scroll event)

  return (
    <div className="scrollProgressTrack" aria-hidden="true">
      <span ref={barRef} className="scrollProgressBar" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hide/Show Navbar on Scroll
// PERF: Fixed delta comparison — only update lastScrollY when dispatching
// PERF: Dispatch uses plain CustomEvent constructor (faster than object spread)
// ---------------------------------------------------------------------------
const NAV_SHOW = new CustomEvent("navbar:visibility", { detail: { hidden: false } });
const NAV_HIDE = new CustomEvent("navbar:visibility", { detail: { hidden: true } });

function NavbarVisibilityController() {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const isHidden = useRef(false);

  useEffect(() => {
    const THRESHOLD = 80;
    const SHOW_AT_TOP = 60;

    const update = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;
      ticking.current = false;

      if (current < SHOW_AT_TOP) {
        if (isHidden.current) {
          isHidden.current = false;
          window.dispatchEvent(NAV_SHOW);
        }
      } else if (delta > THRESHOLD) {
        if (!isHidden.current) {
          isHidden.current = true;
          window.dispatchEvent(NAV_HIDE);
        }
        lastScrollY.current = current;
      } else if (delta < -10) {
        if (isHidden.current) {
          isHidden.current = false;
          window.dispatchEvent(NAV_SHOW);
        }
        lastScrollY.current = current;
      }
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

// ---------------------------------------------------------------------------
// useLenisSnap — unchanged, already optimal
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

    const onScroll = () => {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(onScrollEnd, 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(snapTimeout); };
  }, [selector]);
}

// ---------------------------------------------------------------------------
// useParallax — unchanged, already optimal
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Lenis + GSAP ScrollTrigger sync + keyboard handling
// ---------------------------------------------------------------------------
type SyncProps = {
  lenis: NonNullable<ReturnType<LenisReactModule["useLenis"]>>;
  gsap: GsapModule["default"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
};

function LenisScrollTriggerSync({ lenis, gsap, ScrollTrigger }: SyncProps) {
  useEffect(() => {
    (window as any).__lenis__ = lenis;

    const handleScroll = () => { ScrollTrigger.update(); };
    const handleRaf = (time: number) => { lenis.raf(time * 1000); };

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(handleRaf);
    gsap.ticker.lagSmoothing(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const current = (lenis as any).scroll ?? window.scrollY ?? 0;
      const maxScroll = document.documentElement.scrollHeight;
      let delta = 0;

      switch (e.code) {
        case "ArrowDown":  delta = 100; break;
        case "ArrowUp":    delta = -100; break;
        case "PageDown":   delta = window.innerHeight * 0.9; break;
        case "PageUp":     delta = -window.innerHeight * 0.9; break;
        case "Space":      delta = e.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9; break;
        case "Home":       e.preventDefault(); (lenis as any).scrollTo(0); return;
        case "End":        e.preventDefault(); (lenis as any).scrollTo(maxScroll); return;
        default:           return;
      }

      e.preventDefault();
      // PERF: Math.min/max inline — no intermediate variable
      (lenis as any).scrollTo(Math.max(0, Math.min(maxScroll, current + delta)));
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      lenis.off("scroll", handleScroll);
      gsap.ticker.remove(handleRaf);
      window.removeEventListener("keydown", handleKeyDown);
      delete (window as any).__lenis__;
    };
  }, [lenis, gsap, ScrollTrigger]);

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
  prefersReducedMotion: boolean;
};

function SmoothScrollInner({ children, lenisModule, gsap, ScrollTrigger, prefersReducedMotion }: InnerProps) {
  const { ReactLenis, useLenis } = lenisModule;
  const lenis = useLenis();

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
      <ScrollProgressBar />
      <NavbarVisibilityController />
      {lenis && <LenisScrollTriggerSync lenis={lenis} gsap={gsap} ScrollTrigger={ScrollTrigger} />}
      {children}
    </ReactLenis>
  );
}

// ---------------------------------------------------------------------------
// Public component
// PERF: Modules loaded in parallel — same as before but no extra state splits
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

    // PERF: Single state update vs 3 separate setStates = 1 re-render instead of 3
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
    return (
      <>
        <ScrollProgressBar />
        {children}
      </>
    );
  }

  return (
    <SmoothScrollInner
      lenisModule={modules.lenis}
      gsap={modules.gsap}
      ScrollTrigger={modules.ScrollTrigger}
      prefersReducedMotion={false}
    >
      {children}
    </SmoothScrollInner>
  );
}