"use client";

/*
 * MotionProvider — framer-motion in its lazy form.
 *
 * Every component imports `m as motion` instead of the full `motion`
 * component, so the animation engine is not bundled into each of them. The
 * engine (domAnimation: animate, exit, hover/tap/focus, whileInView) loads
 * here, once, as its own chunk after the page is interactive. `strict` makes
 * a stray full `motion` import throw in development instead of silently
 * re-adding ~30 KB.
 *
 * The site uses no layout animations or drag; if one is ever added, switch
 * the import in motion-features.ts to domMax.
 */

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
