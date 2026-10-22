/*
 * FadeIn — the site's standard entrance (fade + slide, once, on scroll into
 * view) as a plain element. No "use client": the entrance is played by the
 * inline reveal script (core/reveal.ts), so whatever is wrapped here stays
 * server-rendered HTML and adds nothing to the JavaScript or the hydration.
 */

import type { ReactNode } from "react";
import { rv } from "@/app/core/reveal";

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
    <div className={className} data-reveal={rv({ x, y, delay, duration })}>
      {children}
    </div>
  );
}
