"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * v3 — cybersecurity HUD additions
 *   + glitch variant      — terminal-error flash (position + opacity)
 *   + typewriter variant  — char-by-char reveal via clip-path
 *   + scan-line variant   — top-to-bottom clip sweep (HUD card reveal)
 *   + magnetic prop       — cursor-follow offset (replaces plain tilt)
 *   + per-variant viewport thresholds
 *   + willChange reset fixed in non-stagger branch
 *   + wrapWithStagger memoisation tightened
 */

import React, {
  Children,
  memo,
  useMemo,
  useRef,
  useCallback,
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

const SPRING_GENTLE  = { type: "spring", stiffness: 60,  damping: 18, mass: 1.0 } as const;
const SPRING_SNAP    = { type: "spring", stiffness: 120, damping: 22, mass: 0.8 } as const;
const TILT_SPRING    = { stiffness: 110, damping: 26, mass: 0.75 };
const MAGNETIC_SPRING = { stiffness: 90, damping: 20, mass: 0.6 };

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
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: 24, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-down": {
    hidden:  { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0,   transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: -20, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-left": {
    hidden:  { opacity: 0, x: -65 },
    visible: { opacity: 1, x: 0,   transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, x: -28, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "slide-right": {
    hidden:  { opacity: 0, x: 65 },
    visible: { opacity: 1, x: 0,  transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, x: 28, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  scale: {
    hidden:  { opacity: 0, scale: 0.84 },
    visible: { opacity: 1, scale: 1,    transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, scale: 0.92, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "scale-up": {
    hidden:  { opacity: 0, scale: 0.75, y: 12 },
    visible: { opacity: 1, scale: 1,    y: 0,   transition: { ...SPRING_SNAP } },
    exit:    { opacity: 0, scale: 0.88,         transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "blur-in": {
    hidden:  { opacity: 0, filter: "blur(16px)", scale: 1.06 },
    visible: { opacity: 1, filter: "blur(0px)",  scale: 1,    transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
    exit:    { opacity: 0, filter: "blur(10px)", scale: 0.97, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  reveal: {
    hidden:  { clipPath: "inset(0 0 100% 0)", opacity: 1 },
    visible: { clipPath: "inset(0 0 0% 0)",   opacity: 1, transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
    exit:    { clipPath: "inset(0 0 100% 0)", opacity: 1, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  "reveal-left": {
    hidden:  { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    visible: { clipPath: "inset(0 0% 0 0)",   opacity: 1, transition: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO } },
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
    exit:    { transition: { staggerChildren: 0.03,  staggerDirection: -1 } },
  } satisfies Variants,

  "text-word": {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0,   transition: { ...SPRING_SNAP } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.25, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
    exit:    { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
  } satisfies Variants,

  "stagger-child": {
    hidden:  { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0,  transition: { ...SPRING_GENTLE, delay: 0.05 } },
    exit:    { opacity: 0, y: 14, transition: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC } },
  } satisfies Variants,

  // -------------------------------------------------------------------------
  // v3 additions
  // -------------------------------------------------------------------------

  /**
   * glitch
   * Terminal-error aesthetic — rapid x/opacity flicker on entry.
   * Use on headings, labels, status chips.
   * CSS class `.glitch-text` can layer a pseudo-element duplicate for
   * the full RGB-split look if desired.
   */
  glitch: {
    hidden:  { opacity: 0, x: 0 },
    visible: {
      opacity: [0, 1, 0.7, 1, 0.85, 1],
      x:       [0, -6, 4, -3, 2, 0],
      transition: {
        duration:   0.55,
        ease:       "linear",
        times:      [0, 0.15, 0.30, 0.50, 0.75, 1],
      },
    },
    exit: {
      opacity: [1, 0.6, 0],
      x:       [0, 5, -3],
      transition: { duration: 0.3, ease: "linear", times: [0, 0.5, 1] },
    },
  } satisfies Variants,

  /**
   * typewriter
   * Reveals text left-to-right via clip-path — no JS char splitting needed.
   * Pair with a monospace / cyber font for full effect.
   * A blinking cursor can be added via CSS `::after` on the parent.
   */
  typewriter: {
    hidden:  { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      opacity:  1,
      transition: {
        clipPath: { duration: 1.4, ease: [0.1, 0, 0.2, 1] },
        // Slight flicker at start for authenticity
        opacity:  { duration: 0.05 },
      },
    },
    exit: {
      clipPath: "inset(0 100% 0 0)",
      transition: { duration: 0.35, ease: EASE_IN_CUBIC },
    },
  } satisfies Variants,

  /**
   * scan-line
   * Element materialises via a top-to-bottom scan sweep.
   * Perfect for HUD cards, project cards, terminal panels.
   * Combines clip-path sweep with a subtle brightness pulse.
   */
  "scan-line": {
    hidden:  {
      clipPath:  "inset(0 0 100% 0)",
      opacity:   1,
      filter:    "brightness(2)",
    },
    visible: {
      clipPath: "inset(0 0 0% 0)",
      opacity:  1,
      filter:   "brightness(1)",
      transition: {
        clipPath: { duration: MOTION_DURATIONS.slow, ease: EASE_OUT_EXPO },
        filter:   { duration: MOTION_DURATIONS.medium, ease: EASE_FADE, delay: 0.1 },
      },
    },
    exit: {
      clipPath: "inset(0 0 100% 0)",
      filter:   "brightness(1.5)",
      transition: {
        clipPath: { duration: MOTION_DURATIONS.fast, ease: EASE_IN_CUBIC },
        filter:   { duration: 0.2 },
      },
    },
  } satisfies Variants,

} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// ---------------------------------------------------------------------------
// 4. Per-variant viewport config
//    reveal-based variants need more of the element visible before triggering.
// ---------------------------------------------------------------------------

const REVEAL_VARIANTS = new Set<MotionVariantKey>([
  "reveal", "reveal-left", "scan-line", "typewriter",
]);

function getViewport(variant: MotionVariantKey) {
  return REVEAL_VARIANTS.has(variant)
    ? { once: true, amount: 0.20, margin: "0px 0px -3% 0px" } as const
    : { once: true, amount: 0.07, margin: "0px 0px -3% 0px" } as const;
}

// ---------------------------------------------------------------------------
// 5. Reduced-motion fallback
// ---------------------------------------------------------------------------

const REDUCED_VARIANTS: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MOTION_DURATIONS.instant } },
  exit:    { opacity: 0, transition: { duration: MOTION_DURATIONS.instant } },
};

// ---------------------------------------------------------------------------
// 6. Touch-device detection — once at module load
// ---------------------------------------------------------------------------

const IS_TOUCH_DEVICE =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// ---------------------------------------------------------------------------
// 7. 3D Tilt hook (unchanged from v2)
// ---------------------------------------------------------------------------

function useTilt(enabled: boolean) {
  const active  = enabled && !IS_TOUCH_DEVICE;
  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [7, -7]),  TILT_SPRING);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-7, 7]), TILT_SPRING);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width  - 0.5);
    rawY.set((e.clientY - r.top)  / r.height - 0.5);
  }, [active, rawX, rawY]);

  const onMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  return { active, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// 8. Magnetic hook (v3)
//    Subtle cursor-follow offset — element drifts toward cursor.
//    Stronger than tilt, less than a full magnet.
//    Disables on touch devices.
// ---------------------------------------------------------------------------

function useMagnetic(enabled: boolean, strength = 0.35) {
  const active = enabled && !IS_TOUCH_DEVICE;
  const rawX   = useMotionValue(0);
  const rawY   = useMotionValue(0);
  const x      = useSpring(rawX, MAGNETIC_SPRING);
  const y      = useSpring(rawY, MAGNETIC_SPRING);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const r      = e.currentTarget.getBoundingClientRect();
    const cx     = r.left + r.width  / 2;
    const cy     = r.top  + r.height / 2;
    rawX.set((e.clientX - cx) * strength);
    rawY.set((e.clientY - cy) * strength);
  }, [active, rawX, rawY, strength]);

  const onMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  return { active, x, y, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// 9. Component types
// ---------------------------------------------------------------------------

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children:        React.ReactNode;
  className?:      string;
  style?:          React.CSSProperties;
  variant?:        MotionVariantKey;
  variants?:       Variants;
  delay?:          number;
  enableExit?:     boolean;
  tilt?:           boolean;
  /** Magnetic cursor-follow offset. Stronger vibe than tilt. */
  magnetic?:       boolean;
  /** Magnetic pull strength — default 0.35 (subtle). */
  magneticStrength?: number;
  autoStagger?:    boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

// ---------------------------------------------------------------------------
// 10. Component
// ---------------------------------------------------------------------------

const MotionInView = memo<MotionInViewProps>(
  ({
    children,
    className,
    style,
    variant          = "slide-up",
    variants,
    delay,
    initial,
    whileInView,
    viewport,
    transition,
    enableExit       = false,
    tilt             = false,
    magnetic         = false,
    magneticStrength = 0.35,
    autoStagger      = false,
    ...rest
  }) => {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);

    // Only one of tilt / magnetic active at once; magnetic takes priority
    const { active: magActive, x: magX, y: magY,
            onMouseMove: magMove, onMouseLeave: magLeave } = useMagnetic(magnetic, magneticStrength);

    const { active: tiltActive, rotateX, rotateY,
            onMouseMove: tiltMove, onMouseLeave: tiltLeave } = useTilt(tilt && !magActive);

    const resolvedVariants =
      variants ?? (prefersReducedMotion ? REDUCED_VARIANTS : motionVariants[variant]);

    const resolvedTransition = useMemo(
      () => delay ? { ...(transition ?? {}), delay } : transition,
      [delay, transition],
    );

    // v3 fix: tighten deps — only recompute when child count changes
    const childCount = Children.count(children);
    const wrapWithStagger = useMemo(() => {
      if (!autoStagger || variant === "stagger" || variant === "stagger-child") return false;
      return childCount > 1;
    }, [autoStagger, variant, childCount]);

    const resolvedViewport = viewport ?? getViewport(variant);

    // Build composite style
    const baseStyle = useMemo<React.CSSProperties>(
      () => ({ willChange: "transform, opacity", ...style }),
      [style],
    );

    const perspectiveStyle = useMemo<React.CSSProperties>(
      () => tiltActive ? { perspective: "900px", ...baseStyle } : baseStyle,
      [tiltActive, baseStyle],
    );

    // v3 fix: willChange reset fires in BOTH branches
    const onComplete = useCallback(() => {
      if (ref.current) ref.current.style.willChange = "auto";
    }, []);

    // Merged event handlers (magnetic wins over tilt)
    const handlers = useMemo(() => ({
      onMouseMove:  magActive ? magMove  : tiltActive ? tiltMove  : undefined,
      onMouseLeave: magActive ? magLeave : tiltActive ? tiltLeave : undefined,
    }), [magActive, magMove, magLeave, tiltActive, tiltMove, tiltLeave]);

    // Motion style: magnetic = x/y translate, tilt = rotateX/Y
    const motionStyle = useMemo(() => {
      if (magActive)  return { ...perspectiveStyle, x: magX, y: magY };
      if (tiltActive) return { ...perspectiveStyle, rotateX, rotateY };
      return perspectiveStyle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [magActive, tiltActive, perspectiveStyle]);

    if (wrapWithStagger) {
      return (
        <motion.div
          ref={ref}
          className={className}
          style={motionStyle}
          initial="hidden"
          whileInView="visible"
          exit={enableExit ? "exit" : undefined}
          onAnimationComplete={onComplete}
          viewport={resolvedViewport}
          variants={prefersReducedMotion ? REDUCED_VARIANTS : motionVariants.stagger}
          {...handlers}
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
        style={motionStyle}
        initial={initial ?? "hidden"}
        whileInView={whileInView ?? "visible"}
        exit={enableExit ? "exit" : undefined}
        onAnimationComplete={onComplete}
        viewport={resolvedViewport}
        transition={resolvedTransition}
        variants={resolvedVariants}
        {...handlers}
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