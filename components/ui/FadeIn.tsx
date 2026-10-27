"use client";

/*
 * FadeIn — the site's entrance: fade + slide, once, when the element is ~15%
 * into the screen. `as` keeps the real tag (li, nav, figure …).
 *
 *  · Elements entering in the same frame start top to bottom, 110 ms apart.
 *  · opacity + transform (not framer's x/y) so the browser runs them off the
 *    main thread (WAAPI) and a cascade never stutters the scroll.
 */

import { m, useAnimationControls } from "framer-motion";
import { useRef, type ComponentProps } from "react";

type Tag = "div" | "li" | "ul" | "ol" | "dl" | "nav" | "header" | "figure" | "span" | "section" | "p" | "article" | "aside" | "footer" | "button" | "a" | "h1" | "h2" | "h3" | "h4";

type FadeInProps = Omit<ComponentProps<typeof m.div>, "initial" | "animate" | "whileInView" | "viewport" | "transition" | "ref"> & {
  as?: Tag;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  /* attributes some tags take (a, button) */
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  popoverTarget?: string;
};

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const travel = (v: number, k: number) => (v ? Math.sign(v) * Math.min(Math.abs(v) * k, 56) : 0);

/* Entrances that start in the same frame, played top to bottom */
let batch: { el: Element; play: (order: number) => void }[] = [];
function enqueue(el: Element | null, play: (order: number) => void) {
  if (!el) return play(0);
  if (!batch.length) {
    requestAnimationFrame(() => {
      const now = batch;
      batch = [];
      now.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      now.forEach((item, order) => item.play(order));
    });
  }
  batch.push({ el, play });
}

export default function FadeIn({ as = "div", x = 0, y = 24, scale = 1, duration = 0.7, delay = 0, ...rest }: FadeInProps) {
  const Element = m[as] as typeof m.div;
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  return (
    <Element
      ref={ref}
      initial={{ opacity: 0, transform: `translate(${travel(x, 1.4)}px, ${travel(y, 1.8)}px) scale(${scale})` }}
      animate={controls}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      onViewportEnter={() =>
        enqueue(ref.current, (order) => {
          const tempo = window.innerWidth < 768 ? 0.8 : 1;
          void controls.start({
            opacity: 1,
            transform: "translate(0px, 0px) scale(1)",
            transition: {
              duration: clamp(duration * 1.6, 0.95, 1.35) * tempo,
              delay: (0.06 + Math.min(delay, 0.45) * 1.2 + Math.min(order, 7) * 0.11) * tempo,
              ease: EASE_OUT_QUART,
            },
          });
        })
      }
      {...rest}
    />
  );
}
