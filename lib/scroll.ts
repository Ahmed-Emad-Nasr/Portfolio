/*
 * lib/scroll.ts — every programmatic scroll goes through here, so it works
 * the same with Lenis (SmoothScroll registers it) or without it. Jumps are
 * instant by design.
 */

import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null): void {
  lenis = instance;
}

/** Height of the fixed header plus a little air (read from the DOM: it changes with breakpoints) */
function getHeaderOffset(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header='true']");
  return (header?.offsetHeight ?? 0) + 15;
}

function scrollToY(top: number): void {
  const target = Math.max(0, top);
  if (lenis) {
    /* Lenis clamps targets to the page height it last measured; lazy sections
       may have just made the page taller, so measure first */
    lenis.resize();
    lenis.scrollTo(target, { immediate: true });
    return;
  }
  window.scrollTo({ top: target, behavior: "auto" });
}

/** The scroll position that puts an element just under the fixed header */
export function scrollTargetOf(el: Element): number {
  return Math.max(0, window.scrollY + el.getBoundingClientRect().top - getHeaderOffset());
}

export function scrollToElement(el: Element | null): void {
  if (el) scrollToY(scrollTargetOf(el));
}

export function scrollToTop(): void {
  scrollToY(0);
}

/** Focus is in a field: keyboard shortcuts must not fire */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
}

/** Freeze page scrolling under a full-screen layer (the mobile menu). Lenis
    scrolls the root itself, so it is stopped too. */
export function lockScroll(locked: boolean): void {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  document.body.style.overflow = locked ? "hidden" : "";
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}
