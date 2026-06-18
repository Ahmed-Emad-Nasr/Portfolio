"use client";

/*
 * File: MotionInView.tsx
 * PERF BUILD:
 * - `once: false` added to viewport to trigger animations EVERY time the element enters the screen.
 * - Stripped heavy CPU/GPU variants and DOM bloat.
 */

import React, { memo } from "react";
import { motion, MotionProps, Variants } from "framer-motion";

// ---------------------------------------------------------------------------
// 1. Ultra-Lightweight Variant Library
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 2. Component Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 3. Component
// ---------------------------------------------------------------------------

const MotionInView = memo<MotionInViewProps>(({
  children,
  className,
  style,
  variant = "slide-up",
  variants,
  delay,
  enableExit = false,
  // 👇 هنا التعديل: جعلنا once تساوي false
  viewport = { once: false, amount: 0.05 }, 
  tilt, magnetic, magneticStrength, autoStagger,
  ...rest
}) => {
  const resolvedVariants = variants ?? (motionVariants[variant] as Variants);

  return (
    <motion.div
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
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";

export default MotionInView;
export { AnimatePresence } from "framer-motion";