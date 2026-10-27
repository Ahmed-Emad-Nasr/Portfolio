/*
 * lib/perf/schedule.ts — WHEN background work runs, and the page-wide
 * switches the rest of lib/perf/ shares. No React here.
 *
 *   whenIdle(task)     One queue for background work (preloading lazy
 *                      sections' code, pre-rendering deferred sections).
 *                      ONE task at a time, and only when the page has
 *                      loaded, the browser reports idle time, nobody has
 *                      scrolled, wheeled or swiped for 300 ms, and the tab
 *                      is visible — so background work never lands in a
 *                      frame the reader is scrolling through.
 *
 *   revealAll()        "Mount every lazy section now": a jump to an anchor
 *                      cannot wait for sections above the target to mount
 *                      as the reader nears them. Resolves once no
 *                      placeholder is left on the page.
 *
 *   measureDeferred()  Render never-rendered deferred sections
 *                      (content-visibility: auto) for one frame, so their
 *                      real height replaces the 1200px guess and the
 *                      browser keeps it.
 */

/* ── The idle queue ── */

type Task = () => unknown;

const queue: Task[] = [];
let lastScroll = 0;
let started = false;
let running = false;

const SCROLL_QUIET_MS = 300;
const START_AFTER_LOAD_MS = 1500;

const isScrolling = (): boolean => performance.now() - lastScroll < SCROLL_QUIET_MS;

type Deadline = { didTimeout: boolean; timeRemaining: () => number };
const requestIdle = (cb: (d: Deadline) => void): void => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 3000 });
  else window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 8 }), 120);
};

function next(): void {
  if (!queue.length) {
    running = false;
    return;
  }
  requestIdle(async () => {
    /* Busy (scrolling, hidden tab): look again a little later */
    if (document.hidden || isScrolling()) {
      window.setTimeout(next, SCROLL_QUIET_MS);
      return;
    }
    const task = queue.shift();
    try {
      await task?.();
    } catch {
      /* a failed preload is retried by the section itself when it is needed */
    }
    next();
  });
}

function pump(): void {
  if (!started || running || !queue.length) return;
  running = true;
  next();
}

function start(): void {
  if (started) return;
  for (const t of ["scroll", "wheel", "touchmove"] as const) {
    window.addEventListener(t, () => (lastScroll = performance.now()), { passive: true, capture: true });
  }
  const go = () =>
    window.setTimeout(() => {
      started = true;
      pump();
    }, START_AFTER_LOAD_MS);
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

/** Queue a small piece of background work (client only). */
export function whenIdle(task: Task): void {
  if (typeof window === "undefined") return;
  start();
  queue.push(task);
  pump();
}

/* ── The reveal switch ── */

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

/* ── Measuring deferred sections ── */

/** Render never-rendered deferred sections for one frame, so their real
 *  height replaces the guess (`contain-intrinsic-size: auto` keeps it). */
export async function measureDeferred(els: Element[]): Promise<void> {
  const todo = els.filter((el) => !el.hasAttribute("data-cv-measured"));
  if (!todo.length) return;
  todo.forEach((el) => el.setAttribute("data-cv-measure", ""));
  await nextFrame();
  await nextFrame();
  todo.forEach((el) => {
    el.removeAttribute("data-cv-measure");
    el.setAttribute("data-cv-measured", "");
  });
}
