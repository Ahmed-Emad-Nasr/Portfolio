"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule = typeof import("lenis/react");
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

// ---------------------------------------------------------------------------
// Scroll Progress Bar
// ---------------------------------------------------------------------------
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
// Scroll-to-Top Button
// Appears after scrolling 300px, smooth-scrolls back to top via Lenis.
// ---------------------------------------------------------------------------
function ScrollToTopButton({ lenis }: { lenis: any }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to top"
      className="scrollToTopBtn"
      style={{
        position: "fixed",
        bottom: "2.4rem",
        right: "2.4rem",
        zIndex: 2000,
        width: "4.4rem",
        height: "4.4rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(224, 17, 95, 0.12)",
        border: "1px solid rgba(224, 17, 95, 0.3)",
        color: "#e0115f",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.88)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform, opacity",
        padding: 0,
        fontSize: "1.8rem",
        lineHeight: 1,
      }}
    >
      ↑
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hide/Show Navbar on Scroll
// Dispatches a custom event — the navbar listens and adds/removes a class.
// Zero coupling: navbar doesn't need to import this file.
//
// USAGE in your Navbar component:
//   useEffect(() => {
//     const handler = (e: CustomEvent) => {
//       setHidden(e.detail.hidden);
//     };
//     window.addEventListener("navbar:visibility", handler as EventListener);
//     return () => window.removeEventListener("navbar:visibility", handler as EventListener);
//   }, []);
// ---------------------------------------------------------------------------
function NavbarVisibilityController() {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const THRESHOLD = 80; // px to scroll before hiding navbar
    const SHOW_AT_TOP = 60; // always show when near top

    const dispatch = (hidden: boolean) => {
      window.dispatchEvent(
        new CustomEvent("navbar:visibility", { detail: { hidden } })
      );
    };

    const update = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;

      if (current < SHOW_AT_TOP) {
        dispatch(false);
      } else if (delta > THRESHOLD) {
        dispatch(true);
        lastScrollY.current = current;
      } else if (delta < -10) {
        dispatch(false);
        lastScrollY.current = current;
      }

      ticking.current = false;
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
// Scroll Snap via Lenis
// Call useLenisSnap() in any component — pass selector for snap targets.
//
// USAGE:
//   // In a page component (must be inside <SmoothScroll>):
//   useLenisSnap("section[data-snap]");
//   // Then add data-snap to any section you want to snap to.
// ---------------------------------------------------------------------------
export function useLenisSnap(selector: string) {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );
    if (!targets.length) return;

    let isSnapping = false;
    let snapTimeout: ReturnType<typeof setTimeout>;

    const getClosestTarget = (scrollY: number): HTMLElement | null => {
      let closest: HTMLElement | null = null;
      let minDist = Infinity;

      for (const el of targets) {
        const dist = Math.abs(el.getBoundingClientRect().top);
        if (dist < minDist) {
          minDist = dist;
          closest = el;
        }
      }

      return minDist < window.innerHeight * 0.45 ? closest : null;
    };

    const onScrollEnd = () => {
      if (isSnapping) return;
      const target = getClosestTarget(window.scrollY);
      if (!target) return;

      const dist = Math.abs(target.getBoundingClientRect().top);
      if (dist < 8) return; // already snapped

      isSnapping = true;

      // Use Lenis global instance if available, fallback to native
      const lenis = (window as any).__lenis__;
      if (lenis) {
        lenis.scrollTo(target, {
          duration: 1.0,
          offset: 0,
          onComplete: () => { isSnapping = false; },
        });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { isSnapping = false; }, 1000);
      }
    };

    const onScroll = () => {
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(onScrollEnd, 180); // fire 180ms after scroll stops
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimeout);
    };
  }, [selector]);
}

// ---------------------------------------------------------------------------
// Parallax hook — GPU-safe, uses transform only.
//
// USAGE:
//   const ref = useParallax<HTMLDivElement>(0.3); // 0 = no parallax, 1 = full
//   <div ref={ref}>...</div>
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
      const offset = -(center * speed);
      ref.current.style.transform = `translateY(${offset.toFixed(2)}px)`;
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
    // Expose lenis globally for useLenisSnap fallback
    (window as any).__lenis__ = lenis;

    const handleScroll = () => { ScrollTrigger.update(); };

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
        lerp: prefersReducedMotion ? 1 : 0.047,
        duration: prefersReducedMotion ? 0 : 1.25,
        smoothWheel: !prefersReducedMotion,
        wheelMultiplier: 0.68,
        touchMultiplier: 0.78,
        syncTouch: false,
      }}
    >
      <ScrollProgressBar />
      <NavbarVisibilityController />
      <ScrollToTopButton lenis={lenis} />
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
    return () => { window.history.scrollRestoration = previous; };
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

    return () => { isActive = false; };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !lenisModule || !gsapModule || !scrollTriggerModule) {
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