"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable in-view motion wrapper with configurable viewport behavior
 * Optimized: Cinematic motion curves, actual scroll-triggered reveals, GPU-accelerated.
 */

import React, { memo } from "react";
import { motion, MotionProps, useReducedMotion } from "framer-motion";
import { fastSpring, revealVariants } from "@/app/core/motion";

type MotionInViewProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

// 1. تحديد نوع المصفوفة بـ 4 أرقام بالضبط لحل مشكلة الـ TypeScript Build
const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DEFAULT_DURATION = 1.2;

const MotionInView = memo<MotionInViewProps>(({
  children,
  className,
  initial,
  whileInView,
  viewport,
  transition,
  variants,
  style,
  ...rest
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={initial ?? (variants ? undefined : "hidden")}
      whileInView={whileInView ?? (variants ? undefined : "visible")}
      viewport={viewport ?? { once: true, amount: 0.22, margin: "0px 0px -12% 0px" }}
      transition={transition ?? fastSpring}
      variants={variants ?? revealVariants}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;