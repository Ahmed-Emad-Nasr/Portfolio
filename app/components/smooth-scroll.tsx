"use client";

/*
 * smooth-scroll.tsx — FIXED
 *
 * Bugs fixed:
 *
 * 1. `useLenis()` was called in the SAME component that renders <ReactLenis>.
 *    The context provider lives inside the returned JSX, so the parent can
 *    never read it — `lenis` was always null and the entire useEffect body
 *    never ran. Fix: the hook now lives in a CHILD of the provider.
 *
 * 2. The GSAP/ScrollTrigger bridge that used to live here was calling
 *    `lenis.raf()` a second time from GSAP's own ticker — on top of the
 *    raf loop Lenis already runs by itself (`autoRaf` defaults to `true`
 *    in `lenis-react`, confirmed in its source). Every scroll frame on
 *    every page was doing that work twice. And GSAP + ScrollTrigger
 *    (~70 KB) were being downloaded for it, even though nothing else in
 *    this codebase uses ScrollTrigger (checked: no other match in app/).
 *    Fix: removed the bridge. Lenis drives its own loop; nothing else
 *    needs to piggyback on it.
 *
 * 3. Lenis ran at full strength on every device. Smooth-scroll hijacking is
 *    a top cause of stutter on low-end phones, and it fights native momentum
 *    scrolling on touch. Fix: disabled entirely at the low tier.
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import { registerLenis, EASE_OUT_EXPO, SCROLL_DURATION } from "@/app/core/utils/scroll";
import KeyboardScroll from "@/app/core/components/KeyboardScroll";

/* ── Tune scroll speed here ── (wheel + touchpad) */
const WHEEL_LERP = 0.1;
const WHEEL_MULTIPLIER = 1;

/**
 * Lives INSIDE <ReactLenis>, so useLenis() can actually reach the context.
 * Renders nothing — its only job is to register the instance so that buttons
 * and links (scrollToElement/scrollToTop in core/utils/scroll) go through
 * the same engine the wheel goes through, instead of each of them calling
 * window.scrollTo with the browser's fixed curve on its own.
 */
function LenisRegister() {
  const lenis = useLenis();

  useEffect(() => {
    registerLenis(lenis ?? null);
    return () => registerLenis(null);
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useDeviceTier();

  // On weak hardware native scrolling beats any JS-driven easing. Bailing out
  // here also means Lenis never attaches its wheel/touch listeners at all.
  if (tier === "low") {
    /* Lenis isn't mounted here, but the keyboard still needs to work: without Lenis
       there's no `scroll-behavior: auto !important`, so scrollToY falls back to the browser's
       native motion — which runs on the compositor, so it's cheaper than anything
       we could write. Same keys, same feel, zero JavaScript for the motion. */
    return (
      <>
        <KeyboardScroll />
        {children}
      </>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        /*
         * Wheel and touchpad scroll speed (both go through here).
         *
         * lerp = the fraction of the remaining distance covered each frame. Higher = faster.
         * Lenis uses either lerp or duration, not both — so lerp alone is enough.
         *
         * wheelMultiplier = the distance of each wheel "click" or two-finger swipe on the
         * touchpad. 1 = normal distance, lower = slower, higher = faster.
         *
         * The previous values: lerp 0.032 (high) / 0.06 (mid) and
         * wheelMultiplier 0.72 — those were deliberately slow. The new values are
         * Lenis's own defaults (lerp 0.1, wheelMultiplier 1),
         * and if you still want it faster increase both numbers, or decrease them for slower.
         */
        lerp: WHEEL_LERP,
        wheelMultiplier: WHEEL_MULTIPLIER,
        smoothWheel: true,

        /*
         * Hash links (#Contact, #Projects, links inside articles).
         * Lenis has built-in handling for them and it was disabled — meaning any <a href="#x">
         * on the site jumped. We use the same duration and curve as the other motions
         * so the feel stays consistent.
         */
        anchors: { duration: SCROLL_DURATION, easing: EASE_OUT_EXPO },
        // Never hijack touch scrolling — it breaks momentum and feels laggy.
        syncTouch: false,
      }}
    >
      <LenisRegister />
      {/* The keyboard. Lenis only handles the wheel and touch, it has no keyboard
          handling — so without this, the arrows and Page Down jump. */}
      <KeyboardScroll />
      {children}
    </ReactLenis>
  );
}