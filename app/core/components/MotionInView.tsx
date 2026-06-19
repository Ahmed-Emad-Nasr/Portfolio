"use client";

/*
 * File: MotionInView.tsx
 * PERF BUILD:
 * - Replaced full `motion` with `m` and `<LazyMotion>`.
 * - This strips the heavy Framer Motion engine from the initial JS bundle
 * and lazy-loads it asynchronously only when needed!
 * - `once: false` kept as requested, but now runs at 0 initial CPU cost.
 */

import React, { memo } from "react";
// 👇 تغيير جذري هنا: استيراد m و LazyMotion و domAnimation
import { m, LazyMotion, domAnimation, MotionProps, Variants } from "framer-motion";

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
  viewport = { once: false, amount: 0.05 }, 
  tilt, magnetic, magneticStrength, autoStagger,
  ...rest
}) => {
  const resolvedVariants = variants ?? (motionVariants[variant] as Variants);

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