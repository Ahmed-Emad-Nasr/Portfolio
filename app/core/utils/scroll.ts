/*
 * core/utils/scroll.ts
 *
 * ═══ Why this file exists ═══
 *
 * The site has 6 places that call `window.scrollTo` themselves:
 *
 *   header/sensei-header.tsx        behavior: "auto"    ← explicit jump
 *   blog_header/sensei-header.tsx   behavior: "auto"    ← explicit jump
 *   CommandPalette.tsx (×2)         behavior: "smooth"
 *   CommandPaletteMount.tsx (×2)    behavior: "smooth"
 *   BackToTop.tsx                   behavior: "smooth"
 *
 * These **work** — Lenis doesn't break them. Checked against the lenis@1.3.23 source:
 * `onNativeScroll` sees that `isScrolling` wasn't triggered by Lenis itself, so it syncs
 * its internal state with the real position (`animatedScroll = targetScroll =
 * actualScroll`) and marks itself `isScrolling = "native"`. So it follows
 * the browser instead of fighting it.
 *
 * (And lenis.css in this version does **not** contain `scroll-behavior: auto
 * !important` — that rule was in older versions. If you read that claim
 * somewhere else, check your version first.)
 *
 * ═══ So what's the real problem ═══
 *
 * Not that they break. The problem is that the site has **two different motions**:
 *
 *   Wheel    →  Lenis, lerp 0.045       — slow, settles in ~1 second
 *   Buttons  →  the browser's smooth    — fixed curve, ~300ms, not
 *                                          adjustable at all
 *   Nav      →  instant jump
 *
 * So the page glides down slowly under your hand, then you press a button and it "snaps". Three
 * different feels on one site.
 *
 * And there's no way to tune the browser's native motion — there's no duration or
 * easing in the `scrollTo` spec. The only way to control it is to go through
 * a single engine.
 *
 * This file is that single source. Anything that wants to move the page goes through here,
 * and it decides: Lenis if present, otherwise the browser's native motion.
 */

import type Lenis from "lenis";

/* The instance is registered by SmoothScroll inside <ReactLenis>. It stays null
   on the server, and the functions below fall back to native behaviour. */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  lenis = instance;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Height of the fixed header + breathing room.
 *
 * The header is `position: fixed`, so any scroll target must subtract its height or
 * the heading ends up hidden underneath it. The number is read from the DOM, not hard-coded, because
 * the height changes with --ui-scale and with the breakpoints.
 */
function getHeaderOffset(): number {
  if (typeof document === "undefined") return 0;
  const header = document.querySelector<HTMLElement>("[data-site-header='true']");
  return (header?.offsetHeight ?? 0) + 15;
}

type ScrollOpts = {
  /** Seconds. Ignored if the user prefers reduced motion. */
  duration?: number;
  offset?: number;
  /** Jump instantly without any motion. */
  immediate?: boolean;
};

/*
 * The default easing curve — expo-out.
 *
 * Starts fast and stops very gently. That's what matters here: the slow ending is what
 * gives the feeling that the page "settles" rather than brakes, and it gives the images below
 * the fold time to finish loading before they reach the middle of the screen.
 */
const EASE_OUT_EXPO = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/*
 * Note: this curve is the same as --motion-ease-out in globals.css
 * (cubic-bezier(0.16, 1, 0.3, 1) approximates expo-out). The two must
 * stay in sync — scrolling and reveals are seen together, and with two different
 * curves the motion looks disjointed.
 */

/** Default duration for any programmatic jump (button, shortcut, nav link). */
const SCROLL_DURATION = 2.1;

/** Scroll the page to a given vertical coordinate. */
function scrollToY(top: number, opts: ScrollOpts = {}): void {
  if (typeof window === "undefined") return;

  const immediate = opts.immediate || prefersReducedMotion();
  const target = Math.max(0, top);

  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      duration: opts.duration ?? SCROLL_DURATION,
      easing: EASE_OUT_EXPO,
      offset: opts.offset ?? 0,
      /* If the user touches the wheel mid-way, let them — a programmatic jump isn't more important than
         their intent. Without this the page fights their finger. */
      lock: false,
    });
    return;
  }

  /* No Lenis: the device is weak or the tier prevented mounting it. The browser's native
     motion is the right call here — it runs on the compositor, so it's cheaper than anything
     we could write in JavaScript. There's no control over its duration, but on a weak device that's
     not a flaw — it's the goal. */
  window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
}

/** Scroll the page to an element, accounting for the fixed header. */
export function scrollToElement(el: Element | null, opts: ScrollOpts = {}): void {
  if (!el || typeof window === "undefined") return;
  const top = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset();
  scrollToY(top, opts);
}

/** Scroll to the top of the page. */
export function scrollToTop(opts: ScrollOpts = {}): void {
  scrollToY(0, opts);
}

/**
 * Is focus currently in something you type into?
 *
 * Every keyboard shortcut must check this first. Without it, the down arrow inside a search
 * field scrolls the page instead of moving the caret — which breaks the field completely.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Freeze or release page scrolling while a full-screen layer is open (the
 * mobile menu). `overflow: hidden` on <body> alone does not stop Lenis — it
 * scrolls the root itself — so both are switched together. Layers that must
 * still scroll inside carry data-lenis-prevent.
 */
export function lockScroll(locked: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}
