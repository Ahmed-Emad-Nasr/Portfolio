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
 * - New `variant` prop: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "stagger-child" | "blur-in"
 * - `staggerChildren` + `delayChildren` on parent via "stagger" preset
 * - All transforms use GPU-composited properties only (opacity + transform)
 * - `will-change` cleared via ref after animation completes
 * - Exit animations via `exit` state on variants (opt-in with `enableExit`)
 * - Blur-in effect (opt-in via variant="blur-in" — uses filter, paint cost, not default)
 * - 3D tilt on scroll (opt-in via `tilt` prop — disabled on touch devices automatically)
 * - Stagger auto-detection: if children count > 1 and variant="stagger" not set, auto-stagger
 */

import React, {
  Children,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionProps,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
  useReducedMotion,
} from "framer-motion";

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

// Spring config for 3D tilt — very gentle, high damping
const TILT_SPRING = { stiffness: 120, damping: 28, mass: 0.8 };

// ---------------------------------------------------------------------------
// 2. Variant library — GPU-safe unless noted
// ---------------------------------------------------------------------------

export const motionVariants = {
  /** Simple opacity reveal — lightest possible */
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.short, ease: CINEMATIC_EASE } },
    exit:   { opacity: 0, transition: { duration: MOTION_DURATIONS.short, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /** Classic slide-up + fade */
  "slide-up": {
    hidden:  { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, y: 30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /** Slide from left */
  "slide-left": {
    hidden:  { opacity: 0, x: -55 },
    visible: { opacity: 1, x: 0,   transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, x: -30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /** Slide from right */
  "slide-right": {
    hidden:  { opacity: 0, x: 55 },
    visible: { opacity: 1, x: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, x: 30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /** Subtle scale pop — good for cards & images */
  scale: {
    hidden:  { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1,    transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.45, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  /**
   * Blur-in effect — element arrives from blurry to sharp.
   * ⚠️ PERF NOTE: filter:blur() is NOT GPU-composited — it triggers repaint
   * on every frame. Use sparingly (hero titles, featured images, not lists).
   * Automatically falls back to fade on prefers-reduced-motion.
   */
  "blur-in": {
    hidden:  { opacity: 0, filter: "blur(14px)",  scale: 1.04 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: MOTION_DURATIONS.medium, ease: CINEMATIC_EASE },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.98,
      transition: { duration: 0.5, ease: CINEMATIC_EASE },
    },
  } satisfies Variants,

  /**
   * Stagger parent — wrap a list, children are staggered automatically.
   * Or use autoStagger prop for zero-config staggering.
   */
  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
    exit:    { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
  } satisfies Variants,

  /** Stagger child — pair with "stagger" parent */
  "stagger-child": {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, y: 16, transition: { duration: 0.4, ease: CINEMATIC_EASE } },
  } satisfies Variants,
} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// ---------------------------------------------------------------------------
// 3. Reduced-motion fallback
// ---------------------------------------------------------------------------

const REDUCED_VARIANTS: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit:    { opacity: 0, transition: { duration: 0.01 } },
};

// ---------------------------------------------------------------------------
// 4. 3D Tilt — isolated hook, disabled on touch devices
//    Uses useSpring for buttery interpolation, no layout props.
// ---------------------------------------------------------------------------

function useTilt(enabled: boolean) {
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const active = enabled && !isTouchDevice;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]),  TILT_SPRING);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), TILT_SPRING);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width  - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return { active, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// 5. Stagger auto-detection helper
// ---------------------------------------------------------------------------

function resolveAutoStagger(
  children: React.ReactNode,
  autoStagger: boolean,
  variant: MotionVariantKey
): { wrapWithStagger: boolean } {
  if (!autoStagger || variant === "stagger" || variant === "stagger-child") {
    return { wrapWithStagger: false };
  }
  const count = Children.count(children);
  return { wrapWithStagger: count > 1 };
}

// ---------------------------------------------------------------------------
// 6. Component types
// ---------------------------------------------------------------------------

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;

  /**
   * Built-in variant preset.
   * @default "slide-up"
   */
  variant?: MotionVariantKey;

  /** Pass custom Framer Motion variants — overrides `variant`. */
  variants?: Variants;

  /** Delay before animation starts (seconds). */
  delay?: number;

  /**
   * Enable exit animation when element is unmounted.
   * Requires wrapping your component tree with <AnimatePresence>.
   * @default false
   */
  enableExit?: boolean;

  /**
   * Enable subtle 3D tilt on mouse hover.
   * ⚠️ Disabled automatically on touch devices.
   * @default false
   */
  tilt?: boolean;

  /**
   * If true and children count > 1, wraps children in a stagger parent
   * and applies "stagger-child" variant to each child automatically.
   * @default false
   */
  autoStagger?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

// ---------------------------------------------------------------------------
// 7. Component
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
    enableExit = false,
    tilt = false,
    autoStagger = false,
    ...rest
  }) => {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { active: tiltActive, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(tilt);

    // Resolve variants: custom > reduced-motion fallback > preset
    const resolvedVariants = variants ?? (
      prefersReducedMotion
        ? REDUCED_VARIANTS
        : motionVariants[variant]
    );

    // Inject delay into visible transition if provided
    const resolvedTransition = useMemo(() => {
      if (!delay) return transition;
      return { ...(transition ?? {}), delay };
    }, [delay, transition]);

    // Auto-stagger detection
    const { wrapWithStagger } = resolveAutoStagger(children, autoStagger, variant);

    // Perspective wrapper style for 3D tilt
    const perspectiveStyle = tiltActive
      ? { perspective: "800px", ...style }
      : style;

    // Core motion.div props
    const motionProps = {
      ref,
      className,
      style: { willChange: "transform, opacity", ...perspectiveStyle },
      initial:     initial    ?? "hidden",
      whileInView: whileInView ?? "visible",
      exit:        enableExit ? "exit" : undefined,
      onAnimationComplete: () => {
        if (ref.current) ref.current.style.willChange = "auto";
      },
      viewport: viewport ?? {
        once:   true,
        amount: 0.08,
        margin: "0px 0px -2% 0px",
      },
      transition:  resolvedTransition,
      variants:    resolvedVariants,
      // 3D tilt
      ...(tiltActive && { style: { willChange: "transform, opacity", rotateX, rotateY, ...perspectiveStyle } }),
      onMouseMove:  tiltActive ? onMouseMove  : undefined,
      onMouseLeave: tiltActive ? onMouseLeave : undefined,
      ...rest,
    };

    // Auto-stagger: wrap each child in a stagger-child MotionInView
    if (wrapWithStagger) {
      return (
        <motion.div
          {...motionProps}
          variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants.stagger}
        >
          {Children.map(children, (child, i) => (
            <motion.div
              key={i}
              variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants["stagger-child"]}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return <motion.div {...motionProps}>{children}</motion.div>;
  }
);

MotionInView.displayName = "MotionInView";
export default MotionInView;

// Re-export AnimatePresence for convenience — needed for exit animations
export { AnimatePresence };

// ---------------------------------------------------------------------------
// USAGE EXAMPLES
// ---------------------------------------------------------------------------
//
// Basic (default slide-up):
//   <MotionInView><HeroSection /></MotionInView>
//
// Blur-in (use sparingly — hero titles, featured images):
//   <MotionInView variant="blur-in"><HeroTitle /></MotionInView>
//
// Exit animation (wrap parent with AnimatePresence):
//   <AnimatePresence>
//     {isVisible && (
//       <MotionInView enableExit><Modal /></MotionInView>
//     )}
//   </AnimatePresence>
//
// 3D tilt (disabled auto on mobile):
//   <MotionInView tilt variant="scale"><Card /></MotionInView>
//
// Auto-stagger (no manual stagger-child needed):
//   <MotionInView autoStagger>
//     <Card />
//     <Card />
//     <Card />
//   </MotionInView>
//
// Manual stagger (full control):
//   <MotionInView variant="stagger">
//     {items.map(item => (
//       <MotionInView key={item.id} variant="stagger-child">
//         <Item {...item} />
//       </MotionInView>
//     ))}
//   </MotionInView>