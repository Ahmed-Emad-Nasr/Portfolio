"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/app/core/theme/fx";

/* Timings (ms) — type, read, erase, breathe, next */
const TYPE = 70;
const ERASE = 35;
const HOLD = 1800;
const GAP = 350;

/**
 * The jobs typed one after another under the name, like the old site's hero.
 *
 * - The server renders the first role in full, so the first paint already
 *   says something and the line never jumps (its height is fixed).
 * - The animated text is aria-hidden; the whole list is in the markup once
 *   as real text, so screen readers and crawlers get every role instead of
 *   whichever one happened to be on screen.
 * - It pauses while the hero is off screen or the tab is hidden, and with
 *   reduced motion it shows the plain list.
 */
export function RoleTicker({ roles, className = "" }: { roles: string[]; className?: string }) {
  const [text, setText] = useState(roles[0] ?? "");
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const longest = Math.max(...roles.map((r) => r.length));

  useEffect(() => {
    if (roles.length < 2) return;
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (ref.current) io.observe(ref.current);

    let role = 0;
    let shown = roles[0].length;
    let phase: "hold" | "erase" | "type" = "hold";
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!visible || document.hidden) {
        timer = setTimeout(tick, 400);
        return;
      }
      const word = roles[role];
      if (phase === "hold") {
        phase = "erase";
        timer = setTimeout(tick, ERASE);
      } else if (phase === "erase") {
        shown -= 1;
        setText(word.slice(0, shown));
        if (shown > 0) {
          timer = setTimeout(tick, ERASE);
        } else {
          role = (role + 1) % roles.length;
          phase = "type";
          timer = setTimeout(tick, GAP);
        }
      } else {
        shown += 1;
        setText(roles[role].slice(0, shown));
        if (shown < roles[role].length) {
          timer = setTimeout(tick, TYPE);
        } else {
          phase = "hold";
          timer = setTimeout(tick, HOLD);
        }
      }
    };
    timer = setTimeout(tick, HOLD + 1200); // let the hero entrance finish first

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [roles]);

  return (
    <p ref={ref} className={`font-mono font-bold uppercase tracking-[0.18em] ${className}`}>
      <span className="sr-only">{roles.join(", ")}</span>
      {reduced ? (
        <span aria-hidden="true" className="text-foreground/80">
          <span className="text-primary">&gt; </span>
          {roles.join(" · ")}
        </span>
      ) : (
        /* Sized to the longest role, so a centred line (phones) types from a
           fixed left edge instead of growing out of its middle */
        <span
          aria-hidden="true"
          className="inline-flex h-[1.6em] max-w-full items-center overflow-hidden whitespace-nowrap text-left"
          style={{ width: `calc(${longest + 3} * (1ch + 0.18em))` }}
        >
          <span className="text-primary">&gt;&nbsp;</span>
          <span className="text-foreground/85">{text}</span>
          <span className="ml-1 inline-block h-[1.1em] w-[0.55em] bg-primary animate-[caret-blink_1s_step-end_infinite]" />
        </span>
      )}
    </p>
  );
}
