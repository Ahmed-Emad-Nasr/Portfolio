"use client";

/*
 * OffscreenAnimations — pauses the looping animations of every block that
 * is off screen, and resumes them just before it scrolls back in.
 *
 * The pages run dozens of infinite animations at once (hero particles and
 * scan line, live pings, the lab diagram's packets, the radar, the siren,
 * blinking carets …), and almost all of them sit far from the screen. Each
 * one still costs style, composite or paint work every frame.
 *
 * Only animations that loop forever are touched; one-shot entrances and
 * scroll-driven animations are left alone, so nothing looks different.
 *
 * How, cheaply (getAnimations() on every block change forces a style
 * recalculation each time):
 *
 *   · Loops are marked ONCE, when they start: an `animationstart` listener
 *     checks the element's animation-iteration-count and tags it
 *     data-loop (or data-loop-before / data-loop-after for a pseudo-element).
 *     An element that also runs a one-shot is never tagged, so its entrance
 *     plays as usual. Loops already running at start-up are tagged by one
 *     scan in idle time.
 *   · Blocks are watched by an IntersectionObserver whose callback only sets
 *     or removes one attribute, data-offscreen, on the block.
 *   · globals.css pauses tagged loops inside an off-screen block. CSS stays in
 *     charge of the play state, so hover or reduced-motion rules keep working.
 *   · Script loops (framer-motion's repeat: Infinity, which runs as WAAPI)
 *     have no animationstart; they are found by the idle scan and paused
 *     and played through the Animation API.
 *
 * The blocks are every top-level <section>, plus any child of <main> written
 * as a plain div. Lazy sections are picked up as they mount, and every page
 * is rescanned after navigation.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LAZY_MOUNTED, whenIdle } from "@/lib/perf/schedule";

const OFF = "data-offscreen";
const LOOP = { "": "data-loop", "::before": "data-loop-before", "::after": "data-loop-after" } as const;

/* Resume a little before the block is on screen, so a loop is already
   moving when it comes into view */
const MARGIN = "200px 0px 200px 0px";

/* Tag an element whose animations (on that box) all loop forever. Every
   animationstart lands here (one-shots too: 52 rule rows, 123 ATT&CK cells),
   so the answer is remembered per animation name — getComputedStyle runs
   once per kind of animation, not once per element. */
const verdict = new Map<string, boolean>();
function tagIfLoop(el: Element, pseudo: string, name?: string): void {
  const attr = LOOP[pseudo as keyof typeof LOOP];
  if (!attr || el.hasAttribute(attr)) return;
  const key = name ? `${name}${pseudo}` : "";
  let loops = key ? verdict.get(key) : undefined;
  if (loops === undefined) {
    const counts = getComputedStyle(el, pseudo || null).animationIterationCount.split(",").map((s) => s.trim());
    loops = counts.length > 0 && counts.every((c) => c === "infinite");
    if (key) verdict.set(key, loops);
  }
  if (loops) el.setAttribute(attr, "");
}

export default function OffscreenAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observed = new Set<Element>();
    /* Script-driven loops (WAAPI), by the block they live in */
    const scriptLoops = new Map<Element, Animation[]>();

    const setOff = (unit: Element, off: boolean) => {
      if (off) unit.setAttribute(OFF, "");
      else unit.removeAttribute(OFF);
      scriptLoops.get(unit)?.forEach((a) => {
        if (off && a.playState === "running") a.pause();
        else if (!off && a.playState === "paused") a.play();
      });
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setOff(e.target, !e.isIntersecting)),
      { rootMargin: MARGIN },
    );

    const unitOf = (el: Element | null) => {
      for (let e = el; e; e = e.parentElement) if (observed.has(e)) return e;
      return null;
    };

    /* Tag CSS loops as they start (a deferred section rendering for the
       first time, a lazy section mounting, a class toggled on) */
    const onStart = (ev: AnimationEvent) => tagIfLoop(ev.target as Element, ev.pseudoElement ?? "", ev.animationName);

    /* One pass over what is already running: CSS loops that started before
       this listener existed, and script loops (no animationstart for those) */
    const sweep = () => {
      if (typeof document.getAnimations !== "function") return;
      for (const a of document.getAnimations()) {
        if (a.effect?.getComputedTiming().iterations !== Infinity) continue;
        const fx = a.effect as KeyframeEffect | null;
        const target = fx?.target;
        if (!target) continue;
        if (typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation) {
          tagIfLoop(target, fx.pseudoElement ?? "", a.animationName);
          continue;
        }
        const unit = unitOf(target);
        if (!unit) continue;
        const list = scriptLoops.get(unit) ?? [];
        if (!list.includes(a)) list.push(a);
        scriptLoops.set(unit, list);
        if (unit.hasAttribute(OFF) && a.playState === "running") a.pause();
      }
    };

    /* The page's blocks: every top-level <section>, plus each direct child
       of <main> that holds no section (a block written as a plain div) */
    const scan = () => {
      const units = [
        ...[...document.querySelectorAll("section")].filter((s) => !s.parentElement?.closest("section")),
        ...[...document.querySelectorAll("#main-content > *")].filter((el) => el.tagName !== "SECTION" && !el.querySelector("section")),
      ];
      units.forEach((s) => {
        if (observed.has(s) || s.tagName === "SCRIPT") return;
        observed.add(s);
        io.observe(s);
      });
    };
    const onMounted = () => {
      scan();
      whenIdle(sweep);
    };

    document.addEventListener("animationstart", onStart, true);
    scan();
    whenIdle(sweep);
    window.addEventListener(LAZY_MOUNTED, onMounted);
    return () => {
      document.removeEventListener("animationstart", onStart, true);
      window.removeEventListener(LAZY_MOUNTED, onMounted);
      io.disconnect();
      observed.forEach((u) => setOff(u, false));
    };
  }, [pathname]);

  return null;
}
