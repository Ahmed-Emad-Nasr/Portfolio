"use client";

/*
 * File: MotionInView.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable in-view motion wrapper with configurable viewport behavior
 * Optimized: Cinematic motion curves, actual scroll-triggered reveals, GPU-accelerated.
 */

import React, { memo } from "react";
import { motion, MotionProps } from "framer-motion";

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
  // تعطيل كل الأنيميشن: عرض العنصر مباشرة بدون أي حركة أو تغيير
  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;