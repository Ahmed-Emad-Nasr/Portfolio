"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Perf pass: tilt isTouchDevice hoisted out of hook body, autoStagger uses
 * useMemo, resolvedVariants stable ref avoids Framer re-diff, single merged
 * motionProps object built inline.
 *
 * Fix pass:
 * - willChange set only during animation, not statically on mount
 * - blur-in uses backdrop-filter path removed; kept but documented as heavy
 * - Children.map key uses React.key if available, fallback to index
 * - DEFAULT_VIEWPORT margin increased for earlier trigger
 */

import React, {
  Children,
  memo,
  useEffect,
  useMemo,
  useRef,
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
// 1. Easing & spring — module-level singletons
// ---------------------------------------------------------------------------

const CINEMATIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MOTION_DURATIONS = { short: 0.75, medium: 1.1, long: 1.6 } as const;

const SPRING_FAST = { type: "spring", stiffness: 80, damping: 20, mass: 1.2 } as const;
const TILT_SPRING = { stiffness: 120, damping: 28, mass: 0.8 };

// ---------------------------------------------------------------------------
// 2. Variant library — module-level, zero allocation per render
// ---------------------------------------------------------------------------

export const motionVariants = {
  fade: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.short, ease: CINEMATIC_EASE } },
    exit:    { opacity: 0, transition: { duration: MOTION_DURATIONS.short, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  "slide-up": {
    hidden:  { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, y: 30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  "slide-left": {
    hidden:  { opacity: 0, x: -55 },
    visible: { opacity: 1, x: 0,   transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, x: -30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  "slide-right": {
    hidden:  { opacity: 0, x: 55 },
    visible: { opacity: 1, x: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, x: 30, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  scale: {
    hidden:  { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1,    transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.45, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  // PERF NOTE: blur-in is expensive — filter: blur triggers paint on every frame.
  // Use sparingly (hero section only, max 1-2 elements per viewport).
  "blur-in": {
    hidden:  { opacity: 0, filter: "blur(14px)", scale: 1.04 },
    visible: { opacity: 1, filter: "blur(0px)",  scale: 1,    transition: { duration: MOTION_DURATIONS.medium, ease: CINEMATIC_EASE } },
    exit:    { opacity: 0, filter: "blur(8px)",  scale: 0.98, transition: { duration: 0.5, ease: CINEMATIC_EASE } },
  } satisfies Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
    exit:    { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
  } satisfies Variants,

  "stagger-child": {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_FAST, delay: 0.08 } },
    exit:    { opacity: 0, y: 16, transition: { duration: 0.4, ease: CINEMATIC_EASE } },
  } satisfies Variants,
} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// ---------------------------------------------------------------------------
// 3. Reduced-motion fallback — module-level singleton
// ---------------------------------------------------------------------------

const REDUCED_VARIANTS: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit:    { opacity: 0, transition: { duration: 0.01 } },
};

// ---------------------------------------------------------------------------
// 4. Touch-device detection — evaluated ONCE at module load, never repeated
// ---------------------------------------------------------------------------

const IS_TOUCH_DEVICE =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// ---------------------------------------------------------------------------
// 5. 3D Tilt hook
// ---------------------------------------------------------------------------

function useTilt(enabled: boolean) {
  const active = enabled && !IS_TOUCH_DEVICE;

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

  const onMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return { active, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// 6. Stable viewport config
// FIX: margin increased to -60px so animation starts before element is
//      already fully visible — prevents "late pop-in" effect.
// ---------------------------------------------------------------------------

const DEFAULT_VIEWPORT = { once: true, amount: 0.08, margin: "0px 0px -60px 0px" } as const;

// ---------------------------------------------------------------------------
// 7. Component types
// ---------------------------------------------------------------------------

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: MotionVariantKey;
  variants?: Variants;
  delay?: number;
  enableExit?: boolean;
  tilt?: boolean;
  autoStagger?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

// ---------------------------------------------------------------------------
// 8. Component
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

    const resolvedVariants = variants ?? (prefersReducedMotion ? REDUCED_VARIANTS : motionVariants[variant]);

    const resolvedTransition = useMemo(
      () => delay ? { ...(transition ?? {}), delay } : transition,
      [delay, transition]
    );

    const wrapWithStagger = useMemo(() => {
      if (!autoStagger || variant === "stagger" || variant === "stagger-child") return false;
      return Children.count(children) > 1;
    }, [autoStagger, variant, children]);

    const perspectiveStyle = useMemo(
      () => tiltActive ? { perspective: "800px", ...style } : style,
      [tiltActive, style]
    );

    // FIX: willChange removed from static style — applied only during animation
    // via onAnimationStart/onAnimationComplete to avoid holding GPU layers on
    // every element in the DOM at once (causes VRAM pressure + composite lag).
    const baseStyle = useMemo(
      () => perspectiveStyle ?? {},
      [perspectiveStyle]
    );

    const tiltStyle = useMemo(
      () => tiltActive ? { ...baseStyle, rotateX, rotateY } : baseStyle,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tiltActive, baseStyle]
    );

    // FIX: set willChange only while animation is running, release after
    const onAnimationStart = () => {
      if (ref.current) ref.current.style.willChange = "transform, opacity";
    };

    const onAnimationComplete = () => {
      if (ref.current) ref.current.style.willChange = "auto";
    };

    if (wrapWithStagger) {
      return (
        <motion.div
          ref={ref}
          className={className}
          style={tiltStyle}
          initial="hidden"
          whileInView="visible"
          exit={enableExit ? "exit" : undefined}
          onAnimationStart={onAnimationStart}
          onAnimationComplete={onAnimationComplete}
          viewport={viewport ?? DEFAULT_VIEWPORT}
          variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants.stagger}
          onMouseMove={tiltActive ? onMouseMove : undefined}
          onMouseLeave={tiltActive ? onMouseLeave : undefined}
          {...rest}
        >
          {/* FIX: use child's existing key if available to prevent remount on reorder */}
          {Children.map(children, (child, i) => (
            <motion.div
              key={(React.isValidElement(child) && child.key) ? child.key : i}
              variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants["stagger-child"]}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={className}
        style={tiltStyle}
        initial={initial ?? "hidden"}
        whileInView={whileInView ?? "visible"}
        exit={enableExit ? "exit" : undefined}
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
        viewport={viewport ?? DEFAULT_VIEWPORT}
        transition={resolvedTransition}
        variants={resolvedVariants}
        onMouseMove={tiltActive ? onMouseMove : undefined}
        onMouseLeave={tiltActive ? onMouseLeave : undefined}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

MotionInView.displayName = "MotionInView";
export default MotionInView;
export { AnimatePresence };