"use client";

/*
 * File: MotionInView.tsx
 * PERF BUILD:
 * - Replaced full `motion` with `m` and `<LazyMotion>`.
 * - This trims unused Framer Motion features (drag/pan/layout) out of what
 *   gets bundled with `m.div`, compared to importing `motion.div` directly.
 *   NOTE: `domAnimation` below is still a *static* import, so this alone
 *   does not create a separate async chunk — see the note near the bottom
 *   of this file if you want genuine code-splitting.
 * - `once: false` kept as requested.
 * - a11y: now respects prefers-reduced-motion via Framer Motion's own
 *   `useReducedMotion()` hook — reduced-motion users get a plain opacity
 *   fade instead of sliding/scaling content around the screen.
 */

import React, { memo } from "react";
// 👇 تغيير جذري هنا: استيراد m و LazyMotion و domAnimation
import { m, LazyMotion, domAnimation, MotionProps, Variants, useReducedMotion } from "framer-motion";

export const motionVariants = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "slide-up": { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } },
  "slide-down": { hidden: { opacity: 0, y: -25 }, visible: { opacity: 1, y: 0 } },
  "slide-left": { hidden: { opacity: 0, x: -25 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 25 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
  "scale-up": { hidden: { opacity: 0, scale: 0.96, y: 10 }, visible: { opacity: 1, scale: 1, y: 0 } },
  "blur-in": { hidden: { opacity: 0 }, visible: { opacity: 1 } }, 
  reveal: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "reveal-left": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  float: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "text-stagger": { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } },
  "text-word": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  stagger: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
  "stagger-child": { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  glitch: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  typewriter: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "scan-line": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// Stable reference — a default *parameter* object literal (e.g.
// `viewport = { once: false, amount: 0.05 }` written inline below) gets
// re-created on every render with a new identity even though its contents
// never change. Hoisting it here means every instance shares one reference.
const DEFAULT_VIEWPORT = { once: false, amount: 0.05 };

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children:          React.ReactNode;
  className?:        string;
  style?:            React.CSSProperties;
  variant?:          MotionVariantKey;
  variants?:         Variants;
  delay?:            number;
  enableExit?:       boolean;
  tilt?:             boolean; 
  magnetic?:         boolean; 
  magneticStrength?: number;  
  autoStagger?:      boolean; 
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

const MotionInView = memo<MotionInViewProps>(({
  children,
  className,
  style,
  variant = "slide-up",
  variants,
  delay,
  enableExit = false,
  viewport = DEFAULT_VIEWPORT,
  tilt, magnetic, magneticStrength, autoStagger,
  ...rest
}) => {
  // a11y: when the OS-level "reduce motion" setting is on, fall back to a
  // plain fade instead of whatever slide/scale the caller asked for.
  const shouldReduceMotion = useReducedMotion();
  const resolvedVariants = shouldReduceMotion
    ? (motionVariants.fade as Variants)
    : (variants ?? (motionVariants[variant] as Variants));

  return (
    // 👇 تغليف العنصر بـ LazyMotion وتمرير الـ domAnimation (أخف نسخة)
    <LazyMotion features={domAnimation} strict>
      {/* 👇 استبدال motion.div بـ m.div */}
      <m.div
        className={className}
        style={style}
        initial="hidden"
        whileInView="visible"
        exit={enableExit ? "exit" : undefined}
        viewport={viewport}
        variants={resolvedVariants}
        transition={delay ? { delay } : undefined}
        {...rest}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
});

MotionInView.displayName = "MotionInView";

export default MotionInView;
// 👇 تصدير الـ AnimatePresence لو كنت بتستخدمها في حتة تانية
export { AnimatePresence } from "framer-motion";

/*
 * OPTIONAL — genuine async code-splitting:
 * `domAnimation` above is a static import, so it ships in whatever chunk
 * this file ends up in — it is not actually deferred. For a real separate
 * chunk that only downloads once a MotionInView instance mounts, Framer
 * Motion's LazyMotion accepts a loader function instead of a static value:
 *
 *   const loadFeatures = () =>
 *     import("framer-motion/dom").then((mod) => mod.domAnimation);
 *   ...
 *   <LazyMotion features={loadFeatures} strict>
 *
 * Left as static here since switching it changes bundle/chunk behavior
 * app-wide — worth testing before flipping in case something else in the
 * app already assumes this loads synchronously.
 */