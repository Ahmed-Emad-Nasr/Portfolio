"use client";

/*
 * useDeviceTier — classifies the visitor's device once, on mount.
 *
 * The site currently runs the SAME animation load on every device: 20 infinitely
 * animating hero elements, a spring-driven custom cursor, Lenis smooth scroll,
 * and scroll-linked transforms. That is fine on a desktop and unusable on a
 * 2-year-old Android. This hook is the single source of truth for "how much
 * motion can this machine afford", so components and CSS both read one answer.
 *
 * It writes `data-tier` on <html>, which lets plain CSS gate expensive
 * properties (backdrop-filter, infinite keyframes) with no JS in the hot path.
 */

import { useEffect, useState } from "react";

export type DeviceTier = "low" | "mid" | "high";

// Server render and first client render must agree, so start at "mid" —
// the safe middle. Upgrading/downgrading happens in the effect below.
const DEFAULT_TIER: DeviceTier = "mid";

function detectTier(): DeviceTier {
  // Respecting the OS preference outranks any hardware guess.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  // Data Saver on means the user has explicitly asked for less.
  if (nav.connection?.saveData) return "low";

  const cores = nav.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only and rounded (0.25/0.5/1/2/4/8).
  const memory = nav.deviceMemory ?? 4;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");

  if (slowNet || cores <= 4 || memory <= 2) return "low";
  if (cores <= 8 || memory <= 4 || isCoarse) return "mid";
  return "high";
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(DEFAULT_TIER);

  useEffect(() => {
    const apply = () => {
      const next = detectTier();
      setTier(next);
      document.documentElement.dataset.tier = next;
    };

    apply();

    // Re-evaluate if the user flips the OS reduced-motion switch mid-session.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return tier;
}

/** Convenience: true when the device should skip decorative motion entirely. */
export function useIsLowTier(): boolean {
  return useDeviceTier() === "low";
}
