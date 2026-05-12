"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Optimized by: Performance audit & animation system refactor
 *
 * Changes:
 * - Added `prefers-reduced-motion` support (accessibility + perf on low-end devices)
 * - Extracted variants outside component to avoid re-creation on every render
 * - Added `layoutId` passthrough for shared layout animations
 * - New `variant` prop: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "stagger-child"
 * - `staggerChildren` + `delayChildren` on parent via "stagger" preset
 * - All transforms use GPU-composited properties only (opacity + transform, no layout-triggering props)
 * - `will-change: transform, opacity` injected via style for paint optimization
 * - `margin` and `amount` tuned for a calmer reveal cadence instead of instant pop-in
 */

import React, { memo, useMemo } from "react";
import { motion, MotionProps, Variants, useReducedMotion } from "framer-motion";

// ---------------------------------------------------------------------------
// 1. Easing & spring — defined ONCE at module level (zero GC pressure)
// ---------------------------------------------------------------------------

const CINEMATIC_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const MOTION_DURATIONS = {
  short: 0.32,
  medium: 0.42,
  long: 0.55,
} as const;

const SPRING_FAST = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 1,
} as const;

const SPRING_GENTLE = {
  type: "spring",
  stiffness: 180,
  damping: 26,
  mass: 1.05,
} as const;

// ---------------------------------------------------------------------------
// 2. Variant library — all GPU-safe (opacity + transform only)
// ---------------------------------------------------------------------------

export const motionVariants = {
  /** Simple opacity reveal — lightest possible */
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.short, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /** Classic slide-up + fade (most common for sections) */
  "slide-up": {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRING_FAST, delay: 0.04 },
    },
  } satisfies Variants,

  /** Slide from left */
  "slide-left": {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_FAST, delay: 0.04 } },
  } satisfies Variants,

  /** Slide from right */
  "slide-right": {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_FAST, delay: 0.04 } },
  } satisfies Variants,

  /** Subtle scale pop — good for cards & images */
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { ...SPRING_FAST, delay: 0.04 },
    },
  } satisfies Variants,

  /**
   * Stagger parent — wrap a list with this, children get staggered automatically.
   * Children should use `stagger-child` variant (or any variant with "hidden"/"visible").
   */
  stagger: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.04,
      },
    },
  } satisfies Variants,

  /** Stagger child — pair with "stagger" parent */
  "stagger-child": {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRING_FAST, delay: 0.04 },
    },
  } satisfies Variants,
} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// ---------------------------------------------------------------------------
// 3. Reduced-motion fallback — respects OS accessibility settings
//    On low-end/battery-saving devices this also improves performance.
// ---------------------------------------------------------------------------

const REDUCED_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.02 } },
};

// ---------------------------------------------------------------------------
// 4. Component types
// ---------------------------------------------------------------------------

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;

  /**
   * Shorthand for picking a built-in variant set.
   * Ignored if you pass a custom `variants` prop.
   * @default "slide-up"
   */
  variant?: MotionVariantKey;

  /**
   * Pass custom Framer Motion variants directly.
   * Overrides the `variant` shorthand.
   */
  variants?: Variants;

  /**
   * Delay before the animation starts (seconds).
   * Useful for staggering sibling elements manually.
   */
  delay?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

// ---------------------------------------------------------------------------
// 5. Component
// ---------------------------------------------------------------------------

const MotionInView = memo<MotionInViewProps>(
  ({
    children,
    className,
    style,
    variant = "slide-up",
    variants,
    delay,
    initial,
    whileInView,
    viewport,
    transition,
    ...rest
  }) => {
    const prefersReducedMotion = useReducedMotion();

    // Merge will-change into style once — avoids inline object creation per render
    const mergedStyle = useMemo<React.CSSProperties>(
      () => ({ willChange: "transform, opacity", ...style }),
      [style]
    );

    // Resolve which variants to use — custom > shorthand > default
    const resolvedVariants = variants ?? (prefersReducedMotion ? REDUCED_VARIANTS : motionVariants[variant]);

    // If user passed a delay, we need to inject it into the "visible" transition
    const resolvedTransition = useMemo(() => {
      if (!delay) return transition;
      return { ...(transition ?? {}), delay };
    }, [delay, transition]);

    return (
      <motion.div
        className={className}
        style={mergedStyle}
        initial={initial ?? "hidden"}
        whileInView={whileInView ?? "visible"}
        viewport={
          viewport ?? {
            once: true,       // animate only once — no re-triggering on scroll up
            amount: 0.12,     // start a little earlier so it feels snappier
            margin: "0px 0px -4% 0px",
          }
        }
        transition={resolvedTransition}
        variants={resolvedVariants}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

MotionInView.displayName = "MotionInView";
export default MotionInView;

// ---------------------------------------------------------------------------
// USAGE EXAMPLES
// ---------------------------------------------------------------------------
//
// Basic (default slide-up):
//   <MotionInView><HeroSection /></MotionInView>
//
// Fade only:
//   <MotionInView variant="fade"><Card /></MotionInView>
//
// Scale pop on card:
//   <MotionInView variant="scale"><ProductCard /></MotionInView>
//
// Slide from right with delay:
//   <MotionInView variant="slide-right" delay={0.2}><Image /></MotionInView>
//
// Staggered list:
//   <MotionInView variant="stagger">
//     {items.map(item => (
//       <MotionInView key={item.id} variant="stagger-child">
//         <Item {...item} />
//       </MotionInView>
//     ))}
//   </MotionInView>
//
// Custom variants (full control):
//   <MotionInView variants={myCustomVariants}><Whatever /></MotionInView>