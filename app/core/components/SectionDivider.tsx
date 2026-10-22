"use client";

import { m as motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface SectionDividerProps {
  text?: string;
  reverse?: boolean;
  angle?: number;
}

/**
 * Noren divider  a calm black banner with a red katana edge.
 * Brush Japanese drifts with page scroll; small red diamonds
 * mark the 3OMDA seal. No hazard stripes, no flicker.
 */
export default function SectionDivider({
  text = "武士道 • 継続は力なり • 改善 • 不撓不屈 • 七転八起",
  reverse = false,
  angle = -1,
}: SectionDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? ["-25%", "0%"] : ["0%", "-25%"]
  );

  return (
    <div
      ref={containerRef}
      className="relative z-20 flex h-20 md:h-24 w-full items-center overflow-hidden border-y border-foreground/10 bg-background/70 backdrop-blur-sm"
      style={{
        transform: `rotate(${angle}deg) scale(1.05)`,
        margin: "2.5rem 0",
      }}
    >
      {/* Katana edges */}
      <div
        className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden="true"
      />

      <motion.div
        style={{ x }}
        className="relative flex items-center gap-10 whitespace-nowrap select-none"
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="brush-jp text-2xl md:text-3xl text-foreground/35" lang="ja" aria-hidden="true" data-jp={text} />
            <span className="flex items-center gap-2.5" aria-hidden="true">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/80" />
              <span className="font-mono text-[0.625rem] font-bold tracking-[0.45em] text-primary-ink">
                3OMDA
              </span>
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/80" />
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
