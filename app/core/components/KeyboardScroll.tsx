"use client";

/*
 * core/components/KeyboardScroll.tsx
 *
 * ═══ The problem ═══
 *
 * Lenis handles the mouse wheel and touch. The keyboard **isn't** handled at all —
 * neither by Lenis nor by the site.
 *
 * So someone browsing with the keyboard gets the browser's native motion: an arrow
 * moves ~40px instantly with no smoothing, and Page Down jumps a full screen
 * at once. Next to the wheel motion that settles in a second, it feels like a completely
 * different site.
 *
 * And that's not a small group of people: screen-reader users, anyone who has difficulty
 * using a mouse, and anyone reading something long with their hands on the keyboard.
 *
 * ═══ The fix ═══
 *
 * This component catches the navigation keys and turns them into the same Lenis motion
 * the wheel gets.
 *
 * ═══ What it does **not** take over — which matters more than what it does ═══
 *
 * Hijacking keyboard keys is the fastest way to break a site, and the fastest way to break its accessibility.
 * The guards:
 *
 *  1. Any modifier (Ctrl / Cmd / Alt) → leave it. That keeps Ctrl+Home, browser commands
 *     and assistive shortcuts working as they are.
 *  2. Focus in an input / textarea / select / contenteditable → leave it.
 *  3. Focus inside a region that scrolls on its own (the terminal, the palette, the gallery
 *     modal) → leave it, so those lists keep scrolling.
 *  4. **Space** when focus is on a button, link or summary → leave it. Space
 *     is the standard activation key; hijacking it would stop half the site's buttons from working
 *     with the keyboard. This is the most dangerous one on the list.
 *  5. The user prefers reduced motion → keys still work, but with an instant jump.
 *
 * In all of these cases we **don't** call preventDefault, so the browser does
 * its native behaviour. The component steps aside, it doesn't disable anything.
 */

import { useEffect } from "react";
import {
  getLenis,
  isInScrollableRegion,
  isTypingTarget,
  prefersReducedMotion,
  scrollToY,
} from "@/app/core/utils/scroll";

/* Arrows take a small step; Page Up/Down take a screen minus a little so that
   a line or two stay shared between the two screens — that's what keeps the reader from losing their place. */
const ARROW_STEP = 120;
const PAGE_OVERLAP = 0.85;

/* A shorter duration than programmatic jumps: arrows get pressed in quick succession, and if each one
   took 1.6 seconds the motion would pile up and feel like it's lagging behind you. */
const KEY_DURATION = 0.7;

export default function KeyboardScroll() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (isInScrollableRegion(e.target)) return;

      /* If a <dialog> or any overlay has taken over the screen, it's not our business. */
      if (document.querySelector("dialog[open]")) return;

      const viewport = window.innerHeight;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const current = getLenis()?.scroll ?? window.scrollY;

      let target: number | null = null;

      switch (e.key) {
        case "ArrowDown":
          target = current + ARROW_STEP;
          break;
        case "ArrowUp":
          target = current - ARROW_STEP;
          break;
        case "PageDown":
          target = current + viewport * PAGE_OVERLAP;
          break;
        case "PageUp":
          target = current - viewport * PAGE_OVERLAP;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = max;
          break;
        case " ":
        case "Spacebar": {
          /* Guard number 4. If focus is on something activated by Space, this is
             activation, not scrolling — leave it to the browser. */
          const el = document.activeElement;
          if (
            el instanceof HTMLElement &&
            el.closest("a[href], button, [role='button'], summary, input, [tabindex]")
          ) {
            return;
          }
          target = current + viewport * PAGE_OVERLAP * (e.shiftKey ? -1 : 1);
          break;
        }
        default:
          return;
      }

      if (target === null) return;

      /* If we're already at the very bottom/top of the page, don't block the native behaviour — let
         the browser do its overscroll bounce. */
      const clamped = Math.min(max, Math.max(0, target));
      if (Math.abs(clamped - current) < 1) return;

      e.preventDefault();
      scrollToY(clamped, {
        duration: KEY_DURATION,
        immediate: prefersReducedMotion(),
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
