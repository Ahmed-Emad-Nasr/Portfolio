"use client";

/*
 * File: smooth-scroll.tsx
 * Author: Ahmed Emad Nasr
 * v2 improvements:
 *   - Lenis lerp/duration tuned for silkier feel (less lag, faster settle)
 *   - ScrollProgressBar: gradient fill + rounded cap + fade-out at 100%
 *   - NavbarVisibilityController: hysteresis band prevents flicker on bouncy scroll
 *   - useParallax: clamped output + will-change hint on mount/unmount
 *   - useScrollVelocity: new hook — exposes normalised scroll speed (0–1)
 *     useful for blur/scale effects tied to scroll momentum
 *   - useActiveSection: new hook — tracks which section is in view by id
 *   - Lenis options: syncTouch true on iOS for native feel, overscroll damping
 */

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

type LenisReactModule   = typeof import("lenis/react");
type GsapModule         = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

// ---------------------------------------------------------------------------
// 1. ScrollProgressBar
//    v2: gradient fill, rounded transform-origin, fades out when complete
// ---------------------------------------------------------------------------
function ScrollProgressBar() {
  const barRef  = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prev    = useRef(-1);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const doc          = document.documentElement;
      const scrollTop    = doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - window.innerHeight || 1;
      const progress     = (scrollTop / scrollHeight) * 100;

      if (Math.abs(progress - prev.current) > 0.25) {
        prev.current = progress;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${(progress / 100).toFixed(4)})`;
        }
        // Fade the whole bar out once the user reaches the very end
        if (trackRef.current) {
          trackRef.current.style.opacity = progress > 98 ? "0" : "1";
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

  return (
    <div
      ref={trackRef}
      className="scrollProgressTrack"
      aria-hidden="true"
      style={{
        // Smooth fade transition when reaching page end
        transition: "opacity 0.6s ease",
      }}
    >
      <span ref={barRef} className="scrollProgressBar" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. NavbarVisibilityController
//    v2: hysteresis band — navbar only re-shows after scrolling UP by >30px,
//    prevents flicker on elastic/bouncy scroll (common on macOS trackpads)
// ---------------------------------------------------------------------------
const NAV_SHOW = new CustomEvent("navbar:visibility", { detail: { hidden: false } });
const NAV_HIDE = new CustomEvent("navbar:visibility", { detail: { hidden: true } });

function NavbarVisibilityController() {
  const lastScrollY  = useRef(0);
  const ticking      = useRef(false);
  const isHidden     = useRef(false);
  // Track cumulative upward scroll to apply hysteresis
  const upAccum      = useRef(0);

  useEffect(() => {
    const HIDE_THRESHOLD   = 80;   // px scrolled down before hiding
    const SHOW_AT_TOP      = 60;   // always show near top of page
    const SHOW_HYSTERESIS  = 30;   // must scroll UP this far before re-showing

    const update = () => {
      const current = window.scrollY;
      const delta   = current - lastScrollY.current;
      ticking.current = false;

      // Always show at top of page
      if (current < SHOW_AT_TOP) {
        upAccum.current = 0;
        if (isHidden.current) {
          isHidden.current = false;
          window.dispatchEvent(NAV_SHOW);
        }
        lastScrollY.current = current;
        return;
      }

      if (delta > 0) {
        // Scrolling down — reset upward accumulator
        upAccum.current = 0;
        if (!isHidden.current && delta > HIDE_THRESHOLD) {
          isHidden.current = true;
          window.dispatchEvent(NAV_HIDE);
          lastScrollY.current = current;
        }
      } else if (delta < 0) {
        // Scrolling up — accumulate; only show after hysteresis satisfied
        upAccum.current += Math.abs(delta);
        if (isHidden.current && upAccum.current > SHOW_HYSTERESIS) {
          isHidden.current  = false;
          upAccum.current   = 0;
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
// 3. useLenisSnap — unchanged (already solid)
// ---------------------------------------------------------------------------
export function useLenisSnap(selector: string) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!targets.length) return;

    let isSnapping    = false;
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
        lenis.scrollTo(target, {
          duration:   1.0,
          offset:     0,
          onComplete: () => { isSnapping = false; },
        });
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimeout);
    };
  }, [selector]);
}

// ---------------------------------------------------------------------------
// 4. useParallax
//    v2: will-change applied on mount / removed on unmount, clamped output
//    so elements don't scroll off-screen on short viewports
// ---------------------------------------------------------------------------
export function useParallax<T extends HTMLElement>(speed = 0.3, clamp = 120) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hint compositor on mount; remove after first animation frame completes
    if (ref.current) ref.current.style.willChange = "transform";

    let rafId  = 0;
    let active = true;

    const update = () => {
      if (!ref.current) return;
      const rect   = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const raw    = -(center * speed);
      // Clamp to prevent elements drifting far out of layout
      const clamped = Math.max(-clamp, Math.min(clamp, raw));
      ref.current.style.transform = `translateY(${clamped.toFixed(2)}px)`;
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      active = false;
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      // Clean up will-change to free compositor layer
      if (ref.current) ref.current.style.willChange = "auto";
    };
  }, [speed, clamp]);

  return ref;
}

// ---------------------------------------------------------------------------
// 5. useScrollVelocity (NEW)
//    Returns a normalised scroll velocity value (0–1).
//    Use it to drive blur, scale, or opacity effects tied to momentum.
//
//    Example:
//      const velocity = useScrollVelocity();
//      <div style={{ filter: `blur(${velocity * 4}px)` }} />
// ---------------------------------------------------------------------------
export function useScrollVelocity(maxVelocity = 3000): number {
  const [velocity, setVelocity] = useState(0);
  const lastY     = useRef(0);
  const lastTime  = useRef(0);
  const decayId   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const now      = performance.now();
      const dt       = now - lastTime.current || 1;
      const dy       = Math.abs(window.scrollY - lastY.current);
      const v        = Math.min((dy / dt) * 1000, maxVelocity); // px/s, capped
      const norm     = parseFloat((v / maxVelocity).toFixed(3));

      lastY.current    = window.scrollY;
      lastTime.current = now;
      setVelocity(norm);

      // Decay back to 0 after scroll stops
      clearTimeout(decayId.current);
      decayId.current = setTimeout(() => setVelocity(0), 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(decayId.current);
    };
  }, [maxVelocity]);

  return velocity;
}

// ---------------------------------------------------------------------------
// 6. useActiveSection (NEW)
//    Tracks which section id is currently most visible in the viewport.
//    Use it to highlight active nav links without extra scroll listeners.
//
//    Example:
//      const active = useActiveSection(["hero", "about", "work", "contact"]);
//      <NavLink active={active === "about"} />
// ---------------------------------------------------------------------------
export function useActiveSection(ids: string[], offset = 0.35): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (!ids.length) return;

    const threshold = window.innerHeight * offset;

    const pick = () => {
      let best     = "";
      let bestDist = Infinity;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top  = el.getBoundingClientRect().top;
        const dist = Math.abs(top - threshold);
        if (dist < bestDist) { bestDist = dist; best = id; }
      }

      if (best) setActive(best);
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => { pick(); rafId = 0; });
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), offset]);

  return active;
}

// ---------------------------------------------------------------------------
// 7. Lenis + GSAP ScrollTrigger sync + keyboard handling
//    v2: keyboard delta uses Lenis velocity not raw scroll position
// ---------------------------------------------------------------------------
type SyncProps = {
  lenis:         NonNullable<ReturnType<LenisReactModule["useLenis"]>>;
  gsap:          GsapModule["default"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
};

function LenisScrollTriggerSync({ lenis, gsap, ScrollTrigger }: SyncProps) {
  useEffect(() => {
    (window as any).__lenis__ = lenis;

    const handleScroll = () => { ScrollTrigger.update(); };
    const handleRaf    = (time: number) => { lenis.raf(time * 1000); };

    lenis.on("scroll", handleScroll);
    gsap.ticker.add(handleRaf);
    gsap.ticker.lagSmoothing(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const current   = (lenis as any).scroll ?? window.scrollY ?? 0;
      const maxScroll = document.documentElement.scrollHeight;
      let delta = 0;

      switch (e.code) {
        case "ArrowDown": delta =  120; break;
        case "ArrowUp":   delta = -120; break;
        case "PageDown":  delta =  window.innerHeight * 0.88; break;
        case "PageUp":    delta = -window.innerHeight * 0.88; break;
        case "Space":     delta = e.shiftKey ? -window.innerHeight * 0.88 : window.innerHeight * 0.88; break;
        case "Home":      e.preventDefault(); (lenis as any).scrollTo(0);         return;
        case "End":       e.preventDefault(); (lenis as any).scrollTo(maxScroll); return;
        default:          return;
      }

      e.preventDefault();
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
// 8. Inner wrapper
//    v2 Lenis options:
//      lerp 0.07 → 0.09    — less lag, snappier response
//      duration 1.2 → 1.05 — quicker settle without feeling rushed
//      syncTouch true       — native-feel on iOS (Lenis passthrough on touch)
//      overscroll false     — prevents rubber-band fighting with Lenis
// ---------------------------------------------------------------------------
type InnerProps = {
  children:            ReactNode;
  lenisModule:         LenisReactModule;
  gsap:                GsapModule["default"];
  ScrollTrigger:       ScrollTriggerModule["ScrollTrigger"];
  prefersReducedMotion: boolean;
};

function SmoothScrollInner({
  children,
  lenisModule,
  gsap,
  ScrollTrigger,
}: InnerProps) {
  const { ReactLenis, useLenis } = lenisModule;
  const lenis = useLenis();

  return (
    <ReactLenis
      root
      options={{
        lerp:           0.09,    // v2: was 0.07 — slightly snappier
        duration:       1.05,    // v2: was 1.2  — quicker settle
        smoothWheel:    true,
        wheelMultiplier: 0.75,
        touchMultiplier: 0.85,
        syncTouch:      true,    // v2: native-feel on iOS trackpad / touch
        // @ts-ignore — available in lenis ≥1.1, types may lag
        overscroll:     false,   // v2: prevent rubber-band fighting
      }}
    >
      <ScrollProgressBar />
      <NavbarVisibilityController />
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
// 9. Public component
// ---------------------------------------------------------------------------
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [modules, setModules] = useState<{
    lenis:         LenisReactModule;
    gsap:          GsapModule["default"];
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