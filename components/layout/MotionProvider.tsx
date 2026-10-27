"use client";

/*
 * framer-motion in its lazy form: components use `m`, and the animation
 * engine (domAnimation) loads once as its own chunk. `strict` makes a stray
 * full `motion` import throw in development. Layout animations or drag
 * would need domMax in motion-features.ts.
 */

import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () => import("@/components/layout/motion-features").then((mod) => mod.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* reducedMotion="user": the OS "reduce motion" setting drops the movement */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
