"use client";

/*
 * useDeviceTier — classifies the visitor's device once.
 *
 * ═══ What changed ═══
 *
 * 1) Classification now happens **before first paint** via a small inline script in
 *    <head> (see DEVICE_TIER_SCRIPT below). Previously it happened inside useEffect,
 *    i.e. after the whole bundle loaded and hydrated — which meant all the
 *    heavy animation (20 elements in the hero + backdrop-filter + Lenis) ran
 *    at full cost exactly in the critical window where LCP and TBT are measured,
 *    and was then turned off. The CSS gating was written correctly but wired up too late.
 *
 * 2) Any touch device with a narrow screen (a phone) is now "low" directly.
 *    Previously `isCoarse` returned "mid" — and every phone landed there,
 *    getting half the budget. "mid" was originally meant for weak
 *    laptops, not mobile. Tablets (width > 900) are still "mid" as before.
 *
 * detectTier() and the script must stay **identical** — any change to one
 * must be made in the other.
 */

import { useEffect, useState } from "react";

export type DeviceTier = "low" | "mid" | "high";

/** Screen width below which a touch device counts as a phone */
const PHONE_MAX_WIDTH = 900;

/*
 * This script is injected into <head> as an inline blocking script.
 * It runs before the browser paints anything, so the html[data-tier="low"] rules
 * in globals.css are active from the first frame.
 *
 * Deliberately written compactly — these are bytes added to every HTML page.
 * try/catch so that no old browser stops the page.
 */
export const DEVICE_TIER_SCRIPT = `(function(){try{var d=document.documentElement,n=navigator,c=n.connection||{},m=window.matchMedia.bind(window),t;if(m("(prefers-reduced-motion: reduce)").matches||c.saveData||/(^|-)2g$/.test(c.effectiveType||"")){t="low"}else{var h=n.hardwareConcurrency||4,y=n.deviceMemory||4,x=m("(pointer: coarse)").matches;t=(x&&window.innerWidth<=${PHONE_MAX_WIDTH})||h<=4||y<=2?"low":h<=8||y<=4||x?"mid":"high"}d.dataset.tier=t}catch(e){document.documentElement.dataset.tier="mid"}})()`;

function detectTier(): DeviceTier {
  // The OS preference wins over any hardware guess.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  // Data Saver on = the user explicitly asked for less.
  if (nav.connection?.saveData) return "low";

  const cores = nav.hardwareConcurrency ?? 4;
  // deviceMemory is Chromium-only, and rounded (0.25/0.5/1/2/4/8).
  const memory = nav.deviceMemory ?? 4;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");

  if (slowNet) return "low";
  // Phone = low motion budget, however fast the chip inside is. A small screen
  // means the decoration is seen less anyway, and battery and network matter more.
  if (isCoarse && window.innerWidth <= PHONE_MAX_WIDTH) return "low";
  if (cores <= 4 || memory <= 2) return "low";
  if (cores <= 8 || memory <= 4 || isCoarse) return "mid";
  return "high";
}

/** Reads what the script wrote instead of computing from scratch */
function readTier(): DeviceTier | null {
  const value = document.documentElement.dataset.tier;
  return value === "low" || value === "mid" || value === "high" ? value : null;
}

// The server and the first browser render must agree, so we start from "mid".
// The script has already written the real value on <html>, so the CSS is correct from the first moment —
// the state here catches up after hydration, and that only affects JavaScript branches.
const DEFAULT_TIER: DeviceTier = "mid";

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(DEFAULT_TIER);

  useEffect(() => {
    const apply = () => {
      // In the normal case the script ran before us — don't recompute needlessly.
      const next = readTier() ?? detectTier();
      setTier(next);
      document.documentElement.dataset.tier = next;
    };

    apply();

    // If the user flips the reduced-motion switch, or rotates the phone and crosses
    // the width threshold, re-evaluate.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH}px)`);

    const recompute = () => {
      const next = detectTier();
      setTier(next);
      document.documentElement.dataset.tier = next;
    };

    motionQuery.addEventListener("change", recompute);
    widthQuery.addEventListener("change", recompute);
    return () => {
      motionQuery.removeEventListener("change", recompute);
      widthQuery.removeEventListener("change", recompute);
    };
  }, []);

  return tier;
}

/**
 * Synchronous check for touch devices — for components that want to decide **before** they even request
 * a chunk (the custom cursor, the command palette). Returns false on the server.
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
