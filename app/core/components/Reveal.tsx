"use client";

/*
 * Reveal.tsx — scroll reveal, entirely in CSS
 * Author: Ahmed Emad Nasr
 *
 * A replacement for MotionInView. The same visual result at a completely
 * different cost.
 *
 * ═══ WHY ═══
 *
 * framer-motion's `whileInView` creates **an IntersectionObserver per
 * element**, and each element also subscribes to the animation engine and
 * is moved from JavaScript frame by frame. The site had 35 usages, and the
 * gallery alone renders up to 50 items — 50 observers and 50 engine
 * subscriptions, all running on the main thread during scroll.
 *
 * This file uses:
 *   · **one observer** for the whole page, shared by every element
 *   · CSS `animation` for the motion itself — run on the compositor
 *
 * JavaScript's job shrinks to one thing: flip an attribute once, when the
 * element enters the viewport. After that the browser takes over. Zero
 * per-frame work.
 *
 * And the motion is the hero's `fadeInUp` — same distance (24px), same
 * easing (--motion-ease), same stagger logic. The difference is that it is
 * now available site-wide instead of hand-written in sensei-home.module.css.
 *
 * ═══ WHY ONLY opacity AND transform ═══
 *
 * They are the only two properties the browser animates on the compositor
 * with no layout and no paint. Anything else — height, margin, filter, even
 * background-color — forces a recalculation every frame.
 *
 * That rule is not a preference; it is the reason this animation is
 * genuinely free on mobile.
 */

import React, { memo, useEffect, useRef } from "react";

export type RevealVariant =
  | "up"      // The default — the hero's fadeInUp
  | "down"
  | "left"
  | "right"
  | "fade"    // opacity only — the cheapest one
  | "scale";

/* ═══ The shared observer ═══
 *
 * One for the whole page. Created on first use and kept — creating and
 * tearing down an observer on every mount costs more than leaving one
 * alive.
 *
 * The negative `rootMargin` at the bottom means an element counts as
 * "visible" once it is 12% of the viewport height inside, rather than the
 * instant it touches the edge. Without it the animation finishes before
 * the visitor has looked at the element.
 */
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.dataset.reveal = "in";
        // Once and only once. `once: false` meant every element replayed
        // its animation each time it re-entered the viewport — continuous
        // animation work for the whole scroll on a long page.
        observer.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  return sharedObserver;
}

/*
 * Tells the CSS that JavaScript is running.
 *
 * The initial state (opacity: 0) is written into the server-rendered HTML.
 * If the bundle failed to load for any reason, the site would have stayed
 * **completely hidden**.
 *
 * The CSS safety net: for as long as `data-reveal-ready` is absent from
 * <html>, an animation reveals everything after 4 seconds. The moment this
 * component runs it sets the attribute, the rule stops matching, and it
 * never fires.
 *
 * So: JavaScript running → scroll reveal. JavaScript broken → everything
 * appears on its own. There is no state in which the site stays empty.
 */
function markReady() {
  document.documentElement.dataset.revealReady = "1";
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: RevealVariant;
  /** Delay in milliseconds before the animation starts */
  delay?: number;
  /** Which element to render. Defaults to div — use li/section as the
      surrounding markup requires. */
  as?: "div" | "section" | "article" | "li" | "header" | "figure";
  /*
   * React.HTMLAttributes has no data-* members, and TypeScript only waives
   * unknown data-* props on intrinsic elements — not on custom components.
   * Without this, callers passing data-fx would fail `npm run type-check`.
   */
  [key: `data-${string}`]: string | undefined;
} & Omit<React.HTMLAttributes<HTMLElement>, "style">;

const Reveal = memo(function Reveal({
  children,
  className,
  style,
  variant = "up",
  delay,
  as: Tag = "div",
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    markReady();

    const el = ref.current;
    if (!el) return;

    /*
     * `data-tier` is written onto <html> by an inline script in <head>
     * before first paint. If it is absent the script failed — show the
     * content immediately rather than betting on an animation.
     */
    const tier = document.documentElement.dataset.tier;
    if (!tier) {
      el.dataset.reveal = "in";
      return;
    }

    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      data-reveal="pending"
      data-reveal-variant={variant}
      style={
        delay
          ? ({ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : style
      }
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Reveal;

/* ═══ RevealGroup ═══
 *
 * With a list, the common mistake is wrapping each item in its own
 * <Reveal> — which puts 50 elements from the gallery into the observer.
 *
 * This watches **the container only**, and the children stagger one after
 * another in CSS through the --i variable. One observer entry instead of
 * fifty, and exactly the same staggered look.
 *
 * `staggerMs` is capped: 50 items × 60ms = 3 seconds before the last one
 * appears. The CSS stops the stagger after the 12th child so long lists do
 * not turn into a wait.
 */
export const RevealGroup = memo(function RevealGroup({
  children,
  className,
  style,
  variant = "up",
  staggerMs = 60,
  as: Tag = "div",
  ...rest
}: RevealProps & { staggerMs?: number }) {
  return (
    <Reveal
      as={Tag}
      variant={variant}
      className={className}
      style={{ ...style, "--reveal-stagger": `${staggerMs}ms` } as React.CSSProperties}
      data-reveal-group="true"
      {...rest}
    >
      {React.Children.map(children, (child, i) =>
        React.isValidElement<{ style?: React.CSSProperties }>(child)
          ? React.cloneElement(child, {
              style: { ...(child.props.style ?? {}), "--i": i } as React.CSSProperties,
            })
          : child,
      )}
    </Reveal>
  );
});
