"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * v2 — improved animations, zero breaking changes, no TextReveal (avoids JSX namespace issue)
 */

import React, {
  Children,
  memo,
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
// 1. Easing curves
// ---------------------------------------------------------------------------

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_FADE:     [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_IN_CUBIC: [number, number, number, number] = [0.55, 0, 1, 0.45];

const MOTION_DURATIONS = {
  instant:   0.01,
  fast:      0.55,
  medium:    0.85,
  slow:      1.2,
} as const;

// ---------------------------------------------------------------------------
// 2. Spring configs
// ---------------------------------------------------------------------------

const SPRING_GENTLE = { type: "spring", stiffness: 60, damping: 18, mass: 1.0 } as const;
const SPRING_SNAP   = { type: "spring", stiffness: 120, damping: 22, mass: 0.8 } as const;
const TILT_SPRING   = { stiffness: 110, damping: 26, mass: 0.75 };

// ---------------------------------------------------------------------------
// 3. Variant library
// ---------------------------------------------------------------------------

export const motionVariants = {

  fade: {
    hidden:  { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: MOTION_DURATIONS.medium, ease: EASE_FADE } },
    exit:    { opacity: 0, y: -4, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-up": {
    hidden:  { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: 24, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-down": {
    hidden:  { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: -20, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-left": {
    hidden:  { opacity: 0, x: -65 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, x: -28, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-right": {
    hidden:  { opacity: 0, x: 65 },
    visible: { opacity: 1, x: 0, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, x: 28, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  scale: {
    hidden:  { opacity: 0, scale: 0.84 },
    visible: { opacity: 1, scale: 1, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, scale: 0.92, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "scale-up": {
    hidden:  { opacity: 0, scale: 0.75, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING_SNAP } },
    exit:    { opacity: 0, scale: 0.88, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "blur-in": {
    hidden:  { opacity: 0, filter: "blur(16px)", scale: 1.06 },
    visible: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
    exit:    { opacity: 0, filter: "blur(10px)", scale: 0.97, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  reveal: {
    hidden:  { clipPath: "inset(0 0 100% 0)", opacity: 1 },
    visible: { clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
    exit:    { clipPath: "inset(0 0 100% 0)", opacity: 1, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "reveal-left": {
    hidden:  { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    visible: { clipPath: "inset(0 0% 0 0)", opacity: 1, transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
    exit:    { clipPath: "inset(0 100% 0 0)", opacity: 1, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  float: {
    hidden:  { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: [0, -10, 0],
      transition: {
        opacity: { duration: MOTION_DURATIONS.medium, ease: EASE_FADE },
        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatType: "loop" },
      },
    },
    exit: { opacity: 0, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "text-stagger": {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
    exit:    { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  } satisfies Variants,

  "text-word": {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_SNAP } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.25, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
    exit:    { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
  } satisfies Variants,

  "stagger-child": {
    hidden:  { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: 14, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// ---------------------------------------------------------------------------
// 4. Reduced-motion fallback
// ---------------------------------------------------------------------------

const REDUCED_VARIANTS: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.instant } },
  exit:    { opacity: 0, transition: { duration: MOTION_DURATIONS.instant } },
};

// ---------------------------------------------------------------------------
// 5. Touch-device detection — once at module load
// ---------------------------------------------------------------------------

const IS_TOUCH_DEVICE =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// ---------------------------------------------------------------------------
// 6. 3D Tilt hook
// ---------------------------------------------------------------------------

function useTilt(enabled: boolean) {
  const active  = enabled && !IS_TOUCH_DEVICE;
  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [7, -7]), TILT_SPRING);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-7, 7]), TILT_SPRING);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width  - 0.5);
    rawY.set((e.clientY - r.top)  / r.height - 0.5);
  };

  const onMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return { active, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// 7. Viewport config
// ---------------------------------------------------------------------------

const DEFAULT_VIEWPORT = { once: true, amount: 0.07, margin: "0px 0px -3% 0px" } as const;

// ---------------------------------------------------------------------------
// 8. Component types
// ---------------------------------------------------------------------------

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children:     React.ReactNode;
  className?:   string;
  style?:       React.CSSProperties;
  variant?:     MotionVariantKey;
  variants?:    Variants;
  delay?:       number;
  enableExit?:  boolean;
  tilt?:        boolean;
  autoStagger?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

// ---------------------------------------------------------------------------
// 9. Component
// ---------------------------------------------------------------------------

const MotionInView = memo<MotionInViewProps>(
  ({
    children,
    className,
    style,
    variant     = "slide-up",
    variants,
    delay,
    initial,
    whileInView,
    viewport,
    transition,
    enableExit  = false,
    tilt        = false,
    autoStagger = false,
    ...rest
  }) => {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { active: tiltActive, rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(tilt);

    const resolvedVariants =
      variants ?? (prefersReducedMotion ? REDUCED_VARIANTS : motionVariants[variant]);

    const resolvedTransition = useMemo(
      () => delay ? { ...(transition ?? {}), delay } : transition,
      [delay, transition],
    );

    const wrapWithStagger = useMemo(() => {
      if (!autoStagger || variant === "stagger" || variant === "stagger-child") return false;
      return Children.count(children) > 1;
    }, [autoStagger, variant, children]);

    const perspectiveStyle = useMemo(
      () => tiltActive ? { perspective: "900px", ...style } : style,
      [tiltActive, style],
    );

    const baseStyle = useMemo(
      () => ({ willChange: "transform, opacity" as const, ...perspectiveStyle }),
      [perspectiveStyle],
    );

    const tiltStyle = useMemo(
      () => tiltActive ? { ...baseStyle, rotateX, rotateY } : baseStyle,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tiltActive, baseStyle],
    );

    const onComplete = () => {
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
          onAnimationComplete={onComplete}
          viewport={viewport ?? DEFAULT_VIEWPORT}
          variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants.stagger}
          onMouseMove={tiltActive ? onMouseMove : undefined}
          onMouseLeave={tiltActive ? onMouseLeave : undefined}
          {...rest}
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

    return (
      <motion.div
        ref={ref}
        className={className}
        style={tiltStyle}
        initial={initial ?? "hidden"}
        whileInView={whileInView ?? "visible"}
        exit={enableExit ? "exit" : undefined}
        onAnimationComplete={onComplete}
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
  },
);

MotionInView.displayName = "MotionInView";
export default MotionInView;
export { AnimatePresence };