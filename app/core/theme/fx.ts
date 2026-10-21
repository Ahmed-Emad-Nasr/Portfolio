"use client";

/**
 * Theme FX preferences: transition duration, motion safety, device tier.
 * Duration is user-adjustable (command palette) and persisted.
 */

const DURATION_KEY = "sensei-fx-duration";
export const DEFAULT_FX_DURATION = 900;
export const FX_DURATIONS = [450, 900, 1400] as const;

export function getFxDuration(): number {
  if (typeof window === "undefined") return DEFAULT_FX_DURATION;
  const raw = Number(window.localStorage.getItem(DURATION_KEY));
  if (!Number.isFinite(raw)) return DEFAULT_FX_DURATION;
  return Math.min(2000, Math.max(300, raw));
}

export function setFxDuration(ms: number): void {
  window.localStorage.setItem(DURATION_KEY, String(ms));
  window.dispatchEvent(new CustomEvent("sensei-fx-duration", { detail: ms }));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type DeviceTier = "full" | "lite";

/** Static heuristics: cores, RAM, save-data. Cheap, no probe needed. */
export function getDeviceTier(): DeviceTier {
  if (typeof navigator === "undefined") return "full";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return "lite";
  const cores = nav.hardwareConcurrency ?? 8;
  const ram = nav.deviceMemory ?? 8;
  if (cores <= 4 && ram <= 4) return "lite";
  return "full";
}

/** New-theme canvas palette (must match globals.css tokens). */
export const THEME_CANVAS_BG: Record<"light" | "dark", string> = {
  light: "#f7f5f0",
  dark: "#080808",
};
