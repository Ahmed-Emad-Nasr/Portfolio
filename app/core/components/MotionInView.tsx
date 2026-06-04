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

import React, { memo, useRef, useMemo } from "react";
import { motion, MotionProps, Variants, useReducedMotion } from "framer-motion";

// ---------------------------------------------------------------------------
// 1. Easing & spring — defined ONCE at module level (zero GC pressure)
// ---------------------------------------------------------------------------

const CINEMATIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MOTION_DURATIONS = {
  short: 0.75,
  medium: 1.1,
  long: 1.6,
} as const;

const SPRING_FAST = {
  type: "spring",
  stiffness: 80,
  damping: 20,
  mass: 1.2,
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRING_FAST, delay: 0.08 },
    },
  } satisfies Variants,

  /** Slide from left */
  "slide-left": {
    hidden: { opacity: 0, x: -55 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_FAST, delay: 0.08 } },
  } satisfies Variants,

  /** Slide from right */
  "slide-right": {
    hidden: { opacity: 0, x: 55 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_FAST, delay: 0.08 } },
  } satisfies Variants,

  /** Subtle scale pop — good for cards & images */
  scale: {
    hidden: { opacity: 0, scale: 0.88 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { ...SPRING_FAST, delay: 0.08 },
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
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  } satisfies Variants,

  /** Stagger child — pair with "stagger" parent */
  "stagger-child": {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...SPRING_FAST, delay: 0.08 },
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
  visible: { opacity: 1, transition: { duration: 0.01 } },
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

    // Remove will-change after animation completes to free GPU memory
    const mergedStyle = useMemo<React.CSSProperties>(
      () => ({ ...style }),
      [style]
    );

    // Resolve which variants to use — custom > shorthand > default
    const resolvedVariants = variants ?? (prefersReducedMotion ? REDUCED_VARIANTS : motionVariants[variant]);

    // If user passed a delay, we need to inject it into the "visible" transition
    const resolvedTransition = useMemo(() => {
      if (!delay) return transition;
      return { ...(transition ?? {}), delay };
    }, [delay, transition]);

    const ref = useRef<HTMLDivElement>(null);

    return (
      <motion.div
        ref={ref}
        className={className}
        style={{ willChange: "transform, opacity", ...mergedStyle }}
        initial={initial ?? "hidden"}
        whileInView={whileInView ?? "visible"}
        onAnimationComplete={() => {
          if (ref.current) ref.current.style.willChange = "auto";
        }}
        viewport={
          viewport ?? {
            once: true,
            amount: 0.08,
            margin: "0px 0px -2% 0px",
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