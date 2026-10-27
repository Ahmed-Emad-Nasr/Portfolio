/*
 * core/perf/idle.ts — one queue for background work.
 *
 * Downloading the lazy sections' code ahead of time and pre-rendering the
 * deferred sections both cost something. Run at the wrong moment — while the
 * reader is scrolling — that cost is a dropped frame. So every such task
 * goes through this queue, which runs ONE task at a time and only when:
 *
 *   · the page has finished loading (and the intro has had its time),
 *   · the browser reports idle time (requestIdleCallback),
 *   · nobody has scrolled, wheeled or swiped for 300 ms,
 *   · the tab is visible.
 *
 * Tasks are small by design (one chunk, one section), so even an unlucky
 * one never blocks for long.
 */

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
