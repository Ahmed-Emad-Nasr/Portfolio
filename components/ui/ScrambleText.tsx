"use client";

/*
 * ScrambleText — a label that "decrypts" the first time it scrolls into view:
 * every character cycles through hex/symbol noise and locks into place left
 * to right, like a terminal resolving a cipher.
 *
 *  · The server HTML holds the real text, so the first paint (and every
 *    crawler) reads the label as-is; nothing is hidden waiting for JS.
 *  · Screen readers get the real text once (sr-only); the animated copy is
 *    aria-hidden, so they never hear the noise.
 *  · Spaces, separators ("//", "·", "&") and Japanese never scramble, and the labels
 *    are set in the monospace font, so the line width never changes — no
 *    layout shift.
 *  · Runs once, only while visible, and not at all with reduced motion.
 */

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/fx";

const NOISE = "0123456789ABCDEF#$%&*<>/\\|=+";
/* Never scrambled: separators, and Japanese (double-width glyphs would
   change the line width while the noise runs) */
const FIXED = /[\s/·•&—:.,\-\u3000-\u9fff\uff00-\uffef]/;
const STEP_MS = 28;

export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  /* The noise is written straight into the span (textContent), not through
     React state: a re-render every 28 ms per header, while the page is
     scrolling, was React work for a purely visual effect. */
  const ref = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = out.current;
    if (!el || !target || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const setShown = (value: string) => {
      target.textContent = value;
    };

    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const total = text.length;
    /* ~3 noise frames per character, the lock-in sweeping left to right */
    const frames = Math.min(60, total * 2 + 10);

    const tick = () => {
      frame += 1;
      const locked = Math.floor((frame / frames) * total);
      let out = "";
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        out += i < locked || FIXED.test(ch) ? ch : NOISE[(Math.random() * NOISE.length) | 0];
      }
      setShown(out);
      if (frame < frames) timer = setTimeout(tick, STEP_MS);
      else setShown(text);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tick();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [text]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span ref={out} aria-hidden="true">{text}</span>
    </span>
  );
}
