"use client";

/*
 * MotionInView.tsx — FIXED
 *
 * BUG: every single instance wrapped itself in its own <LazyMotion>. The art
 * gallery alone renders up to 50 of them, plus every timeline item and project
 * card — so the page mounted dozens of duplicate feature-providers. LazyMotion
 * is designed to be mounted ONCE near the root.
 *
 * FIX: <MotionProvider> is exported and mounted once in layout.tsx; this
 * component now renders a bare m.div.
 *
 * Also: `once: false` meant every element re-ran its entrance animation every
 * time it scrolled back into view — on a long page that is continuous
 * animation work for the entire scroll. Changed to `once: true`.
 */

import React, { memo } from "react";
import {
  m,
  LazyMotion,
  useReducedMotion,
  type MotionProps,
  type Variants,
} from "framer-motion";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";

/*
 * `domAnimation` كان static import، فالـ ~25KB بتاعته كانت جزء من الـ bundle
 * الأساسي على كل صفحة — بما فيها صفحات البلوج اللي أنيميشناتها أقل.
 *
 * LazyMotion بيقبل دالة بترجّع Promise، فالحزمة بتتحمّل بعد الـ paint الأول
 * بدل ما تتأخّره. الـ m.* components بترندر بحالتها الابتدائية لحد ما توصل،
 * وده بالظبط اللي بيحصل دلوقتي برضه أثناء تحميل الـ bundle — الفرق إن
 * المحتوى بيتعرض أسرع.
 *
 * الدالة بره الكومبوننت عن قصد: لو اتعرّفت جوّه، كل render كان هيبعت
 * مرجع جديد وLazyMotion هيعيد التحميل.
 */
const loadDomAnimation = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

/** Mount ONCE, near the root. Provides features for every m.* below it. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}

export const motionVariants = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "slide-up": { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } },
  "slide-down": { hidden: { opacity: 0, y: -25 }, visible: { opacity: 1, y: 0 } },
  "slide-left": { hidden: { opacity: 0, x: -25 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 25 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
  "scale-up": { hidden: { opacity: 0, scale: 0.96, y: 10 }, visible: { opacity: 1, scale: 1, y: 0 } },
  "text-stagger": { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } },
  "text-word": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  stagger: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
  "stagger-child": { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
} as const;

export type MotionVariantKey = keyof typeof motionVariants;

// `once: true` — animate on first reveal only. See note above.
const DEFAULT_VIEWPORT = { once: true, amount: 0.15 };

type MotionInViewProps = Omit<MotionProps, "variants"> & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: MotionVariantKey;
  variants?: Variants;
  delay?: number;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style">;

const MotionInView = memo<MotionInViewProps>(({
  children,
  className,
  style,
  variant = "slide-up",
  variants,
  delay,
  viewport = DEFAULT_VIEWPORT,
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();
  const tier = useDeviceTier();

  // On a low-tier device, dozens of simultaneous entrance animations are the
  // difference between 60fps and 20fps. Render the content plainly instead —
  // no wrapper animation, no IntersectionObserver, no motion subscription.
  if (tier === "low" || shouldReduceMotion) {
    return (
      <div className={className} style={style} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const resolvedVariants = (variants ?? motionVariants[variant]) as Variants;

  return (
    <m.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={resolvedVariants}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </m.div>
  );
});

MotionInView.displayName = "MotionInView";

export default MotionInView;
export { AnimatePresence } from "framer-motion";