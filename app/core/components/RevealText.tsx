"use client";

import { motion } from "framer-motion";
import { EASE } from "@/app/core/motion";

/**
 * Word-by-word masked reveal for headings.
 * Non-latin strings stay whole (no per-char splitting for JP text).
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

  /* Reduced motion is handled in CSS (.reveal-word in globals.css), not by
     rendering different markup here: branching on matchMedia during render
     gave reduced-motion visitors a server/client mismatch (React #418) and a
     full client re-render of every heading. */

  return (
    <MTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {/* The animated words are aria-hidden; this is what assistive tech reads
          (aria-label is not allowed on a plain span) */}
      <span className="sr-only">{text}</span>
      {units.map((u, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
          aria-hidden="true"
        >
          <motion.span
            className="reveal-word inline-block will-change-transform"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
            }}
          >
            {u}
            {isLatin && i < units.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MTag>
  );
}
