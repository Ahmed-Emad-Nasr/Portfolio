"use client";

/*
 * FadeIn — the site's standard entrance (fade + slide, once, on scroll into
 * view) as a thin client wrapper, so a Server Component can use it without
 * becoming a client component itself. Only this wrapper hydrates; whatever is
 * passed as children stays server-rendered HTML.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/app/core/motion";

export default function FadeIn({
  children,
  className,
  x = 0,
  y = 24,
  delay = 0,
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  x?: number;
  y?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
