"use client";

import React, { memo } from "react";
import { motion, MotionProps } from "framer-motion";

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

const MotionInView = memo<MotionInViewProps>(({
  children,
  variants,
  className,
  threshold = 0.1,
  triggerOnce = true,
  ...rest
}) => {
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
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      style={{ willChange: "opacity, transform" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

MotionInView.displayName = "MotionInView";
export default MotionInView;