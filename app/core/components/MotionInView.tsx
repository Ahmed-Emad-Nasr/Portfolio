"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable in-view motion wrapper with configurable viewport behavior
 */

import React, { memo } from "react";
import { motion, MotionProps } from "framer-motion";

type MotionInViewProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const MAX_REVEAL_DURATION = 0.28;
const MAX_REVEAL_DELAY = 0.12;

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
  className,
  threshold: _threshold = 0.1,
  triggerOnce: _triggerOnce = true,
  ...rest
}) => {
  const {
    transition,
    style,
    initial: _initial,
    whileInView: _whileInView,
    animate: _animate,
    exit: _exit,
    variants: _variants,
    ...motionRest
  } = rest;
  const resolvedTransition = softenTransition(transition as MotionProps["transition"]) ?? {
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    // Use mount fade so late-loaded sections still animate reliably.
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={resolvedTransition}
      style={{ ...(style as React.CSSProperties), willChange: "opacity" }}
      {...motionRest}
    >
      {children}
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;