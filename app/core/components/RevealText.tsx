"use client";

import { m as motion } from "framer-motion";
import { EASE } from "@/app/core/motion";

/**
 * Word-by-word masked reveal for headings (Sensei-Dev's).
 * Non-latin strings stay whole (no per-char splitting for JP text).
 * Reduced motion: MotionConfig reducedMotion="user" (MotionProvider) drops
 * the slide, so the words simply show. (Branching on the setting here
 * rendered different markup than the server and broke hydration.)
 */
export function RevealText({
  text,
  className,
  style,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const isLatin = /^[\x00-\x7F\s]*$/.test(text);
  const units = isLatin ? text.split(" ") : [text];
  const MTag = motion[Tag] as typeof motion.span;

  return (
    <MTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {/* What assistive tech reads; the moving words are hidden from it */}
      <span className="sr-only">{text}</span>
      {units.map((u, i) => (
        /* Clipped at the bottom only: overflow-hidden also cut the last
           letter of each word on the right ("AHMED" read "AHME|") */
        <span
          key={i}
          className="inline-block [clip-path:inset(-0.5em_-0.5em_0_-0.5em)] pb-[0.08em] -mb-[0.08em] align-bottom"
          aria-hidden="true"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
            }}
          >
            {u}
            {isLatin && i < units.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MTag>
  );
}
