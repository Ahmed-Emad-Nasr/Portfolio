"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable in-view motion wrapper with configurable viewport behavior
 */

import React, { memo } from "react";
import { motion, MotionProps, useReducedMotion } from "framer-motion";

type MotionInViewProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

// [OPT-8] Hoist the static viewport config object outside the component.
//         Previously a new object literal `{ once, amount }` was allocated on
//         every render; for the default (triggerOnce=true, threshold=0.1) case
//         this is now a single shared reference — zero heap allocation per render.
const DEFAULT_VIEWPORT: MotionProps["viewport"] = { once: true, amount: 0.1 };
const MAX_REVEAL_DURATION = 0.16;
const MAX_REVEAL_DELAY = 0.08;

const softenTransition = (
  transition: MotionProps["transition"] | undefined,
): MotionProps["transition"] | undefined => {
  if (!transition || typeof transition !== "object" || Array.isArray(transition)) {
    return transition;
  }

  const nextTransition = { ...transition } as Record<string, unknown>;

  if (typeof nextTransition.duration === "number") {
    nextTransition.duration = Math.min(nextTransition.duration, MAX_REVEAL_DURATION);
  }

  if (typeof nextTransition.delay === "number") {
    nextTransition.delay = Math.min(nextTransition.delay, MAX_REVEAL_DELAY);
  }

  return nextTransition as MotionProps["transition"];
};

const MotionInView = memo<MotionInViewProps>(({
  children,
  variants,
  className,
  threshold = 0.1,
  triggerOnce = true,
  ...rest
}) => {
  const { transition, ...motionRest } = rest;
  const shouldReduceMotion = useReducedMotion();

  // [OPT-9] Only allocate a new viewport object when the caller passes non-default
  //         values. The common path (defaults) reuses the stable reference above,
  //         which also prevents Framer Motion from running its internal viewport
  //         equality check unnecessarily.
  const viewport: MotionProps["viewport"] =
    triggerOnce === true && threshold === 0.1
      ? DEFAULT_VIEWPORT
      : { once: triggerOnce, amount: threshold };

  return (
    // [OPT-10] Add `style={{ willChange: "opacity, transform" }}` so the browser
    //          promotes this element to its own compositor layer before the
    //          animation fires. Framer Motion animates opacity/transform by
    //          default, so this makes those GPU-composited from the start and
    //          avoids a mid-animation layer-promotion jank.
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={viewport}
      variants={variants}
      transition={softenTransition(transition as MotionProps["transition"])}
      style={{ willChange: "opacity, transform" }}
      {...motionRest}
    >
      {children}
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;