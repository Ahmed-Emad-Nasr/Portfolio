"use client";

import { m as motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MOTION_EASE } from "@/lib/motion";

export default function SlashDivider({
  label,
  japanese,
  origin = "left",
}: {
  label: string;
  japanese: string;
  origin?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.45"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const echo = useTransform(scrollYProgress, [0.15, 1], [0, 1]);
  const primaryOrigin = origin === "left" ? "origin-left" : "origin-right";
  const echoOrigin = origin === "left" ? "origin-right" : "origin-left";

  return (
    <div ref={ref} className="chapter-slash relative z-20 flex h-24 w-full items-center justify-center overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-[0.7deg]">
        <motion.div
          className={`h-[2px] w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0 ${primaryOrigin}`}
          style={{ scaleX: reduce ? 1 : draw }}
          transition={{ ease: MOTION_EASE }}
        />
      </div>
      <div className="absolute inset-x-0 top-1/2 translate-y-[6px] -rotate-[0.7deg]">
        <motion.div
          className={`h-px w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent ${echoOrigin}`}
          style={{ scaleX: reduce ? 1 : echo }}
        />
      </div>
      <span className="relative z-10 flex items-center gap-3 bg-background px-4">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/70" />
        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">{label}</span>
        <span className="brush-jp text-base text-foreground/70" lang="ja">{japanese}</span>
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/70" />
      </span>
    </div>
  );
}
