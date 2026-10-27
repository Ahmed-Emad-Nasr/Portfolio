/*
 * core/perf/reveal.ts — the page-wide "mount every lazy section now" switch.
 *
 * Lazy sections (core/perf/lazy.tsx) normally mount when the reader gets
 * within three screens of them. A jump to an anchor cannot wait for that:
 * the target, and everything above it, must have its real size first. So a
 * jump flips this switch, and revealAll() resolves once no placeholder is
 * left on the page.
 */

let revealed = false;
const listeners = new Set<() => void>();

export const subscribeReveal = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export const getRevealed = () => revealed;
export const getServerRevealed = () => false;

/** Every placeholder carries this attribute until its section has rendered */
export const PENDING = "[data-lazy-pending]";
const hasPending = () => typeof document !== "undefined" && !!document.querySelector(PENDING);

/** Fired on window each time a placeholder gives way to its section */
export const LAZY_MOUNTED = "sensei:lazy-mounted";

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Mount every lazy section; resolves once none is still loading (max 4 s). */
export async function revealAll(): Promise<void> {
  if (!revealed) {
    revealed = true;
    listeners.forEach((l) => l());
  }
  const start = performance.now();
  while (hasPending() && performance.now() - start < 4000) await nextFrame();
  await nextFrame();
}
