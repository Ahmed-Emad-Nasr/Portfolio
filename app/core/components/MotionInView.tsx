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
const DEFAULT_DURATION = 0.6;

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
  // 2. دمج الأنيميشن المخصص مع الـ Cinematic Defaults بذكاء
  const resolvedTransition: MotionProps["transition"] = {
    duration: DEFAULT_DURATION,
    ease: CINEMATIC_EASE,
    ...(typeof transition === "object" ? transition : {}),
  };

  // 3. حركة افتراضية (Fade Up) ناعمة جداً في حال لم يتم تمرير خصائص
  const defaultInitial = { opacity: 0, y: 15 };
  const defaultWhileInView = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      // تفعيل خصائص الـ Variants لو موجودة، غير كده نستخدم الديفولت
      initial={variants ? initial : (initial ?? defaultInitial)}
      // استخدام whileInView الحقيقية عشان العنصر يظهر بس لما اليوزر يوصّله
      whileInView={variants ? whileInView : (whileInView ?? defaultWhileInView)}
      // margin: "-40px" معناه إن العنصر يبدأ حركة لما يظهر منه 40 بيكسل على الشاشة
      viewport={viewport ?? { once: true, margin: "-40px" }}
      transition={resolvedTransition}
      variants={variants}
      // تفعيل كارت الشاشة للحركة والشفافية
      style={{ ...style, willChange: "opacity, transform" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;